import React from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useAgentStatus } from '../hooks/useAgentStatus'
import { useSubscription } from '../hooks/useSubscription'
import { formatRelativeTime } from '../utils/paperUtils'
import { EXPLORER_URL, CONTRACT_ADDRESS, SUBSCRIPTION_PRICE } from '../config'
import { formatEther } from 'viem'
import { toast } from 'sonner'

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-[#6B7280]">{label}</span>
      <span className="text-[13px] font-semibold text-[#0F2D4A]">{value ?? <span className="text-gray-300">—</span>}</span>
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
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F2D4A]">Agent Status</h3>
          <span className="ml-auto flex items-center gap-1 text-xs">
            {isConnected ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              <span className="text-red-500">Live</span></>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              <span className="text-gray-400">Paused</span></>
            )}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          <MetricRow label="Cycle count" value={cycleCount != null ? `#${cycleCount}` : null} />
          <MetricRow label="Last digest" value={lastUpdated ? formatRelativeTime(lastUpdated) : null} />
          <MetricRow label="Next wakeup" value={nextWakeupBlock != null ? `Block #${nextWakeupBlock.toLocaleString()}` : null} />
          <MetricRow label="Wallet balance" value={walletBalance != null ? `${walletBalance} RITUAL` : null} />
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-green-700">You are subscribed</span>
            </div>
            <button
              onClick={onUnsubscribe}
              disabled={isUnsubscribing || wrongNetwork}
              className="w-full border border-[#E2E8F0] text-[#6B7280] text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Unsubscribe from Research Digest"
              title={wrongNetwork ? 'Switch to Ritual Testnet to continue' : undefined}
            >
              {isUnsubscribing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Processing...
                </span>
              ) : 'Unsubscribe'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F2D4A]">Get the Digest</h4>
            <p className="text-[13px] text-[#6B7280] leading-relaxed">
              Subscribe to receive AI research digests as they are published on-chain.
            </p>
            <p className="text-[13px] font-medium text-[#0F2D4A]">{subPrice} RITUAL / digest</p>
            <button
              onClick={onSubscribe}
              disabled={isSubscribing || wrongNetwork || !isConnected}
              className="w-full bg-[#0F2D4A] text-white text-sm py-2.5 rounded-lg hover:bg-[#1A3C5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Subscribe to Research Digest for ${subPrice} RITUAL`}
              title={wrongNetwork ? 'Switch to Ritual Testnet to continue' : undefined}
            >
              {isSubscribing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isConnected ? 'Subscribe' : 'Connect wallet to subscribe'}
            </button>
          </div>
        )}
      </div>

      {/* Explorer link */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <a
          href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#1A6FB0] hover:underline flex items-center gap-1.5"
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
