const _rawContract = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined
const _rawReceiver = import.meta.env.VITE_RECEIVER_ADDRESS as string | undefined

const isValidAddress = (s: string | undefined): s is string =>
  Boolean(s && s.startsWith('0x') && s.length === 42)

// Mode 1: full DigestAgent contract connected
export const IS_CONFIGURED = isValidAddress(_rawContract)

// Mode 2: direct wallet payment (no contract needed — just a receiver address)
export const IS_DIRECT_PAYMENT = !IS_CONFIGURED && isValidAddress(_rawReceiver)

export const CONTRACT_ADDRESS: `0x${string}` = IS_CONFIGURED
  ? (_rawContract as `0x${string}`)
  : '0x0000000000000000000000000000000000000000'

// The wallet address that receives subscription fees in direct-payment mode
export const RECEIVER_ADDRESS: `0x${string}` | null = IS_DIRECT_PAYMENT
  ? (_rawReceiver as `0x${string}`)
  : null

export const SUBSCRIPTION_PRICE = BigInt(
  import.meta.env.VITE_SUBSCRIPTION_PRICE_WEI ?? '10000000000000000' // 0.01 RITUAL
)
export const EXPLORER_URL =
  import.meta.env.VITE_EXPLORER_URL ?? 'https://explorer.ritualfoundation.org'
