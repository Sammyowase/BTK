import type { BigNumberish } from 'ethers'

export type Deployment = {
  address: string
  chainId: number
  label: string
  chainHex: string
  chainName: string
  rpcUrls?: string[]
  blockExplorerUrls?: string[]
  nativeCurrency?: {
    name: string
    symbol: string
    decimals: number
  }
}

export type FaucetSnapshot = {
  balance: BigNumberish
  canRequest: boolean
  faucetAmount: BigNumberish
  maxSupply: BigNumberish
  name: string
  nextRequestTime: number
  owner: string
  symbol: string
  totalSupply: BigNumberish
}

export const DEPLOYMENTS: Record<number, Deployment> = {
  4202: {
    address: '0x9F72CAB486B52ff08d00D81E0718750B70c15B64',
    chainId: 4202,
    label: 'Lisk Sepolia',
    chainHex: '0x106a',
    chainName: 'Lisk Sepolia',
    rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  11155111: {
    address: '0x68415A59c8798A78253d85536A05Aef8417E2651',
    chainId: 11155111,
    label: 'Sepolia',
    chainHex: '0xaa36a7',
    chainName: 'Sepolia',
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
}

export const MY_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function faucetAmount() view returns (uint256)',
  'function canRequestToken(address user) view returns (bool)',
  'function getRemainingTime(address user) view returns (uint256)',
  'function getNextRequestTime(address user) view returns (uint256)',
  'function requestToken()',
  'function mint(address to, uint256 amount)',
  'function setFaucetAmount(uint256 amount)',
] as const
