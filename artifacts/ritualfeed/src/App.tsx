import { useState, useEffect } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ritualTestnet } from './config/chain'
import { NavBar } from './components/NavBar'
import Feed from './pages/Feed'
import Landing from './pages/Landing'
import { SearchOverlay } from './components/SearchOverlay'
import { useMultiSearch } from './hooks/useMultiSearch'
import { parseSearchQuery, setUrlQuery } from './utils/exportDigest'

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
  const [launched, setLaunched] = useState<boolean>(() => {
    // Return users skip the landing page
    return localStorage.getItem('rf_launched') === 'true' || Boolean(parseSearchQuery())
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const multiSearch = useMultiSearch()

  // On load: auto-search if ?q= is in the URL
  useEffect(() => {
    const q = parseSearchQuery()
    if (q) {
      setLaunched(true)
      setSearchOpen(true)
      multiSearch.search(q)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLaunch = () => {
    localStorage.setItem('rf_launched', 'true')
    setLaunched(true)
  }

  const handleHome = () => {
    localStorage.removeItem('rf_launched')
    setLaunched(false)
  }

  const handleSearch = (query: string) => {
    setSearchOpen(true)
    setUrlQuery(query)
    multiSearch.search(query)
  }

  const handleClose = () => {
    setSearchOpen(false)
    setUrlQuery(null)
    multiSearch.clear()
  }

  if (!launched) {
    return <Landing onLaunch={handleLaunch} />
  }

  return (
    <>
      <NavBar onSearch={handleSearch} onSearchOpen={() => setSearchOpen(true)} onHome={handleHome} />
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
