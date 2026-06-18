import { useState, useEffect, useCallback } from 'react'
import type { Paper } from './useDigest'
import { inferTopic } from '../utils/paperUtils'
import { MOCK_DIGEST } from '../data/mockDigest'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

interface LivePaper extends Paper {
  authors?: string
}

const ARXIV_CATS = [
  'cs.LG',  // Machine Learning
  'cs.CV',  // Computer Vision
  'cs.CL',  // Computation and Language (NLP)
  'cs.AI',  // Artificial Intelligence
  'cs.NE',  // Neural and Evolutionary Computing
]

async function fetchArxivCat(cat: string, maxResults = 6): Promise<LivePaper[]> {
  const url =
    `https://export.arxiv.org/api/query?search_query=cat:${cat}` +
    `&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`arXiv fetch failed for ${cat}`)
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
    const arxivId = idUrl.split('/abs/').pop()?.replace(/v\d+$/, '') ?? String(i)
    const published = e.querySelector('published')?.textContent?.trim() ?? ''
    // Score: first results score higher, slight random variation
    const baseScore = Math.max(0.5, 0.97 - i * 0.04)
    const score = Math.min(0.99, baseScore + (Math.random() * 0.04 - 0.02))

    return {
      title,
      authors: authors || undefined,
      score,
      summary,
      arxivUrl: `https://arxiv.org/abs/${arxivId}`,
      topic: inferTopic(title),
      publishedAt: published ? new Date(published) : new Date(),
      cycleCount: 0,
    }
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const results = await Promise.allSettled(
        ARXIV_CATS.map(cat => fetchArxivCat(cat, 6))
      )

      const all: LivePaper[] = []
      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value)
      }

      if (all.length === 0) {
        setPapers(mockFallback())
      } else {
        // Deduplicate by normalised title prefix
        const seen = new Set<string>()
        const unique = all.filter(p => {
          const key = p.title.toLowerCase().slice(0, 60)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setPapers(unique)
        setLastUpdated(new Date())
      }
    } catch {
      setPapers(mockFallback())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchAll])

  return { papers, isLoading, lastUpdated, refetch: fetchAll }
}
