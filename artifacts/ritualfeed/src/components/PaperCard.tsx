import React, { useState } from 'react'
import { Heart, Bookmark, Share2, ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '../utils/paperUtils'

export type PaperTopic = 'ML' | 'CV' | 'NLP' | 'RL' | 'Other'

const TOPIC_LABELS: Record<PaperTopic, string> = {
  ML: 'Machine Learning',
  CV: 'Computer Vision',
  NLP: 'NLP',
  RL: 'Reinforcement Learning',
  Other: 'Other',
}

function scoreBadgeStyle(score: number): { bg: string; text: string; border: string; icon: string } {
  if (score >= 0.85)
    return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', icon: '🎯' }
  if (score >= 0.65)
    return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: '⚠️' }
  return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB', icon: '📌' }
}

export interface PaperCardProps {
  title: string
  authors?: string
  score: number
  summary: string
  aiSummary?: string
  arxivUrl: string
  topic: PaperTopic
  topicTags?: string[]
  citations?: number
  publishedAt: Date
}

export function PaperCard({
  title,
  authors,
  score,
  summary,
  aiSummary,
  arxivUrl,
  topic,
  topicTags = [],
  citations,
  publishedAt,
}: PaperCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const { bg, text, border, icon } = scoreBadgeStyle(score)
  const pct = Math.round(score * 100)

  const handleShare = async () => {
    try {
      await navigator.share({ title, url: arxivUrl })
    } catch {
      await navigator.clipboard.writeText(arxivUrl)
    }
  }

  return (
    <article
      className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 flex flex-col gap-0"
      aria-label={`Paper: ${title}`}
    >
      {/* Header row: topic + score */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-medium rounded-full px-2.5 py-1"
          style={{ backgroundColor: '#EDE9FE', color: '#5B21B6' }}
        >
          {TOPIC_LABELS[topic]}
        </span>
        <span
          className="text-xs font-semibold rounded-md px-2.5 py-1 shrink-0 border"
          style={{ backgroundColor: bg, color: text, borderColor: border }}
          aria-label={`Relevance score: ${pct}%`}
        >
          {icon} {pct}% match
        </span>
      </div>

      {/* Title */}
      <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
        {title}
      </h2>

      {/* Authors */}
      {authors && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className="font-medium">Authors:</span> {authors}
        </p>
      )}

      {/* Abstract */}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
        {summary}
      </p>

      {/* AI Summary */}
      {aiSummary && (
        <div className="mt-3 p-2.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
            ✨ AI Summary
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 line-clamp-2 leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

      {/* Topic tags */}
      {topicTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topicTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
          {topicTags.length > 3 && (
            <span className="text-xs text-slate-400 self-center">
              +{topicTags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Citations */}
      {citations !== undefined && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          📚 {citations.toLocaleString()} citations
        </p>
      )}

      {/* Footer: arXiv link + social actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatRelativeTime(publishedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              isBookmarked
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
            }`}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Like */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              isLiked
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
            }`}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Unlike paper' : 'Like paper'}
            title={isLiked ? 'Liked' : 'Like'}
          >
            <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors duration-200"
            aria-label="Share paper"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* arXiv link */}
          <a
            href={arxivUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors duration-200"
            aria-label={`Read ${title} on arXiv (opens in new tab)`}
          >
            arXiv <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  )
}

export function PaperCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse"
      aria-label="Loading paper..."
    >
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
      </div>
      <div className="mt-1.5 h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-3/4" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-3/4" />
      </div>
      <div className="mt-3 h-14 bg-blue-50 dark:bg-blue-900/10 rounded-md" />
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700/60 rounded" />
        <div className="flex gap-1">
          <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-7 w-16 bg-blue-200 dark:bg-blue-900/30 rounded-md" />
        </div>
      </div>
    </div>
  )
}
