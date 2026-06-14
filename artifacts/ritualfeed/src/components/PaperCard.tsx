import React from 'react'
import { formatRelativeTime } from '../utils/paperUtils'

export type PaperTopic = 'ML' | 'CV' | 'NLP' | 'RL' | 'Other'

const TOPIC_LABELS: Record<PaperTopic, string> = {
  ML: 'Machine Learning',
  CV: 'Computer Vision',
  NLP: 'NLP',
  RL: 'Reinforcement Learning',
  Other: 'Other',
}

function scoreBadgeStyle(score: number): { bg: string; text: string; label: string } {
  if (score >= 0.85) return { bg: '#D1FAE5', text: '#065F46', label: 'High match' }
  if (score >= 0.65) return { bg: '#FEF3C7', text: '#92400E', label: 'Medium match' }
  return { bg: '#F3F4F6', text: '#6B7280', label: 'Low match' }
}

export interface PaperCardProps {
  title: string
  score: number
  summary: string
  arxivUrl: string
  topic: PaperTopic
  publishedAt: Date
}

export function PaperCard({ title, score, summary, arxivUrl, topic, publishedAt }: PaperCardProps) {
  const { bg, text } = scoreBadgeStyle(score)
  const pct = Math.round(score * 100)

  return (
    <article
      className="bg-white border border-[#E2E8F0] rounded-xl p-6 transition-shadow duration-200 hover:shadow-md flex flex-col gap-0"
      aria-label={`Paper: ${title}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-medium rounded-full px-2.5 py-1"
          style={{ backgroundColor: '#EEF2FF', color: '#3730A3' }}
        >
          {TOPIC_LABELS[topic]}
        </span>
        <span
          className="text-xs font-semibold rounded-full px-2.5 py-1 shrink-0"
          style={{ backgroundColor: bg, color: text }}
          aria-label={`Relevance score: ${pct}%`}
        >
          {pct}% match
        </span>
      </div>

      <h2
        className="mt-3 text-base font-semibold text-[#0F2D4A] line-clamp-2 leading-snug"
      >
        {title}
      </h2>

      <p className="mt-2 text-sm text-[#4B5563] line-clamp-3 leading-relaxed">
        {summary}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[#9CA3AF]">{formatRelativeTime(publishedAt)}</span>
        <a
          href={arxivUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#1A6FB0] hover:underline"
          aria-label={`Read ${title} on arXiv (opens in new tab)`}
        >
          Read on arXiv →
        </a>
      </div>
    </article>
  )
}

export function PaperCardSkeleton() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 animate-pulse" aria-label="Loading paper...">
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-28 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="mt-2 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
