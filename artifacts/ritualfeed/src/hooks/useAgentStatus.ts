import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESS, DIGEST_AGENT_ABI } from '../config'

const ENABLED = CONTRACT_ADDRESS !== 'YOUR_CONTRACT_ADDRESS'

export function useAgentStatus() {
  const { data: cycleCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getCycleCount',
    query: { refetchInterval: 6000, enabled: ENABLED },
  })

  const { data: walletBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getWalletBalance',
    query: { refetchInterval: 12000, enabled: ENABLED },
  })

  const { data: nextWakeupBlock } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getNextWakeupBlock',
    query: { refetchInterval: 6000, enabled: ENABLED },
  })

  return {
    cycleCount: cycleCount != null ? Number(cycleCount) : null,
    walletBalance: walletBalance != null ? Number(formatEther(walletBalance as bigint)).toFixed(4) : null,
    nextWakeupBlock: nextWakeupBlock != null ? Number(nextWakeupBlock) : null,
  }
}
