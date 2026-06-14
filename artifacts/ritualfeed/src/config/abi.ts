export const DIGEST_AGENT_ABI = [
  {
    type: 'function',
    name: 'getLatestDigest',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'titles', type: 'string[]' },
      { name: 'scores', type: 'uint256[]' },
      { name: 'summaries', type: 'string[]' },
      { name: 'cycleCount', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getCycleCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getWalletBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getNextWakeupBlock',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'isSubscribed',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'subscribe',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'unsubscribe',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'DigestPublished',
    inputs: [
      { name: 'cycleId', type: 'uint256', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
      { name: 'paperCount', type: 'uint8', indexed: false },
    ],
  },
] as const

export interface Digest {
  titles: string[]
  scores: bigint[]
  summaries: string[]
  cycleCount: bigint
  lastUpdated: bigint
}
