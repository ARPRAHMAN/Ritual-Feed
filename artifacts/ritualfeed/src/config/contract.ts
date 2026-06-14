export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? 'YOUR_CONTRACT_ADDRESS') as `0x${string}`
export const SUBSCRIPTION_PRICE = BigInt(import.meta.env.VITE_SUBSCRIPTION_PRICE_WEI ?? '10000000000000000')
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL ?? 'https://explorer.ritualfoundation.org'
