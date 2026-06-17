import React, { useState, useEffect } from 'react'
import { Bell, Moon, Sun, Search, X } from 'lucide-react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { WalletButton } from './WalletButton'
import { AboutModal } from './AboutModal'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return [dark, setDark] as const
}

export function NavBar() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const wrongNetwork = isConnected && chainId !== 1979
  const [dark, setDark] = useDarkMode()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifCount] = useState(2)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-50 h-16 flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RF</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              RitualFeed
            </span>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by title, author, topic..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Notifications (${notifCount} unread)`}
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <AboutModal />
            <WalletButton />
          </div>
        </div>

        {/* Mobile search (expands below nav) */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Wrong network banner */}
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
