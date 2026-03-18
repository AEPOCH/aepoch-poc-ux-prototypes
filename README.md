# UX Prototypes

A lightweight review environment for interactive TSX prototypes built in Claude.

## Setup (Micah — one time)

```bash
npm install
npm run dev        # http://localhost:5173
```

Connect to Vercel:
1. Push this repo to GitHub
2. Import the repo on vercel.com (free tier is fine)
3. Vercel auto-deploys every push and every PR branch

## Lee's workflow — adding a new prototype

1. Export the TSX file from Claude
2. Drop it into `src/prototypes/your-screen-name.tsx`
3. Make sure the file has a **default export** — e.g. `export default function MyScreen() { ... }`
4. Add an entry to `src/registry.ts`:

```ts
{
  id: 'your-screen-name',       // must match the filename (without .tsx)
  title: 'Your Screen Name',
  description: 'What this screen does in one line',
  author: 'Lee',
  date: '2026-03-17',
  status: 'ready-for-review',   // 'wip' | 'ready-for-review' | 'approved'
}
```

5. Push to a new branch → Vercel posts a preview URL in the PR
6. Share the URL with the team for comments

## Reviewing (everyone)

- The index page (`/`) lists all prototypes with their status
- Each prototype has a small toolbar at the top showing title, status, author, date
- Use **Vercel's built-in commenting** on preview deploys to leave feedback
- To approve, update `status` to `'approved'` in `registry.ts`

## Notes

- Prototypes are lazy-loaded — adding a new file won't affect others
- Tailwind is available in all prototypes
- If a prototype uses external libraries Lee should flag it — Micah may need to add them to `package.json`
