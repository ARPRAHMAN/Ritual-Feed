import React, { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { ritualTestnet } from '../config/chain'

const CONNECTOR_ICONS: Record<string, string> = {
  'MetaMask': '🦊',
  'Coinbase Wallet': '💙',
  'WalletConnect': '🔗',
}

interface WalletModalProps {
  onClose: () => void
}

export function WalletModal({ onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect()

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Connect Wallet</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ritual Testnet (Chain ID 1979)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div className="px-6 py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect to subscribe and receive AI research digests published on-chain by the autonomous agent.
            </p>
          </div>

          {/* Connectors */}
          <div className="px-6 pb-5 space-y-2">
            {connectors.map(connector => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector, chainId: ritualTestnet.id })
                  onClose()
                }}
                disabled={isPending}
                className="w-full flex items-center gap-4 px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  {CONNECTOR_ICONS[connector.name] ?? '👛'}
                </span>
                <span className="flex-1 text-left">{connector.name}</span>
                <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Don't have MetaMask?{' '}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Install it free →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function WalletButton() {
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address,
    chainId: ritualTestnet.id,
    query: { enabled: !!address },
  })

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : ''

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-[13px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Wallet menu"
          aria-expanded={open}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="hidden sm:inline font-mono">{shortAddress}</span>
          <span className="sm:hidden font-mono">{`${address.slice(0, 4)}…${address.slice(-4)}`}</span>
          {balance && (
            <span className="hidden md:inline text-slate-400 dark:text-slate-500 text-xs">
              {Number(balance.formatted).toFixed(3)} RITUAL
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connected</p>
                <p className="text-sm font-mono text-slate-900 dark:text-white mt-0.5">{shortAddress}</p>
                {balance && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {Number(balance.formatted).toFixed(4)} RITUAL
                  </p>
                )}
              </div>
              <div className="p-2">
                <button
                  onClick={() => { disconnect(); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        aria-label="Connect your wallet"
      >
        Connect Wallet
      </button>

      {open && <WalletModal onClose={() => setOpen(false)} />}
    </>
  )
}
