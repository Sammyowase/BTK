import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from './components/AdminPage'
import { AppHeader } from './components/AppHeader'
import { DashboardPage } from './components/DashboardPage'
import { useFaucet } from './hooks/useFaucet'

function App() {
  const faucet = useFaucet()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,119,183,0.16),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f7fbfd_55%,_#eef5f8_100%)] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <AppHeader
          account={faucet.account}
          chainId={faucet.chainId}
          connectWallet={faucet.connectWallet}
          deployment={faucet.deployment}
          isConnected={faucet.isConnected}
          isConnecting={faucet.isConnecting}
          isOwner={faucet.isOwner}
          supportedDeployments={faucet.supportedDeployments}
          switchNetwork={faucet.switchNetwork}
        />

        <main className="flex-1 py-6">
          <Routes>
            <Route
              element={
                <DashboardPage
                  account={faucet.account}
                  canRequest={faucet.canRequest}
                  claimToken={faucet.claimToken}
                  connectWallet={faucet.connectWallet}
                  countdownText={faucet.countdownText}
                  deployment={faucet.deployment}
                  isClaiming={faucet.isClaiming}
                  isConnected={faucet.isConnected}
                  isRefreshing={faucet.isRefreshing}
                  isSupportedNetwork={faucet.isSupportedNetwork}
                  refreshData={faucet.refreshData}
                  snapshot={faucet.snapshot}
                  supportedDeployments={faucet.supportedDeployments}
                  switchNetwork={faucet.switchNetwork}
                />
              }
              path="/"
            />
            <Route
              element={
                <AdminPage
                  connectWallet={faucet.connectWallet}
                  deployment={faucet.deployment}
                  isConnected={faucet.isConnected}
                  isOwner={faucet.isOwner}
                  isSubmittingAdmin={faucet.isSubmittingAdmin}
                  isSupportedNetwork={faucet.isSupportedNetwork}
                  onMint={faucet.mintTokens}
                  onSetFaucetAmount={faucet.updateFaucetAmount}
                  refreshData={faucet.refreshData}
                  snapshot={faucet.snapshot}
                  supportedDeployments={faucet.supportedDeployments}
                  switchNetwork={faucet.switchNetwork}
                />
              }
              path="/admin"
            />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
