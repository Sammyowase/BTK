import { NavLink } from 'react-router-dom'
import type { Deployment } from '../lib/contract'
import { shortenAddress } from '../lib/format'

type AppHeaderProps = {
  account: string | null
  chainId: number | null
  connectWallet: () => Promise<void>
  deployment: Deployment | null
  isConnected: boolean
  isConnecting: boolean
  isOwner: boolean
  supportedDeployments: Deployment[]
  switchNetwork: (chainId: number) => Promise<void>
}

export function AppHeader({
  account,
  chainId,
  connectWallet,
  deployment,
  isConnected,
  isConnecting,
  isOwner,
  supportedDeployments,
  switchNetwork,
}: AppHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-brand/10 bg-white/90 px-5 py-5 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0077B7,#1FA3E0)] font-heading text-2xl font-bold text-white shadow-[0_18px_45px_rgba(0,119,183,0.28)]">
              B
            </div>
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-brand">BTk</p>
              <div>
                <h1 className="font-heading text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
                  BTK Faucet
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">
                  A refined onchain gateway for minting, and frictionless BTK access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                <NavLink
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand text-white shadow-[0_12px_30px_rgba(0,119,183,0.28)]'
                        : 'border border-brand/15 bg-white text-ink hover:border-brand/35 hover:text-brand'
                    }`
                  }
                  to="/admin"
                >
                  Admin
                </NavLink>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-brand/10 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand">
                {deployment ? `${deployment.label} (${deployment.chainId})` : chainId ? `Unsupported (${chainId})` : 'Connect wallet'}
              </span>
              {isOwner ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Owner wallet
                </span>
              ) : null}
              <button
                className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isConnecting}
                onClick={connectWallet}
                type="button"
              >
                {isConnecting ? 'Connecting...' : isConnected && account ? shortenAddress(account) : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-soft pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-muted">Network Access</p>
            <p className="mt-1 text-sm text-muted">
              Move directly into a supported BTK deployment from the interface.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportedDeployments.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  deployment?.chainId === item.chainId
                    ? 'bg-brand text-white shadow-[0_12px_30px_rgba(0,119,183,0.28)]'
                    : 'border border-brand/15 bg-white text-ink hover:border-brand/35 hover:text-brand'
                }`}
                key={item.chainId}
                onClick={() => void switchNetwork(item.chainId)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
