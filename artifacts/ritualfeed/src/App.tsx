import { useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ritualTestnet } from './config/chain'
import { NavBar } from './components/NavBar'
import Feed from './pages/Feed'
import { SearchOverlay } from './components/SearchOverlay'
import { useMultiSearch } from './hooks/useMultiSearch'

const config = createConfig({
  chains: [ritualTestnet],
  transports: {
    [ritualTestnet.id]: http('https://rpc.ritualfoundation.org'),
  },
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'RitualFeed' }),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'ritualfeed-placeholder',
    }),
  ],
})

const queryClient = new QueryClient()

function AppContent() {
  const [searchOpen, setSearchOpen] = useState(false)
  const multiSearch = useMultiSearch()

  const handleSearch = (query: string) => {
    setSearchOpen(true)
    multiSearch.search(query)
  }

  const handleClose = () => {
    setSearchOpen(false)
    multiSearch.clear()
  }

  return (
    <>
      <NavBar onSearch={handleSearch} onSearchOpen={() => setSearchOpen(true)} />
      <div className="pt-16">
        <Feed />
      </div>
      <Toaster position="top-right" richColors />

      {searchOpen && (
        <SearchOverlay
          {...multiSearch}
          onClose={handleClose}
          onSearch={handleSearch}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
