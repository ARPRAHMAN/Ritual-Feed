import { useReadContract, useWatchContractEvent } from 'wagmi'
import { CONTRACT_ADDRESS, DIGEST_AGENT_ABI, IS_CONFIGURED } from '../config'
import { inferTopic, extractArxivUrl } from '../utils/paperUtils'

export interface Paper {
  title: string
  score: number
  summary: string
  arxivUrl: string
  topic: 'ML' | 'CV' | 'NLP' | 'RL' | 'Other'
  publishedAt: Date
  cycleCount: number
}

export interface DigestData {
  papers: Paper[]
  cycleCount: number
  lastUpdated: Date
}

export function useDigest() {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getLatestDigest',
    query: { enabled: IS_CONFIGURED },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    eventName: 'DigestPublished',
    onLogs: () => { refetch() },
    enabled: IS_CONFIGURED,
  })

  const digest: DigestData | null = data
    ? {
        papers: (data[0] as string[]).map((title: string, i: number) => ({
          title,
          score: Number((data[1] as bigint[])[i]) / 1e18,
          summary: (data[2] as string[])[i],
          cycleCount: Number(data[3] as bigint),
          lastUpdated: new Date(Number(data[4] as bigint) * 1000),
          topic: inferTopic(title),
          arxivUrl: extractArxivUrl(title),
          publishedAt: new Date(Number(data[4] as bigint) * 1000),
        })),
        cycleCount: Number(data[3] as bigint),
        lastUpdated: new Date(Number(data[4] as bigint) * 1000),
      }
    : null

  return { digest, isLoading, isError, refetch }
}
