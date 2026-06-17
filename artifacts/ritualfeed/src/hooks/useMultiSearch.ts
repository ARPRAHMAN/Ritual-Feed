import { useState, useCallback } from 'react'
import {
  searchArxiv,
  searchSemanticScholar,
  searchPubMed,
  searchCrossRef,
  mergeAndRank,
  type SearchPaper,
} from '../utils/searchApis'

export interface SearchState {
  results: SearchPaper[]
  isLoading: boolean
  error: string | null
  query: string
  sourceStats: Record<string, number>
}

export function useMultiSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    query: '',
    sourceStats: {},
  })

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return
    setState(s => ({ ...s, isLoading: true, error: null, query, results: [] }))

    try {
      const [arxivResults, ssResults, pubmedResults, crossrefResults] = await Promise.allSettled([
        searchArxiv(query, 8),
        searchSemanticScholar(query, 8),
        searchPubMed(query, 5),
        searchCrossRef(query, 5),
      ])

      const all: SearchPaper[] = []
      const stats: Record<string, number> = {}

      if (arxivResults.status === 'fulfilled') {
        all.push(...arxivResults.value)
        stats['arXiv'] = arxivResults.value.length
      }
      if (ssResults.status === 'fulfilled') {
        all.push(...ssResults.value)
        stats['Semantic Scholar'] = ssResults.value.length
      }
      if (pubmedResults.status === 'fulfilled') {
        all.push(...pubmedResults.value)
        stats['PubMed'] = pubmedResults.value.length
      }
      if (crossrefResults.status === 'fulfilled') {
        all.push(...crossrefResults.value)
        stats['CrossRef'] = crossrefResults.value.length
      }

      const ranked = mergeAndRank(all, query)

      setState({
        results: ranked,
        isLoading: false,
        error: ranked.length === 0 ? 'No papers found. Try a different query.' : null,
        query,
        sourceStats: stats,
      })
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Search failed. Please try again.',
      }))
    }
  }, [])

  const clear = useCallback(() => {
    setState({ results: [], isLoading: false, error: null, query: '', sourceStats: {} })
  }, [])

  return { ...state, search, clear }
}
