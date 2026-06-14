import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ritualTestnet } from './config/chain'
import { NavBar } from './components/NavBar'
import Feed from './pages/Feed'

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

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NavBar />
        <div className="pt-16">
          <Feed />
        </div>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
