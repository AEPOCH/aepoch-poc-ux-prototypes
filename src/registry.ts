// ============================================================
// PROTOTYPE REGISTRY
// Lee: when you add a new TSX file to src/prototypes/,
// add an entry here and it will appear on the index page.
// ============================================================
export interface PrototypeMeta {
  id: string           // used in the URL  e.g. /p/onboarding-flow
  title: string        // shown on the index card
  description: string  // one-liner for reviewers
  author?: string
  date?: string        // ISO string e.g. "2026-03-17"
  status?: 'wip' | 'ready-for-review' | 'approved'
}
export const prototypes: PrototypeMeta[] = [
  // --- ADD NEW PROTOTYPES BELOW THIS LINE ---
  {
    id: 'example',
    title: 'Example Prototype',
    description: 'A placeholder to confirm the pipeline is working.',
    author: 'Lee',
    date: '2026-03-17',
    status: 'wip',
  },
  {
    id: 'brand-system',
    title: 'Brand System v6.9',
    description: 'Full visual and voice design system — colour tokens, typography, components, motion, icons, and locked spec across all surfaces.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  {
    id: 'collection',
    title: 'Collection v1.4',
    description: 'Kairos collection screen — grid view, KairosStrip, envelope new state, comet whisper arc, fossil (burned) treatment.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  {
    id: 'wallet',
    title: 'Wallet v1.4',
    description: 'Wallet screen — pol_balance, free_balance, per-lot expiry, send flow, transaction history.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  {
    id: 'onboarding',
    title: 'Onboarding v1.4',
    description: 'Splash, login, and signup flows — unauthenticated surfaces, OTP, validated identity entry point.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  {
    id: 'daily-pol',
    title: 'Daily PoL v2.0',
    description: 'Daily proof-of-life activation flow — liveness check, Kairos minting, comet arc, confirmation ceremony.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  {
    id: 'did-binding',
    title: 'DID Binding',
    description: 'Initial account binding flow — camera + mic permissions, liveness steps, on-chain DID registration confirmation.',
    author: 'Lee',
    date: '2026-03-18',
    status: 'ready-for-review',
  },
  // --- END OF LIST ---
]
