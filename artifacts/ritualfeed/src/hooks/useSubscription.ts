import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, DIGEST_AGENT_ABI, SUBSCRIPTION_PRICE, IS_CONFIGURED } from '../config'

export function useSubscription() {
  const { address } = useAccount()

  const { data: isSubscribed, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DIGEST_AGENT_ABI,
    functionName: 'isSubscribed',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address && IS_CONFIGURED },
  })

  const {
    writeContract: subscribeWrite,
    isPending: isSubscribing,
    error: subscribeError,
  } = useWriteContract()

  const {
    writeContract: unsubscribeWrite,
    isPending: isUnsubscribing,
    error: unsubscribeError,
  } = useWriteContract()

  const handleSubscribe = () => {
    subscribeWrite({
      address: CONTRACT_ADDRESS,
      abi: DIGEST_AGENT_ABI,
      functionName: 'subscribe',
      value: SUBSCRIPTION_PRICE,
    })
  }

  const handleUnsubscribe = () => {
    unsubscribeWrite({
      address: CONTRACT_ADDRESS,
      abi: DIGEST_AGENT_ABI,
      functionName: 'unsubscribe',
    })
  }

  return {
    isSubscribed: isSubscribed as boolean | undefined,
    handleSubscribe,
    handleUnsubscribe,
    isSubscribing,
    isUnsubscribing,
    subscribeError,
    unsubscribeError,
    refetchStatus,
  }
}
