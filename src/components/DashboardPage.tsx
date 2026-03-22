import type { FaucetSnapshot } from '../lib/contract'
import { formatDateTime, formatTokenAmount, shortenAddress } from '../lib/format'
import { StatCard } from './StatCard'

type Deployment = {
  address: string
  chainId: number
  label: string
}

type DashboardPageProps = {
  account: string | null
  canRequest: boolean
  claimToken: () => Promise<void>
  connectWallet: () => Promise<void>
  countdownText: string
  deployment: Deployment | null
  isClaiming: boolean
  isConnected: boolean
  isRefreshing: boolean
  isSupportedNetwork: boolean
  refreshData: () => Promise<void>
  snapshot: FaucetSnapshot | null
  supportedDeployments: Deployment[]
  switchNetwork: (chainId: number) => Promise<void>
}

const experiencePoints = [
  'Live wallet connection with ethers BrowserProvider',
  'Realtime cooldown and next-claim visibility',
  'Direct requestToken() transaction flow',
  'Admin-only minting and faucet controls on a separate page',
]

export function DashboardPage({
  account,
  canRequest,
  claimToken,
  connectWallet,
  countdownText,
  deployment,
  isClaiming,
  isConnected,
  isRefreshing,
  isSupportedNetwork,
  refreshData,
  snapshot,
  supportedDeployments,
  switchNetwork,
}: DashboardPageProps) {
  const stats = [
    {
      label: 'Faucet Amount',
      value: snapshot ? `${formatTokenAmount(snapshot.faucetAmount)} BTK` : '100 BTK',
      detail: 'Each successful request mints this amount to the connected wallet.',
    },
    {
      label: 'Wallet Balance',
      value: snapshot ? `${formatTokenAmount(snapshot.balance)} BTK` : isConnected ? 'Loading...' : 'Connect wallet',
      detail: 'Read directly from balanceOf(address) on the live token contract.',
    },
    {
      label: 'Total Supply',
      value: snapshot
        ? `${formatTokenAmount(snapshot.totalSupply)} / ${formatTokenAmount(snapshot.maxSupply)}`
        : '0 / 10,000,000',
      detail: 'Supply progress so users can see the faucet cap transparently.',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:p-8">
          <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-brand">
            Real Contract Experience
          </span>
          <h2 className="mt-4 max-w-4xl font-heading text-4xl font-bold tracking-[-0.07em] text-ink sm:text-6xl">
            Enter the BTK mint portal and interact with the faucet onchain.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            Connect your wallet, watch claim eligibility resolve in real time, route transactions straight to
            the live contract, and move through the BTK experience with the clarity, trust, and polish users
            expect from a modern Web3 interface.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,119,183,0.28)] transition hover:-translate-y-0.5 hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isConnected || !isSupportedNetwork || !canRequest || isClaiming}
              onClick={claimToken}
              type="button"
            >
              {isClaiming ? 'Submitting claim...' : 'Request Token'}
            </button>
            <button
              className="rounded-full border border-brand/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              onClick={isConnected ? refreshData : connectWallet}
              type="button"
            >
              {isConnected ? (isRefreshing ? 'Refreshing...' : 'Refresh Data') : 'Connect Wallet'}
            </button>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {experiencePoints.map((point) => (
              <div
                className="rounded-2xl border border-brand/10 bg-[#f8fbfd] px-4 py-4 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                key={point}
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-brand/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,253,0.96))] p-6 shadow-[0_24px_80px_rgba(13,54,77,0.08)] backdrop-blur sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-brand">Claim Panel</p>
              <h3 className="mt-2 font-heading text-3xl font-bold tracking-[-0.05em] text-ink">Faucet Status</h3>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-2 text-xs font-bold text-brand">
              {canRequest ? 'Eligible' : 'Cooldown'}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-brand/10 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Connected Wallet</p>
              <p className="mt-3 break-all font-mono text-sm text-ink">
                {account ? shortenAddress(account) : 'No wallet connected yet'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-brand px-4 py-5 text-white shadow-[0_16px_40px_rgba(0,119,183,0.2)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Claim Amount</p>
                <p className="mt-3 font-heading text-3xl font-bold tracking-[-0.04em]">
                  {snapshot ? formatTokenAmount(snapshot.faucetAmount) : '100'} BTK
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-brand/10 bg-[#f8fbfd] px-4 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Countdown</p>
                <p className="mt-3 font-heading text-3xl font-bold tracking-[-0.04em] text-ink">{countdownText}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-brand/10 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-muted">Can request now</span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    canRequest ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {canRequest ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border-soft pt-4">
                <span className="text-sm font-semibold text-muted">Next eligible claim</span>
                <span className="text-right text-sm font-semibold text-ink">
                  {snapshot ? formatDateTime(snapshot.nextRequestTime) : 'Connect wallet'}
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-brand/10 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Contract</p>
              <p className="mt-3 break-all font-mono text-sm text-ink">
                {deployment?.address ?? 'Supported deployments load after wallet connection'}
              </p>
              {!isSupportedNetwork && isConnected ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-amber-700">
                    Switch your wallet to Lisk Sepolia to unlock live BTK claim actions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supportedDeployments.map((item) => (
                      <button
                        className="rounded-full border border-brand/15 bg-[#f8fbfd] px-3 py-2 text-xs font-semibold text-ink transition hover:border-brand/35 hover:text-brand"
                        key={item.chainId}
                        onClick={() => void switchNetwork(item.chainId)}
                        type="button"
                      >
                        {item.label === 'Lisk Sepolia' ? 'Switch to Lisk Sepolia' : `Switch to ${item.label}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard detail={stat.detail} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>
    </div>
  )
}
