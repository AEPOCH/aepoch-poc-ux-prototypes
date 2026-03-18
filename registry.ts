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

  // --- END OF LIST ---
]
