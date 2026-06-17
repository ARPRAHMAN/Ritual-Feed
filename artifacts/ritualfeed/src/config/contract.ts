const _raw = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined

export const IS_CONFIGURED = Boolean(_raw && _raw.startsWith('0x') && _raw.length === 42)

export const CONTRACT_ADDRESS: `0x${string}` = IS_CONFIGURED
  ? (_raw as `0x${string}`)
  : '0x0000000000000000000000000000000000000000'

export const SUBSCRIPTION_PRICE = BigInt(
  import.meta.env.VITE_SUBSCRIPTION_PRICE_WEI ?? '10000000000000000'
)
export const EXPLORER_URL =
  import.meta.env.VITE_EXPLORER_URL ?? 'https://explorer.ritualfoundation.org'
