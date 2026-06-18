import { useState, useEffect } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { toast } from 'sonner'
import { SUBSCRIPTION_PRICE } from '../config'

function storageKey(address: string) {
  return `rf_subscribed_${address.toLowerCase()}`
}

export function useDirectSubscription(receiverAddress: `0x${string}`) {
  const { address } = useAccount()
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Sync subscription state from localStorage whenever the connected wallet changes
  useEffect(() => {
    if (!address) { setIsSubscribed(false); return }
    setIsSubscribed(localStorage.getItem(storageKey(address)) === 'true')
  }, [address])

  const { sendTransaction, isPending, error } = useSendTransaction()

  const handleSubscribe = () => {
    if (!address) return
    sendTransaction(
      { to: receiverAddress, value: SUBSCRIPTION_PRICE },
      {
        onSuccess: () => {
          localStorage.setItem(storageKey(address), 'true')
          setIsSubscribed(true)
          toast.success('Subscribed! Payment sent to the digest owner.')
        },
        onError: (err) => {
          const msg = (err as { shortMessage?: string }).shortMessage ?? err.message
          toast.error(`Transaction failed: ${msg}`)
        },
      }
    )
  }

  const handleUnsubscribe = () => {
    if (!address) return
    localStorage.removeItem(storageKey(address))
    setIsSubscribed(false)
    toast.success('Unsubscribed.')
  }

  return {
    isSubscribed,
    handleSubscribe,
    handleUnsubscribe,
    isSubscribing: isPending,
    isUnsubscribing: false as const,
    subscribeError: error,
    unsubscribeError: null,
    refetchStatus: () => {},
  }
}
