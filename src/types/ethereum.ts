declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      on?: (event: string, listener: (...args: unknown[]) => void) => void
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
    }
  }
}

export type EthereumWindow = Window

export {}
