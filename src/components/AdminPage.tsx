import { useState } from 'react'
import type { FaucetSnapshot } from '../lib/contract'
import { formatTokenAmount } from '../lib/format'

type Deployment = {
  address: string
  chainId: number
  label: string
}

type AdminPageProps = {
  connectWallet: () => Promise<void>
  deployment: Deployment | null
  isConnected: boolean
  isOwner: boolean
  isSubmittingAdmin: boolean
  isSupportedNetwork: boolean
  onMint: (recipient: string, amount: string) => Promise<void>
  onSetFaucetAmount: (amount: string) => Promise<void>
  refreshData: () => Promise<void>
  snapshot: FaucetSnapshot | null
  supportedDeployments: Deployment[]
  switchNetwork: (chainId: number) => Promise<void>
}

export function AdminPage({
  connectWallet,
  deployment,
  isConnected,
  isOwner,
  isSubmittingAdmin,
  isSupportedNetwork,
  onMint,
  onSetFaucetAmount,
  refreshData,
  snapshot,
  supportedDeployments,
  switchNetwork,
}: AdminPageProps) {
  const [recipient, setRecipient] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [newFaucetAmount, setNewFaucetAmount] = useState('')

  const gateMessage = !isConnected
    ? 'Connect the owner wallet to access admin actions.'
    : !isSupportedNetwork
      ? 'Switch to Lisk Sepolia before using admin actions.'
      : !isOwner
        ? 'This connected wallet is not the contract owner.'
        : null

  async function handleMint() {
    await onMint(recipient, mintAmount)
    setRecipient('')
    setMintAmount('')
  }

  async function handleSetFaucetAmount() {
    await onSetFaucetAmount(newFaucetAmount)
    setNewFaucetAmount('')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:p-7">
        <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-brand">
          Owner Surface
        </span>
        <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-0.06em] text-ink">Admin controls for BTK.</h2>
        <p className="mt-4 text-base leading-7 text-muted">
          The contract owner can mint BTK to any address and adjust the faucet amount. This page is wired to
          the live contract methods using `ethers` and will surface transaction feedback through toast
          notifications.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] border border-brand/10 bg-[#f8fbfd] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Active deployment</p>
            <p className="mt-3 break-all font-mono text-sm text-ink">
              {deployment ? `${deployment.label} (${deployment.chainId}) - ${deployment.address}` : 'No supported chain selected'}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-brand/10 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Current faucet amount</p>
            <p className="mt-3 font-heading text-3xl font-bold tracking-[-0.04em] text-ink">
              {snapshot ? `${formatTokenAmount(snapshot.faucetAmount)} BTK` : 'Loading...'}
            </p>
          </div>

          {gateMessage ? (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              {gateMessage}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              Owner verified. Admin transactions are enabled.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {!isConnected ? (
              <button
                className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,119,183,0.28)] transition hover:-translate-y-0.5 hover:bg-brand-strong"
                onClick={connectWallet}
                type="button"
              >
                Connect Owner Wallet
              </button>
            ) : null}
            {!isSupportedNetwork ? (
              <>
                {supportedDeployments.map((item) => (
                  <button
                    className="rounded-full border border-brand/15 bg-[#f8fbfd] px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand/35 hover:text-brand"
                    key={item.chainId}
                    onClick={() => void switchNetwork(item.chainId)}
                    type="button"
                  >
                    {item.label === 'Lisk Sepolia' ? 'Switch to Lisk Sepolia' : `Switch to ${item.label}`}
                  </button>
                ))}
              </>
            ) : null}
            <button
              className="rounded-full border border-brand/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isConnected}
              onClick={refreshData}
              type="button"
            >
              Refresh Contract State
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:p-7"
          onSubmit={(event) => {
            event.preventDefault()
            void handleMint()
          }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand">Mint Tokens</p>
          <h3 className="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-ink">Direct owner mint</h3>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Recipient address</span>
              <input
                className="w-full rounded-2xl border border-border-soft bg-[#f8fbfd] px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="0x..."
                value={recipient}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Amount in BTK</span>
              <input
                className="w-full rounded-2xl border border-border-soft bg-[#f8fbfd] px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setMintAmount(event.target.value)}
                placeholder="500"
                value={mintAmount}
              />
            </label>

            <button
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,119,183,0.28)] transition hover:-translate-y-0.5 hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
              disabled={Boolean(gateMessage) || isSubmittingAdmin}
              type="submit"
            >
              {isSubmittingAdmin ? 'Submitting mint...' : 'Mint Tokens'}
            </button>
          </div>
        </form>

        <form
          className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:p-7"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSetFaucetAmount()
          }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand">Faucet Settings</p>
          <h3 className="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] text-ink">Update claim size</h3>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">New faucet amount in BTK</span>
              <input
                className="w-full rounded-2xl border border-border-soft bg-[#f8fbfd] px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setNewFaucetAmount(event.target.value)}
                placeholder="100"
                value={newFaucetAmount}
              />
            </label>

            <button
              className="w-full rounded-full border border-brand/20 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={Boolean(gateMessage) || isSubmittingAdmin}
              type="submit"
            >
              {isSubmittingAdmin ? 'Updating faucet...' : 'Set Faucet Amount'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
