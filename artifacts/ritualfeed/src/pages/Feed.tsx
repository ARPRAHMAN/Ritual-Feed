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

type SortKey = 'recent' | 'score'

export default function Feed() {
  const [activeTopic, setActiveTopic] = useState<'All' | PaperTopic>('All')
  const [sortBy, setSortBy] = useState<SortKey>('recent')
  const [relativeTime, setRelativeTime] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { digest, isLoading, isError, refetch } = useDigest()

  const papers = IS_CONFIGURED
    ? (digest?.papers ?? [])
    : MOCK_DIGEST.map(p => ({ ...p }))

  const cycleCount = IS_CONFIGURED
    ? (digest?.cycleCount ?? null)
    : MOCK_AGENT_STATUS.cycleCount
  const lastUpdated = IS_CONFIGURED
    ? (digest?.lastUpdated ?? null)
    : MOCK_AGENT_STATUS.lastDigest

  const filtered = activeTopic === 'All'
    ? papers
    : papers.filter(p => p.topic === activeTopic)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  useEffect(() => {
    const update = () => {
      if (lastUpdated) setRelativeTime(formatRelativeTime(lastUpdated))
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [lastUpdated])

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
        action: { label: 'Update Feed', onClick: () => refetch() },
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
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Sticky filter bar */}
      <div className="sticky top-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 z-30">
        {showError && (
          <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-6 py-2 text-center text-sm text-red-700 dark:text-red-400">
            Cannot connect to Ritual Chain. Check your network.
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Topic pills */}
            <div
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {TOPICS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTopic(key)}
                  aria-label={`Filter by ${label}`}
                  aria-pressed={activeTopic === key}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border ${
                    activeTopic === key
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort control */}
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="sort-select"
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block"
              >
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle info banner */}
      <div
        role="status"
        aria-live="polite"
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-2 px-6 text-center text-xs text-slate-400 dark:text-slate-500"
      >
        {cycleCount != null
          ? `Cycle #${cycleCount} · Last updated ${relativeTime || (lastUpdated ? formatRelativeTime(lastUpdated) : '—')} · ${papers.length} papers scored`
          : IS_CONFIGURED
          ? 'Fetching digest...'
          : 'Demo mode — connect a contract to see live data'}
      </div>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-6 py-6 overflow-x-hidden">
        <div className="flex gap-6">
          {/* Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeTopic === 'All'
                    ? 'Latest Research Digest'
                    : TOPICS.find(t => t.key === activeTopic)?.label}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {sorted.length} paper{sorted.length !== 1 ? 's' : ''} · Powered by Ritual Chain
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh digest"
                title="Refresh digest"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Loading skeletons */}
            {showSkeleton && (
              <div
                aria-busy="true"
                aria-label="Loading papers..."
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <PaperCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative flex h-16 w-16 mb-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20" />
                  <span className="relative inline-flex items-center justify-center rounded-full h-16 w-16 bg-blue-50 dark:bg-blue-950">
                    <svg
                      className="w-7 h-7 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  First digest incoming
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  The Research Digest Agent is live. Papers will appear after the first scheduled cycle.
                </p>
              </div>
            )}

            {/* Paper grid */}
            {!showSkeleton && !showEmpty && !showError && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                role="list"
                aria-label={`Research feed — ${sorted.length} papers`}
              >
                {sorted.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                    No papers in this category yet.
                  </div>
                ) : (
                  sorted.map((paper, i) => (
                    <div
                      key={`${paper.title}-${i}`}
                      role="listitem"
                      className="animate-fadeIn"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                    >
                      <PaperCard
                        title={paper.title}
                        authors={'authors' in paper ? (paper as { authors?: string }).authors : undefined}
                        score={paper.score}
                        summary={paper.summary}
                        aiSummary={'aiSummary' in paper ? (paper as { aiSummary?: string }).aiSummary : undefined}
                        arxivUrl={paper.arxivUrl}
                        topic={paper.topic}
                        topicTags={'topicTags' in paper ? (paper as { topicTags?: string[] }).topicTags : undefined}
                        citations={'citations' in paper ? (paper as { citations?: number }).citations : undefined}
                        publishedAt={paper.publishedAt}
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Load more */}
            {!showSkeleton && !showEmpty && !showError && sorted.length > 0 && (
              <div className="mt-8 text-center">
                <button className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200">
                  Load More Papers
                </button>
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
