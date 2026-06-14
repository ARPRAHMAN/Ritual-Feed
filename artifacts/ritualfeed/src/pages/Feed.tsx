import React, { useState, useEffect, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useWatchContractEvent } from 'wagmi'
import { useDigest } from '../hooks/useDigest'
import { PaperCard, PaperCardSkeleton, type PaperTopic } from '../components/PaperCard'
import { AgentStatusSidebar } from '../components/AgentStatusPanel'
import { MobileStatusBar } from '../components/MobileStatusSheet'
import { MOCK_DIGEST, MOCK_AGENT_STATUS } from '../data/mockDigest'
import { CONTRACT_ADDRESS, DIGEST_AGENT_ABI } from '../config'
import { formatRelativeTime } from '../utils/paperUtils'
import { toast } from 'sonner'

const TOPICS: Array<{ key: 'All' | PaperTopic; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'ML', label: 'ML' },
  { key: 'CV', label: 'Computer Vision' },
  { key: 'NLP', label: 'NLP' },
  { key: 'RL', label: 'Reinforcement Learning' },
  { key: 'Other', label: 'Other' },
]

const IS_CONFIGURED = CONTRACT_ADDRESS !== 'YOUR_CONTRACT_ADDRESS'

export default function Feed() {
  const [activeTopic, setActiveTopic] = useState<'All' | PaperTopic>('All')
  const [relativeTime, setRelativeTime] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { digest, isLoading, isError, refetch } = useDigest()

  const papers = IS_CONFIGURED
    ? (digest?.papers ?? [])
    : MOCK_DIGEST.map(p => ({ ...p }))

  const cycleCount = IS_CONFIGURED ? (digest?.cycleCount ?? null) : MOCK_AGENT_STATUS.cycleCount
  const lastUpdated = IS_CONFIGURED ? (digest?.lastUpdated ?? null) : MOCK_AGENT_STATUS.lastDigest

  const filtered = activeTopic === 'All'
    ? papers
    : papers.filter(p => p.topic === activeTopic)

  // Update relative time every 30s
  useEffect(() => {
    const update = () => {
      if (lastUpdated) setRelativeTime(formatRelativeTime(lastUpdated))
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Watch for new digest event
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    eventName: 'DigestPublished',
    enabled: IS_CONFIGURED,
    onLogs: (logs) => {
      const log = logs[0] as { args?: { cycleId?: bigint; paperCount?: number } }
      const cycleId = log?.args?.cycleId
      const paperCount = log?.args?.paperCount
      toast(`🔔 New digest published! Cycle #${cycleId} — ${paperCount} papers scored.`, {
        duration: 8000,
        action: {
          label: 'Update Feed',
          onClick: () => refetch(),
        },
      })
    },
  })

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [refetch])

  const showSkeleton = IS_CONFIGURED && isLoading
  const showError = IS_CONFIGURED && isError
  const showEmpty = IS_CONFIGURED && !isLoading && !isError && papers.length === 0

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Sticky filter bar */}
      <div className="sticky top-16 bg-[#F8FAFB] border-b border-[#E2E8F0] z-30">
        {/* RPC error banner */}
        {showError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-center text-sm text-red-700">
            Cannot connect to Ritual Chain. Check your network.
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {TOPICS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTopic(key)}
                aria-label={`Filter by ${label}`}
                aria-pressed={activeTopic === key}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border ${
                  activeTopic === key
                    ? 'bg-[#0F2D4A] text-white border-[#0F2D4A]'
                    : 'bg-white text-[#4B5563] border-[#E2E8F0] hover:bg-[#F8FAFB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cycle info banner */}
      <div
        role="status"
        aria-live="polite"
        className="bg-[#F8FAFB] border-b border-[#E2E8F0] py-2 px-6 text-center text-[13px] text-[#9CA3AF]"
      >
        {cycleCount != null
          ? `Cycle #${cycleCount} · Last updated ${relativeTime || (lastUpdated ? formatRelativeTime(lastUpdated) : '—')} · ${papers.length} papers scored`
          : IS_CONFIGURED ? 'Fetching digest...' : 'Demo mode — connect a contract to see live data'}
      </div>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-6 py-6 overflow-x-hidden">
        <div className="flex gap-6">
          {/* Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold text-[#0F2D4A]">
                {activeTopic === 'All' ? 'Latest Research' : TOPICS.find(t => t.key === activeTopic)?.label}
              </h1>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh digest"
                title="Refresh digest"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Loading */}
            {showSkeleton && (
              <div
                aria-busy="true"
                aria-label="Loading papers..."
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {Array.from({ length: 6 }).map((_, i) => <PaperCardSkeleton key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative flex h-16 w-16 mb-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6FB0] opacity-20" />
                  <span className="relative inline-flex items-center justify-center rounded-full h-16 w-16 bg-[#EEF2FF]">
                    <svg className="w-7 h-7 text-[#1A6FB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                </div>
                <h2 className="text-base font-semibold text-[#0F2D4A]">First digest incoming</h2>
                <p className="mt-2 text-sm text-[#6B7280] max-w-sm leading-relaxed">
                  The Research Digest Agent is live. Papers will appear after the first scheduled cycle completes (approximately every 35 seconds).
                </p>
              </div>
            )}

            {/* Paper grid */}
            {!showSkeleton && !showEmpty && !showError && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                style={{ contain: 'layout' }}
              >
                {filtered.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-sm text-[#9CA3AF]">
                    No papers in this category yet.
                  </div>
                ) : (
                  filtered.map((paper, i) => (
                    <div
                      key={`${paper.title}-${i}`}
                      className="animate-in fade-in-0 slide-in-from-bottom-2"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                    >
                      <PaperCard
                        title={paper.title}
                        score={paper.score}
                        summary={paper.summary}
                        arxivUrl={paper.arxivUrl}
                        topic={paper.topic}
                        publishedAt={paper.publishedAt}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <AgentStatusSidebar lastUpdated={lastUpdated} />
        </div>
      </main>

      {/* Mobile bottom bar */}
      <MobileStatusBar cycleCount={cycleCount} lastUpdated={lastUpdated} />

      {/* Spacer for mobile bottom bar */}
      <div className="h-16 lg:hidden" />
    </div>
  )
}
