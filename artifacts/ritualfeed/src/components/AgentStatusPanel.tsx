import React from 'react'
import { Activity, TrendingUp, Zap, Wallet } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { useAgentStatus } from '../hooks/useAgentStatus'
import { useSubscription } from '../hooks/useSubscription'
import { formatRelativeTime } from '../utils/paperUtils'
import { EXPLORER_URL, CONTRACT_ADDRESS, SUBSCRIPTION_PRICE } from '../config'
import { MOCK_AGENT_STATUS } from '../data/mockDigest'
import { formatEther } from 'viem'
import { toast } from 'sonner'

const IS_CONFIGURED = CONTRACT_ADDRESS !== 'YOUR_CONTRACT_ADDRESS'

interface MetricRowProps {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}

function MetricRow({ icon: Icon, label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-xs font-bold text-slate-900 dark:text-white">
        {value ?? <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
      </span>
    </div>
  )
}

interface AgentStatusContentProps {
  lastUpdated: Date | null
  onSubscribeSuccess?: () => void
}

export function AgentStatusContent({ lastUpdated, onSubscribeSuccess }: AgentStatusContentProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { cycleCount, walletBalance, nextWakeupBlock } = useAgentStatus()
  const {
    isSubscribed,
    handleSubscribe,
    handleUnsubscribe,
    isSubscribing,
    isUnsubscribing,
    refetchStatus,
  } = useSubscription()

  const wrongNetwork = isConnected && chainId !== 1979
  const subPrice = formatEther(SUBSCRIPTION_PRICE)

  const displayCycleCount = IS_CONFIGURED ? cycleCount : MOCK_AGENT_STATUS.cycleCount
  const displayBalance = IS_CONFIGURED
    ? (walletBalance != null ? `${walletBalance} RITUAL` : null)
    : `${MOCK_AGENT_STATUS.walletBalance} RITUAL`
  const displayNextWakeup = IS_CONFIGURED ? nextWakeupBlock : MOCK_AGENT_STATUS.nextWakeupBlock
  const displaySuccessRate = IS_CONFIGURED ? null : MOCK_AGENT_STATUS.successRate

  const onSubscribe = async () => {
    try {
      handleSubscribe()
      setTimeout(() => {
        refetchStatus()
        toast.success('Subscribed! You will receive each digest.')
        onSubscribeSuccess?.()
      }, 5000)
    } catch {
      toast.error('Transaction failed. Please try again.')
    }
  }

  const onUnsubscribe = async () => {
    try {
      handleUnsubscribe()
      setTimeout(() => {
        refetchStatus()
        toast.success('Unsubscribed successfully.')
      }, 5000)
    } catch {
      toast.error('Transaction failed. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Agent health card */}
      <aside
        className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4"
        aria-label="Agent status metrics"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Agent Status
          </h3>
          <span className="flex items-center gap-1 text-xs">
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">Live</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-400">Paused</span>
              </>
            )}
          </span>
        </div>

        <div className="space-y-1.5">
          <MetricRow
            icon={Activity}
            label="Cycle count"
            value={displayCycleCount != null ? `#${displayCycleCount}` : null}
          />
          <MetricRow
            icon={TrendingUp}
            label="Success rate"
            value={displaySuccessRate != null ? `${displaySuccessRate}%` : null}
          />
          <MetricRow
            icon={Zap}
            label="Next wakeup"
            value={displayNextWakeup != null ? `Block #${displayNextWakeup.toLocaleString()}` : null}
          />
          <MetricRow
            icon={Wallet}
            label="Wallet balance"
            value={displayBalance}
          />
        </div>

        {/* Last digest */}
        {lastUpdated && (
          <div className="mt-3 pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last digest: <span className="font-medium text-slate-700 dark:text-slate-300">{formatRelativeTime(lastUpdated)}</span>
            </p>
          </div>
        )}

        {/* Agent healthy banner */}
        <div className="mt-3 p-2.5 rounded-md bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-200">🔄 Agent running autonomously</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Powered by Ritual Chain compute.
          </p>
        </div>
      </aside>

      {/* Subscription card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">You are subscribed</span>
            </div>
            <button
              onClick={onUnsubscribe}
              disabled={isUnsubscribing || wrongNetwork}
              className="w-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Unsubscribe from Research Digest"
              title={wrongNetwork ? 'Switch to Ritual Testnet to continue' : undefined}
            >
              {isUnsubscribing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Unsubscribe'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Get the Digest</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Subscribe to receive AI research digests as they are published on-chain.
            </p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {subPrice} RITUAL / digest
            </p>
            <button
              onClick={onSubscribe}
              disabled={isSubscribing || wrongNetwork || !isConnected}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              aria-label={`Subscribe to Research Digest for ${subPrice} RITUAL`}
              title={wrongNetwork ? 'Switch to Ritual Testnet to continue' : undefined}
            >
              {isSubscribing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isConnected ? (
                'Subscribe'
              ) : (
                'Connect wallet to subscribe'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Explorer link */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <a
          href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View contract on Ritual Explorer
        </a>
      </div>
    </div>
  )
}

export function AgentStatusSidebar({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div className="sticky top-[120px]">
        <AgentStatusContent lastUpdated={lastUpdated} />
      </div>
    </aside>
  )
}
