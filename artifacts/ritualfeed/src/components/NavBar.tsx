import React from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { WalletButton } from './WalletButton'
import { AboutModal } from './AboutModal'

export function NavBar() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const wrongNetwork = isConnected && chainId !== 1979

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#E2E8F0] z-50 h-16 flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full flex items-center justify-between">
          <span className="text-xl font-bold text-[#0F2D4A] tracking-tight">RitualFeed</span>
          <div className="flex items-center gap-3">
            <AboutModal />
            <WalletButton />
          </div>
        </div>
      </header>

      {wrongNetwork && (
        <div
          className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2.5 px-4 text-sm"
          style={{ backgroundColor: '#FEF3C7', borderBottom: '1px solid #FCD34D', color: '#92400E' }}
        >
          Wrong network. Please switch to Ritual Testnet (Chain ID 1979).
          <button
            onClick={() => switchChain({ chainId: 1979 })}
            className="font-semibold underline ml-1"
          >
            Switch Network
          </button>
        </div>
      )}
    </>
  )
}
