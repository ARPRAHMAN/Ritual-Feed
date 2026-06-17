import React from 'react'
import { X, ExternalLink, Bookmark, Heart, Share2, ArrowLeft, Loader2, Download, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { SearchPaper } from '../utils/searchApis'
import type { SearchState } from '../hooks/useMultiSearch'
import { exportDigestAsPDF, getShareableUrl } from '../utils/exportDigest'

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'arXiv': { bg: '#EDE9FE', text: '#5B21B6' },
  'Semantic Scholar': { bg: '#DBEAFE', text: '#1E40AF' },
  'PubMed': { bg: '#D1FAE5', text: '#065F46' },
  'CrossRef': { bg: '#FEF3C7', text: '#92400E' },
}

function relevancePct(score: number) {
  return Math.round(Math.min(1, score + 0.55) * 100)
}

function scoreBadge(score: number) {
  const pct = relevancePct(score)
  if (pct >= 85) return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', icon: '🎯' }
  if (pct >= 65) return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: '⚠️' }
  return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB', icon: '📌' }
}

function SearchPaperCard({ paper, rank }: { paper: SearchPaper; rank: number }) {
  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)
  const sourceColor = SOURCE_COLORS[paper.source] ?? { bg: '#F3F4F6', text: '#6B7280' }
  const badge = scoreBadge(paper.relevanceScore)
  const pct = relevancePct(paper.relevanceScore)

  const handleShare = async () => {
    try {
      await navigator.share({ title: paper.title, url: paper.arxivUrl })
    } catch {
      await navigator.clipboard.writeText(paper.arxivUrl)
    }
  }

  return (
    <article
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 animate-fadeIn"
      style={{ animationDelay: `${rank * 60}ms`, animationFillMode: 'both' }}
      aria-label={`Paper ${rank + 1}: ${paper.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rank badge */}
          {rank < 5 && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {rank + 1}
            </span>
          )}
          {/* Source badge */}
          <span
            className="text-xs font-medium rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: sourceColor.bg, color: sourceColor.text }}
          >
            {paper.source}
          </span>
        </div>

        {/* Relevance score */}
        <span
          className="text-xs font-semibold rounded-md px-2.5 py-1 border shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
        >
          {badge.icon} {pct}% match
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
        {paper.title}
      </h3>

      {/* Authors + date */}
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
        {paper.authors}
        {paper.publishedAt && (
          <> · <span>{paper.publishedAt.getFullYear()}</span></>
        )}
      </p>

      {/* Abstract */}
      {paper.abstract && paper.abstract !== 'See PubMed for abstract.' && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {paper.abstract}
        </p>
      )}

      {/* Topics */}
      {paper.topics.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {paper.topics.slice(0, 3).map(t => (
            <span
              key={t}
              className="inline-block px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Citations */}
      {paper.citations > 0 && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          📚 {paper.citations.toLocaleString()} citations
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-1.5 rounded-md transition-colors ${bookmarked ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            aria-pressed={bookmarked}
            aria-label="Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setLiked(!liked)}
            className={`p-1.5 rounded-md transition-colors ${liked ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            aria-pressed={liked}
            aria-label="Like"
          >
            <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href={paper.arxivUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          Read Paper <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  )
}

function DigestSummary({ results, query }: { results: SearchPaper[]; query: string }) {
  const top5 = results.slice(0, 5)
  const sources = [...new Set(results.map(r => r.source))]
  const avgCitations = Math.round(
    results.filter(r => r.citations > 0).reduce((a, r) => a + r.citations, 0) /
    (results.filter(r => r.citations > 0).length || 1),
  )

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            AI Digest for "{query}"
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Found <strong>{results.length} papers</strong> across{' '}
            <strong>{sources.join(', ')}</strong>. Top result:{' '}
            <em className="text-blue-700 dark:text-blue-300">"{top5[0]?.title?.slice(0, 60)}…"</em>.
            {avgCitations > 0 && (
              <> Average citation count: <strong>{avgCitations.toLocaleString()}</strong>.</>
            )}
          </p>

          {/* Key insights */}
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Key Insights
            </p>
            {top5.slice(0, 3).map((p, i) => (
              <div key={p.id} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-blue-500 font-bold shrink-0">#{i + 1}</span>
                <span className="line-clamp-1">{p.title}</span>
                <span className="text-slate-400 shrink-0">({p.source})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SearchOverlayProps extends SearchState {
  onClose: () => void
  onSearch: (q: string) => void
}

export function SearchOverlay({ results, isLoading, error, query, sourceStats, onClose, onSearch }: SearchOverlayProps) {
  const [input, setInput] = useState(query)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) onSearch(input.trim())
  }

  const handleExportPDF = () => {
    const ok = exportDigestAsPDF(results, query)
    if (!ok) toast.error('Pop-ups are blocked. Please allow pop-ups and try again.')
    else toast.success('PDF opened — use your browser\'s print dialog to save.')
  }

  const handleCopyLink = async () => {
    const url = getShareableUrl(query)
    await navigator.clipboard.writeText(url)
    setLinkCopied(true)
    toast.success('Shareable link copied to clipboard!')
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const sources = Object.entries(sourceStats)
  const top5 = results.slice(0, 5)
  const rest = results.slice(5)

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex flex-col" role="dialog" aria-modal="true" aria-label="Paper search">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Back to feed"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Try "Quantum AI", "LLM alignment", "protein folding"…'
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sources + actions row */}
      {sources.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">Sources:</span>
          {sources.map(([src, count]) => {
            const c = SOURCE_COLORS[src] ?? { bg: '#F3F4F6', text: '#6B7280' }
            return (
              <span
                key={src}
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {src} ({count})
              </span>
            )
          })}
          <span className="text-xs text-slate-400">{results.length} papers</span>

          {/* Export / Share actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                linkCopied
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500'
              }`}
              aria-label="Copy shareable link"
              title="Copy shareable link"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              {linkCopied ? 'Copied!' : 'Share Link'}
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label="Export digest as PDF"
              title="Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              Save PDF
            </button>
          </div>
        </div>
      )}

      {/* Workflow explanation (empty state) */}
      {!isLoading && results.length === 0 && !error && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔬</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Source Paper Search</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter a topic to search across 4 academic databases simultaneously
              </p>
            </div>

            {/* Workflow steps */}
            <div className="space-y-3">
              {[
                { icon: '💬', step: '1', label: 'Enter a topic', desc: 'e.g. "Quantum AI", "LLM alignment", "protein folding"' },
                { icon: '🔍', step: '2', label: 'Searches 4 sources in parallel', desc: 'arXiv · Semantic Scholar · PubMed · CrossRef' },
                { icon: '📊', step: '3', label: 'Ranks by relevance + recency', desc: 'Deduplicates and scores papers automatically' },
                { icon: '✨', step: '4', label: 'Generates a digest', desc: 'Top 5 papers + key insights summary' },
              ].map(({ icon, step, label, desc }) => (
                <div key={step} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-xl">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-300 dark:text-slate-600 font-bold">Step {step}</span>
                </div>
              ))}
            </div>

            {/* Quick topics */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Try these topics</p>
              <div className="flex flex-wrap gap-2">
                {['Quantum AI', 'LLM alignment', 'Protein folding', 'Diffusion models', 'Graph neural networks', 'Reinforcement learning', 'Computer vision', 'RAG systems'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setInput(t); onSearch(t) }}
                    className="px-3 py-1.5 rounded-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900 dark:text-white">Searching academic databases…</p>
            <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              {['arXiv', 'Semantic Scholar', 'PubMed', 'CrossRef'].map(src => {
                const c = SOURCE_COLORS[src] ?? { bg: '#F3F4F6', text: '#6B7280' }
                return (
                  <span
                    key={src}
                    className="text-xs font-medium px-2 py-0.5 rounded-full animate-pulse"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {src}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-3">😕</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{error}</p>
            <button onClick={() => onSearch(query)} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {/* AI Digest summary */}
            <DigestSummary results={results} query={query} />

            {/* Top 5 */}
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-blue-600">⭐</span> Top 5 Most Relevant
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {top5.map((p, i) => (
                <SearchPaperCard key={p.id} paper={p} rank={i} />
              ))}
            </div>

            {/* Remaining */}
            {rest.length > 0 && (
              <>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  More Papers ({rest.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rest.map((p, i) => (
                    <SearchPaperCard key={p.id} paper={p} rank={i + 5} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
