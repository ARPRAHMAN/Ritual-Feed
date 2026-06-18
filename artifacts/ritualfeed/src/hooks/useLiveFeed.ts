import { useState, useEffect, useCallback, useRef } from 'react'
import type { Paper } from './useDigest'
import { inferTopic } from '../utils/paperUtils'
import type { PaperTopic } from '../utils/paperUtils'
import { MOCK_DIGEST } from '../data/mockDigest'

export interface LivePaper extends Paper {
  authors?: string
}

const REFRESH_INTERVAL_MS = 10 * 60 * 1000
const BATCH = 12

// Category → forced topic (null means use inferTopic on title)
const ARXIV_CATS: Array<{ cat: string; topicOverride: PaperTopic | null }> = [
  { cat: 'cs.LG', topicOverride: 'ML' },   // Machine Learning
  { cat: 'cs.CV', topicOverride: 'CV' },   // Computer Vision
  { cat: 'cs.CL', topicOverride: 'NLP' },  // Computation and Language
  { cat: 'cs.AI', topicOverride: null },    // Artificial Intelligence — infer from title
  { cat: 'cs.NE', topicOverride: 'ML' },   // Neural & Evolutionary Computing
  { cat: 'cs.RO', topicOverride: 'RL' },   // Robotics → maps to RL bucket
]

async function fetchArxivCat(
  cat: string,
  topicOverride: PaperTopic | null,
  maxResults: number,
  start: number,
): Promise<LivePaper[]> {
  const url =
    `https://export.arxiv.org/api/query?search_query=cat:${cat}` +
    `&max_results=${maxResults}&start=${start}` +
    `&sortBy=submittedDate&sortOrder=descending`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`arXiv ${cat} failed`)
  const text = await res.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const entries = Array.from(xml.querySelectorAll('entry'))

  return entries.map((e, i) => {
    const rawTitle = e.querySelector('title')?.textContent?.trim() ?? ''
    const title = rawTitle.replace(/\s+/g, ' ')
    const summary = (e.querySelector('summary')?.textContent?.trim() ?? '')
      .replace(/\s+/g, ' ')
    const authors = Array.from(e.querySelectorAll('author name'))
      .map(a => a.textContent?.trim() ?? '')
      .filter(Boolean)
      .slice(0, 3)
      .join(', ')
    const idUrl = e.querySelector('id')?.textContent?.trim() ?? ''
    const arxivId = idUrl.split('/abs/').pop()?.replace(/v\d+$/, '') ?? String(start + i)
    const published = e.querySelector('published')?.textContent?.trim() ?? ''
    const baseScore = Math.max(0.5, 0.97 - ((start + i) * 0.015))
    const score = Math.min(0.99, baseScore + (Math.random() * 0.04 - 0.02))

    return {
      title,
      authors: authors || undefined,
      score,
      summary,
      arxivUrl: `https://arxiv.org/abs/${arxivId}`,
      // Use forced category topic; fall back to title inference
      topic: topicOverride ?? inferTopic(title),
      publishedAt: published ? new Date(published) : new Date(),
      cycleCount: 0,
    }
  })
}

function dedup(papers: LivePaper[]): LivePaper[] {
  const seen = new Set<string>()
  return papers.filter(p => {
    const key = p.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mockFallback(): LivePaper[] {
  return MOCK_DIGEST.map(p => ({
    title: p.title,
    authors: p.authors,
    score: p.score,
    summary: p.summary,
    arxivUrl: p.arxivUrl,
    topic: p.topic,
    publishedAt: p.publishedAt,
    cycleCount: 0,
  }))
}

export function useLiveFeed() {
  const [papers, setPapers] = useState<LivePaper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Track current offset per category for pagination
  const offsetsRef = useRef<Record<string, number>>(
    Object.fromEntries(ARXIV_CATS.map(c => [c.cat, 0]))
  )

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    // Reset offsets on a full refresh
    const nextOffsets = Object.fromEntries(ARXIV_CATS.map(c => [c.cat, BATCH]))
    try {
      const results = await Promise.allSettled(
        ARXIV_CATS.map(({ cat, topicOverride }) =>
          fetchArxivCat(cat, topicOverride, BATCH, 0)
        )
      )
      const all: LivePaper[] = []
      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value)
      }
      if (all.length === 0) {
        setPapers(mockFallback())
      } else {
        setPapers(dedup(all))
        setLastUpdated(new Date())
        offsetsRef.current = nextOffsets
      }
    } catch {
      setPapers(mockFallback())
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      const results = await Promise.allSettled(
        ARXIV_CATS.map(({ cat, topicOverride }) =>
          fetchArxivCat(cat, topicOverride, BATCH, offsetsRef.current[cat] ?? 0)
        )
      )
      const newPapers: LivePaper[] = []
      for (const r of results) {
        if (r.status === 'fulfilled') newPapers.push(...r.value)
      }
      // Advance offsets
      const updated = { ...offsetsRef.current }
      for (const { cat } of ARXIV_CATS) {
        updated[cat] = (updated[cat] ?? 0) + BATCH
      }
      offsetsRef.current = updated

      if (newPapers.length > 0) {
        setPapers(prev => dedup([...prev, ...newPapers]))
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchAll])

  return { papers, isLoading, isLoadingMore, lastUpdated, refetch: fetchAll, loadMore }
}
