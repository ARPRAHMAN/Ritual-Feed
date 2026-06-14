import React, { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { ritualTestnet } from '../config/chain'

export function WalletButton() {
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address,
    chainId: ritualTestnet.id,
    query: { enabled: !!address },
  })

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#0F2D4A] px-3 py-2 rounded-lg text-[13px] hover:bg-gray-50 transition-colors"
          aria-label="Wallet menu"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="hidden sm:inline">{shortAddress}</span>
          <span className="sm:hidden">{`${address.slice(0, 4)}...${address.slice(-4)}`}</span>
          {balance && (
            <span className="hidden md:inline text-[#6B7280] text-xs">
              {Number(balance.formatted).toFixed(3)} RITUAL
            </span>
          )}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 p-2">
              <div className="px-3 py-2 text-xs text-[#6B7280] font-medium border-b border-[#F1F5F9] mb-1">
                Connected
              </div>
              <div className="px-3 py-2 text-[13px] text-[#0F2D4A] font-mono break-all">
                {shortAddress}
              </div>
              <button
                onClick={() => { disconnect(); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0F2D4A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1A3C5E] transition-colors"
        aria-label="Connect your wallet"
        disabled={isPending}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[#0F2D4A]">Connect Wallet</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#6B7280]"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">
                Connect to Ritual Testnet (Chain ID 1979) to subscribe and view live digests.
              </p>
              <div className="space-y-2">
                {connectors.map(connector => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector, chainId: ritualTestnet.id })
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F2D4A] hover:bg-[#F8FAFB] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-base">
                      {connector.name === 'MetaMask' ? '🦊' :
                       connector.name === 'Coinbase Wallet' ? '💙' :
                       connector.name === 'WalletConnect' ? '🔗' : '👛'}
                    </span>
                    {connector.name}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#9CA3AF] text-center">
                Don't have MetaMask?{' '}
                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-[#1A6FB0] hover:underline">
                  Install it here
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
