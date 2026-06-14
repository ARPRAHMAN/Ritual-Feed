export type PaperTopic = 'ML' | 'CV' | 'NLP' | 'RL' | 'Other'

export function inferTopic(title: string): PaperTopic {
  const lower = title.toLowerCase()
  if (/vision|image|detection|segmentation|pixel|visual|object|scene|depth|pose/.test(lower)) {
    return 'CV'
  }
  if (/language|text|bert|gpt|transformer|token|embedding|nlp|translation|summariz|dialogue/.test(lower)) {
    return 'NLP'
  }
  if (/reinforcement|reward|policy|agent|q-learning|actor|critic|exploration|mpc|control/.test(lower)) {
    return 'RL'
  }
  return 'ML'
}

export function extractArxivUrl(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .slice(0, 4)
    .join('-')
  return `https://arxiv.org/search/?query=${encodeURIComponent(slug)}&searchtype=all`
}

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatEther4dp(wei: bigint): string {
  const eth = Number(wei) / 1e18
  return eth.toFixed(4)
}
