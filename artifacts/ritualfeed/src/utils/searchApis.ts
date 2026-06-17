export interface SearchPaper {
  id: string
  title: string
  authors: string
  abstract: string
  arxivUrl: string
  source: 'arXiv' | 'Semantic Scholar' | 'PubMed' | 'CrossRef'
  publishedAt: Date
  citations: number
  relevanceScore: number
  topics: string[]
  doi?: string
}

function computeRelevance(text: string, query: string): number {
  const q = query.toLowerCase().split(/\s+/)
  const t = text.toLowerCase()
  let hits = 0
  let exact = 0
  q.forEach(w => {
    const re = new RegExp(w, 'g')
    const matches = t.match(re)
    if (matches) hits += matches.length
  })
  if (t.includes(query.toLowerCase())) exact = 5
  return Math.min(1, (hits * 0.1 + exact * 0.2))
}

// ── arXiv ──────────────────────────────────────────────────────────────────
export async function searchArxiv(query: string, maxResults = 8): Promise<SearchPaper[]> {
  const encoded = encodeURIComponent(query)
  const url = `https://export.arxiv.org/api/query?search_query=all:${encoded}&max_results=${maxResults}&sortBy=lastUpdatedDate&sortOrder=descending`
  const res = await fetch(url)
  if (!res.ok) throw new Error('arXiv fetch failed')
  const text = await res.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const entries = Array.from(xml.querySelectorAll('entry'))

  return entries.map((e, i) => {
    const title = e.querySelector('title')?.textContent?.trim() ?? ''
    const abstract = e.querySelector('summary')?.textContent?.trim() ?? ''
    const authors = Array.from(e.querySelectorAll('author name'))
      .map(a => a.textContent?.trim() ?? '')
      .slice(0, 3)
      .join(', ')
    const link = e.querySelector('link[title="pdf"]')?.getAttribute('href')
      ?? e.querySelector('id')?.textContent?.trim()
      ?? ''
    const arxivId = link.split('/').pop() ?? String(i)
    const published = e.querySelector('published')?.textContent?.trim() ?? ''
    const relevance = computeRelevance(title + ' ' + abstract, query)
    const cats = Array.from(e.querySelectorAll('category'))
      .map(c => c.getAttribute('term') ?? '')
      .filter(Boolean)
      .slice(0, 3)

    return {
      id: `arxiv-${arxivId}`,
      title,
      authors: authors || 'Unknown authors',
      abstract,
      arxivUrl: `https://arxiv.org/abs/${arxivId}`,
      source: 'arXiv' as const,
      publishedAt: published ? new Date(published) : new Date(),
      citations: 0,
      relevanceScore: relevance,
      topics: cats,
      doi: undefined,
    }
  })
}

// ── Semantic Scholar ────────────────────────────────────────────────────────
export async function searchSemanticScholar(query: string, limit = 8): Promise<SearchPaper[]> {
  const fields = 'title,authors,abstract,year,citationCount,externalIds,fieldsOfStudy,url'
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Semantic Scholar fetch failed')
  const json = await res.json() as {
    data?: Array<{
      paperId: string
      title: string
      authors?: Array<{ name: string }>
      abstract?: string
      year?: number
      citationCount?: number
      externalIds?: { DOI?: string; ArXiv?: string }
      fieldsOfStudy?: string[]
      url?: string
    }>
  }
  const items = json.data ?? []

  return items
    .filter(p => p.title && p.abstract)
    .map(p => {
      const arxivId = p.externalIds?.ArXiv
      const arxivUrl = arxivId
        ? `https://arxiv.org/abs/${arxivId}`
        : (p.url ?? `https://www.semanticscholar.org/paper/${p.paperId}`)
      const abstract = p.abstract ?? ''
      const relevance = computeRelevance(p.title + ' ' + abstract, query)

      return {
        id: `ss-${p.paperId}`,
        title: p.title,
        authors: (p.authors ?? []).map(a => a.name).slice(0, 3).join(', ') || 'Unknown',
        abstract,
        arxivUrl,
        source: 'Semantic Scholar' as const,
        publishedAt: p.year ? new Date(p.year, 0, 1) : new Date(),
        citations: p.citationCount ?? 0,
        relevanceScore: relevance,
        topics: (p.fieldsOfStudy ?? []).slice(0, 3),
        doi: p.externalIds?.DOI,
      }
    })
}

// ── PubMed ──────────────────────────────────────────────────────────────────
export async function searchPubMed(query: string, maxResults = 5): Promise<SearchPaper[]> {
  const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  const searchRes = await fetch(
    `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}&sort=relevance`,
  )
  if (!searchRes.ok) return []
  const searchJson = await searchRes.json() as {
    esearchresult?: { idlist?: string[] }
  }
  const ids: string[] = searchJson.esearchresult?.idlist ?? []
  if (ids.length === 0) return []

  const fetchRes = await fetch(
    `${baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
  )
  if (!fetchRes.ok) return []
  const fetchJson = await fetchRes.json() as {
    result?: Record<string, {
      uid: string
      title: string
      authors?: Array<{ name: string }>
      lastrevisiondate?: string
      sortpubdate?: string
    }>
  }
  const result = fetchJson.result ?? {}

  return ids
    .filter(id => result[id])
    .map(id => {
      const p = result[id]
      const title = p.title ?? ''
      const relevance = computeRelevance(title, query)
      const date = p.sortpubdate ?? p.lastrevisiondate ?? ''

      return {
        id: `pubmed-${p.uid}`,
        title,
        authors: (p.authors ?? []).map(a => a.name).slice(0, 3).join(', ') || 'Unknown',
        abstract: 'See PubMed for abstract.',
        arxivUrl: `https://pubmed.ncbi.nlm.nih.gov/${p.uid}/`,
        source: 'PubMed' as const,
        publishedAt: date ? new Date(date) : new Date(),
        citations: 0,
        relevanceScore: relevance,
        topics: ['Biomedical'],
        doi: undefined,
      }
    })
}

// ── CrossRef ─────────────────────────────────────────────────────────────────
export async function searchCrossRef(query: string, rows = 5): Promise<SearchPaper[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}&sort=relevance&select=DOI,title,author,abstract,published,is-referenced-by-count,subject`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json() as {
    message?: {
      items?: Array<{
        DOI?: string
        title?: string[]
        author?: Array<{ given?: string; family?: string }>
        abstract?: string
        published?: { 'date-parts'?: number[][] }
        'is-referenced-by-count'?: number
        subject?: string[]
      }>
    }
  }
  const items = json.message?.items ?? []

  return items
    .filter(p => p.title?.[0])
    .map(p => {
      const title = p.title?.[0] ?? ''
      const abstract = p.abstract?.replace(/<[^>]+>/g, '') ?? ''
      const relevance = computeRelevance(title + ' ' + abstract, query)
      const parts = p.published?.['date-parts']?.[0]
      const publishedAt = parts ? new Date(parts[0], (parts[1] ?? 1) - 1, parts[2] ?? 1) : new Date()
      const doi = p.DOI ?? ''
      const authors = (p.author ?? [])
        .map(a => [a.given, a.family].filter(Boolean).join(' '))
        .slice(0, 3)
        .join(', ')

      return {
        id: `crossref-${doi}`,
        title,
        authors: authors || 'Unknown',
        abstract: abstract || 'No abstract available.',
        arxivUrl: doi ? `https://doi.org/${doi}` : '#',
        source: 'CrossRef' as const,
        publishedAt,
        citations: p['is-referenced-by-count'] ?? 0,
        relevanceScore: relevance,
        topics: (p.subject ?? []).slice(0, 3),
        doi,
      }
    })
}

// ── Merge + rank ──────────────────────────────────────────────────────────────
export function mergeAndRank(papers: SearchPaper[], query: string): SearchPaper[] {
  const seen = new Set<string>()
  const unique = papers.filter(p => {
    const key = p.title.toLowerCase().slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const q = query.toLowerCase()
  return unique
    .map(p => ({
      ...p,
      relevanceScore: computeRelevance(p.title + ' ' + p.abstract, q),
    }))
    .sort((a, b) => {
      const scoreDiff = b.relevanceScore - a.relevanceScore
      if (Math.abs(scoreDiff) > 0.05) return scoreDiff
      return b.publishedAt.getTime() - a.publishedAt.getTime()
    })
}
