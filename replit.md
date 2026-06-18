# RitualFeed

Autonomous AI research digest frontend powered by an agent running on Ritual Chain. Reads live paper data from a deployed DigestAgent smart contract, scores papers with on-chain ML, and displays them as a real-time research feed.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ritualfeed run dev` — run the RitualFeed frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS
- Wallet: wagmi v2 + viem v2 (native connectors: MetaMask, Coinbase, WalletConnect)
- Chain: Ritual Testnet (Chain ID 1979), RPC: https://rpc.ritualfoundation.org
- Toast: sonner

## Where things live

- `artifacts/ritualfeed/src/config/` — chain, contract address, ABI
- `artifacts/ritualfeed/src/hooks/` — useDigest, useAgentStatus, useSubscription
- `artifacts/ritualfeed/src/components/` — PaperCard, AgentStatusPanel, NavBar, WalletButton
- `artifacts/ritualfeed/src/pages/Feed.tsx` — main feed page
- `artifacts/ritualfeed/src/data/mockDigest.ts` — demo data (shown when no contract configured)
- `artifacts/ritualfeed/.env.example` — required environment variables

## Environment Variables

Three operating modes depending on which variables are set:

| Variable | Description |
|----------|-------------|
| `VITE_RECEIVER_ADDRESS` | **Your wallet address** — subscribers send 0.01 RITUAL directly here (no contract needed) |
| `VITE_CONTRACT_ADDRESS` | Deployed DigestAgent.sol address — full on-chain mode (takes priority over receiver) |
| `VITE_SUBSCRIPTION_PRICE_WEI` | Subscription price in wei (default: `10000000000000000` = 0.01 RITUAL) |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID from cloud.walletconnect.com |
| `VITE_EXPLORER_URL` | Block explorer base URL (default: https://explorer.ritualfoundation.org) |

## Architecture decisions

- **No backend server needed** — all data comes directly from Ritual Chain via wagmi contract reads
- **Three modes**: demo (no env vars) → direct wallet payment (`VITE_RECEIVER_ADDRESS`) → full contract (`VITE_CONTRACT_ADDRESS`)
- **Direct payment mode** — `useDirectSubscription` sends native RITUAL transfer via `useSendTransaction`; subscription state stored in localStorage per wallet address
- **ConnectKit replaced with native wagmi connectors** — avoids React 19 peer dependency conflicts; uses injected + Coinbase + WalletConnect connectors directly
- **wagmi v2 + viem v2** — pinned for stability; wagmi v3 broke connectkit compatibility
- **Live updates via `useWatchContractEvent`** — auto-refetches feed when `DigestPublished` fires

## Product

- Real-time AI paper feed from arXiv, filtered by ML/CV/NLP/RL topics
- Relevance score badges (colour-coded: high ≥85%, medium ≥65%, low <65%)
- Agent status panel: cycle count, wallet balance, next wakeup block
- Subscribe/unsubscribe with RITUAL token transactions
- Mobile-responsive with bottom sheet for agent status
- Smooth stagger animations, reduced-motion support, full WCAG AA accessibility

## Gotchas

- Always copy `.env.example` to `.env` and fill in `VITE_CONTRACT_ADDRESS` before testing live contract reads
- WalletConnect shows a 403 warning in dev if no valid project ID is set — this is non-blocking (injected/MetaMask still works)
- `wagmi@2` is pinned — do not upgrade to v3 without verifying connector compatibility

## User preferences

_Populate as you build._
