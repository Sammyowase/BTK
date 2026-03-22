import { useEffect, useEffectEvent, useState } from 'react'
import { BrowserProvider, Contract, ethers } from 'ethers'
import toast from 'react-hot-toast'
import { DEPLOYMENTS, MY_TOKEN_ABI, type Deployment, type FaucetSnapshot } from '../lib/contract'
import { extractErrorMessage, formatCountdown } from '../lib/format'
import type { EthereumWindow } from '../types/ethereum'

function getEthereum() {
  const ethereum = (window as EthereumWindow).ethereum

  if (!ethereum?.request) {
    return null
  }

  return ethereum as ethers.Eip1193Provider & NonNullable<typeof ethereum>
}

type SyncContext = {
  account: string
  chainId: number
  provider: BrowserProvider
}

export function useFaucet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [snapshot, setSnapshot] = useState<FaucetSnapshot | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false)
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now() / 1000))

  const deployment = chainId ? DEPLOYMENTS[chainId] ?? null : null
  const isConnected = Boolean(account && provider)
  const isSupportedNetwork = Boolean(deployment)
  const isOwner =
    Boolean(account && snapshot?.owner) && account?.toLowerCase() === snapshot?.owner.toLowerCase()
  const remainingTime = snapshot
    ? Math.max(snapshot.nextRequestTime - currentTimestamp, 0)
    : 0
  const canRequest = snapshot ? snapshot.canRequest || remainingTime === 0 : false
  const countdownText = formatCountdown(remainingTime)

  const refreshSnapshot = useEffectEvent(async ({ account, chainId, provider }: SyncContext) => {
    const activeDeployment = DEPLOYMENTS[chainId]
    setChainId(chainId)
    setAccount(account)
    setProvider(provider)

    if (!activeDeployment) {
      setSnapshot(null)
      return
    }

    const contract = new Contract(activeDeployment.address, MY_TOKEN_ABI, provider)
    const [
      name,
      symbol,
      owner,
      faucetAmount,
      totalSupply,
      maxSupply,
      balance,
      canRequest,
      nextRequestTime,
    ] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.owner(),
      contract.faucetAmount(),
      contract.totalSupply(),
      contract.MAX_SUPPLY(),
      contract.balanceOf(account),
      contract.canRequestToken(account),
      contract.getNextRequestTime(account),
    ])

    setSnapshot({
      balance,
      canRequest,
      faucetAmount,
      maxSupply,
      name,
      nextRequestTime: Number(nextRequestTime),
      owner,
      symbol,
      totalSupply,
    })
  })

  const syncWallet = useEffectEvent(async (requestAccounts: boolean) => {
    const ethereum = getEthereum()
    if (!ethereum) {
      return
    }

    const browserProvider = new BrowserProvider(ethereum)
    const method = requestAccounts ? 'eth_requestAccounts' : 'eth_accounts'
    const accounts = (await browserProvider.send(method, [])) as string[]

    if (accounts.length === 0) {
      setAccount(null)
      setChainId(null)
      setSnapshot(null)
      setProvider(null)
      return
    }

    const network = await browserProvider.getNetwork()
    await refreshSnapshot({
      account: accounts[0],
      chainId: Number(network.chainId),
      provider: browserProvider,
    })
  })

  useEffect(() => {
    void syncWallet(false)
  }, [syncWallet])

  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) {
      return
    }

    const handleAccountsChanged = () => {
      void syncWallet(false)
    }
    const handleChainChanged = () => {
      void syncWallet(false)
    }

    ethereum.on?.('accountsChanged', handleAccountsChanged)
    ethereum.on?.('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [syncWallet])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  async function connectWallet() {
    const ethereum = getEthereum()
    if (!ethereum) {
      toast.error('No injected wallet was found. Open this app in MetaMask or another EVM wallet browser.')
      return
    }

    try {
      setIsConnecting(true)
      await syncWallet(true)
      toast.success('Wallet connected successfully.')
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsConnecting(false)
    }
  }

  async function switchNetwork(targetChainId: number) {
    const ethereum = getEthereum()
    if (!ethereum) {
      toast.error('No injected wallet was found. Open this app in MetaMask or another EVM wallet browser.')
      return
    }

    const targetDeployment = DEPLOYMENTS[targetChainId]
    if (!targetDeployment) {
      toast.error('That network is not configured in this app yet.')
      return
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetDeployment.chainHex }],
      })
      await syncWallet(false)
      toast.success(`Switched to ${targetDeployment.label}.`)
    } catch (error) {
      const switchCode =
        typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number'
          ? error.code
          : null

      if (switchCode === 4902) {
        if (
          targetDeployment.rpcUrls &&
          targetDeployment.nativeCurrency &&
          targetDeployment.blockExplorerUrls
        ) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: targetDeployment.chainHex,
                  chainName: targetDeployment.chainName,
                  rpcUrls: targetDeployment.rpcUrls,
                  blockExplorerUrls: targetDeployment.blockExplorerUrls,
                  nativeCurrency: targetDeployment.nativeCurrency,
                },
              ],
            })
            await syncWallet(false)
            toast.success(`${targetDeployment.label} added and selected.`)
            return
          } catch (addError) {
            toast.error(extractErrorMessage(addError))
            return
          }
        }

        toast.error(
          `Your wallet does not know ${targetDeployment.label} yet. Please add chain ${targetDeployment.chainId} manually, then try again.`,
        )
        return
      }

      toast.error(extractErrorMessage(error))
    }
  }

  async function refreshData() {
    if (!isConnected || !provider || !account || !chainId) {
      if (!getEthereum()) {
        toast.error('Connect an injected wallet first.')
      }
      return
    }

    try {
      setIsRefreshing(true)
      await refreshSnapshot({ account, chainId, provider })
      toast.success('Contract data refreshed.')
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsRefreshing(false)
    }
  }

  async function getWritableContract() {
    if (!provider || !account || !chainId || !deployment) {
      throw new Error('Connect a supported wallet network first.')
    }

    const signer = await provider.getSigner()
    return new Contract(deployment.address, MY_TOKEN_ABI, signer)
  }

  async function claimToken() {
    if (!canRequest) {
      toast.error('This wallet is still on cooldown.')
      return
    }

    try {
      setIsClaiming(true)
      const contract = await getWritableContract()
      const txPromise = contract.requestToken()
      toast.promise(
        txPromise.then((tx: ethers.ContractTransactionResponse) => tx.wait()),
        {
          loading: 'Submitting claim transaction...',
          success: 'BTK claimed successfully.',
          error: (error) => extractErrorMessage(error),
        },
      )
      await (await txPromise).wait()
      await refreshData()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsClaiming(false)
    }
  }

  async function mintTokens(recipient: string, amount: string) {
    if (!ethers.isAddress(recipient)) {
      toast.error('Enter a valid recipient address.')
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid mint amount.')
      return
    }

    try {
      setIsSubmittingAdmin(true)
      const contract = await getWritableContract()
      const txPromise = contract.mint(recipient, ethers.parseUnits(amount, 18))
      toast.promise(
        txPromise.then((tx: ethers.ContractTransactionResponse) => tx.wait()),
        {
          loading: 'Submitting mint transaction...',
          success: 'Mint transaction confirmed.',
          error: (error) => extractErrorMessage(error),
        },
      )
      await (await txPromise).wait()
      await refreshData()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsSubmittingAdmin(false)
    }
  }

  async function updateFaucetAmount(amount: string) {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid faucet amount.')
      return
    }

    try {
      setIsSubmittingAdmin(true)
      const contract = await getWritableContract()
      const txPromise = contract.setFaucetAmount(ethers.parseUnits(amount, 18))
      toast.promise(
        txPromise.then((tx: ethers.ContractTransactionResponse) => tx.wait()),
        {
          loading: 'Updating faucet amount...',
          success: 'Faucet amount updated.',
          error: (error) => extractErrorMessage(error),
        },
      )
      await (await txPromise).wait()
      await refreshData()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsSubmittingAdmin(false)
    }
  }

  return {
    account,
    chainId,
    claimToken,
    connectWallet,
    countdownText,
    canRequest,
    deployment,
    isClaiming,
    isConnected,
    isConnecting,
    isOwner,
    isRefreshing,
    isSubmittingAdmin,
    isSupportedNetwork,
    mintTokens,
    refreshData,
    snapshot,
    supportedDeployments: Object.values(DEPLOYMENTS) as Deployment[],
    switchNetwork,
    updateFaucetAmount,
  }
}
