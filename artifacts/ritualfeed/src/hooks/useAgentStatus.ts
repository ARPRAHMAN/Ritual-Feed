import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESS, DIGEST_AGENT_ABI, IS_CONFIGURED } from '../config'

export function useAgentStatus() {
  const { data: cycleCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getCycleCount',
    query: { refetchInterval: 6000, enabled: IS_CONFIGURED },
  })

  const { data: walletBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getWalletBalance',
    query: { refetchInterval: 12000, enabled: IS_CONFIGURED },
  })

  const { data: nextWakeupBlock } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'getNextWakeupBlock',
    query: { refetchInterval: 6000, enabled: IS_CONFIGURED },
  })

  return {
    cycleCount: cycleCount != null ? Number(cycleCount) : null,
    walletBalance:
      walletBalance != null
        ? Number(formatEther(walletBalance as bigint)).toFixed(4)
        : null,
    nextWakeupBlock: nextWakeupBlock != null ? Number(nextWakeupBlock) : null,
  }
}
