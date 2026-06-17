import type { SearchPaper } from './searchApis'

function relevancePct(score: number) {
  return Math.round(Math.min(1, score + 0.55) * 100)
}

function scoreLabel(score: number) {
  const pct = relevancePct(score)
  if (pct >= 85) return '🎯 High'
  if (pct >= 65) return '⚠️ Medium'
  return '📌 Low'
}

export function exportDigestAsPDF(papers: SearchPaper[], query: string) {
  const top5 = papers.slice(0, 5)
  const sources = [...new Set(papers.map(p => p.source))].join(', ')
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const paperRows = top5.map((p, i) => {
    const pct = relevancePct(p.relevanceScore)
    const label = scoreLabel(p.relevanceScore)
    const topics = p.topics.slice(0, 3).map(t => `#${t}`).join(' ')
    const abstract = p.abstract !== 'See PubMed for abstract.'
      ? p.abstract.slice(0, 300) + (p.abstract.length > 300 ? '…' : '')
      : ''

    return `
      <div class="paper">
        <div class="paper-header">
          <span class="rank">#${i + 1}</span>
          <span class="source source-${p.source.toLowerCase().replace(/\s/g, '-')}">${p.source}</span>
          <span class="score">${label} · ${pct}% match</span>
        </div>
        <h3>${p.title}</h3>
        <p class="authors">${p.authors} · ${p.publishedAt.getFullYear()}</p>
        ${abstract ? `<p class="abstract">${abstract}</p>` : ''}
        ${topics ? `<p class="topics">${topics}</p>` : ''}
        ${p.citations > 0 ? `<p class="citations">📚 ${p.citations.toLocaleString()} citations</p>` : ''}
        <a href="${p.arxivUrl}" class="link">${p.arxivUrl}</a>
      </div>
    `
  }).join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RitualFeed Digest – ${query}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      color: #111827;
      background: #fff;
      padding: 40px;
      max-width: 780px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      width: 32px; height: 32px;
      background: #2563EB;
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
    }
    .logo-name { font-size: 20px; font-weight: 700; color: #2563EB; }
    .meta { font-size: 11px; color: #6B7280; text-align: right; }
    .summary {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-left: 4px solid #2563EB;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .summary h2 { font-size: 15px; color: #1E40AF; margin-bottom: 6px; }
    .summary p { color: #374151; line-height: 1.6; }
    .summary strong { color: #1E40AF; }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E5E7EB;
    }
    .paper {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      page-break-inside: avoid;
    }
    .paper-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .rank {
      width: 24px; height: 24px;
      background: #2563EB;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }
    .source {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
    }
    .source-arxiv { background: #EDE9FE; color: #5B21B6; }
    .source-semantic-scholar { background: #DBEAFE; color: #1E40AF; }
    .source-pubmed { background: #D1FAE5; color: #065F46; }
    .source-crossref { background: #FEF3C7; color: #92400E; }
    .score { font-size: 11px; color: #6B7280; margin-left: auto; }
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      line-height: 1.4;
      margin-bottom: 4px;
    }
    .authors { font-size: 11px; color: #6B7280; margin-bottom: 8px; }
    .abstract { font-size: 12px; color: #374151; line-height: 1.6; margin-bottom: 8px; }
    .topics { font-size: 11px; color: #7C3AED; margin-bottom: 4px; }
    .citations { font-size: 11px; color: #9CA3AF; margin-bottom: 6px; }
    .link { font-size: 10px; color: #2563EB; text-decoration: none; word-break: break-all; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .paper { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-badge">RF</div>
      <span class="logo-name">RitualFeed</span>
    </div>
    <div class="meta">
      <div><strong>Research Digest</strong></div>
      <div>Generated ${now}</div>
      <div>Sources: ${sources}</div>
    </div>
  </div>

  <div class="summary">
    <h2>🤖 AI Digest for "${query}"</h2>
    <p>
      Found <strong>${papers.length} papers</strong> across <strong>${sources}</strong>.
      Top result: <em>${top5[0]?.title?.slice(0, 80) ?? ''}…</em>
    </p>
    <p style="margin-top:8px; font-size:11px; color:#4B5563;">
      ${top5.slice(0, 3).map((p, i) => `<strong>#${i + 1}</strong> ${p.title.slice(0, 60)}…`).join(' &nbsp;|&nbsp; ')}
    </p>
  </div>

  <div class="section-title">⭐ Top ${top5.length} Papers</div>
  ${paperRows}

  <div class="footer">
    Generated by RitualFeed · Autonomous AI Research Digest on Ritual Chain · ritualfeed.app
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return false
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
    }, 400)
  }
  return true
}

export function getShareableUrl(query: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('q', query)
  return url.toString()
}

export function parseSearchQuery(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('q')
}

export function setUrlQuery(query: string | null) {
  const url = new URL(window.location.href)
  if (query) {
    url.searchParams.set('q', query)
  } else {
    url.searchParams.delete('q')
  }
  window.history.replaceState({}, '', url.toString())
}
