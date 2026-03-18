import { Routes, Route, useParams, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { prototypes } from './registry'

// Dynamically import whichever prototype is requested
function PrototypeLoader() {
  const { id } = useParams<{ id: string }>()
  const meta = prototypes.find(p => p.id === id)

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <p className="text-2xl font-semibold mb-2">Prototype not found</p>
          <p className="text-gray-500 mb-6">No prototype registered with id: <code>{id}</code></p>
          <Link to="/" className="text-blue-600 underline">← Back to index</Link>
        </div>
      </div>
    )
  }

  // Lazy-load the TSX file matching the id
  const Component = lazy(() =>
    import(`./prototypes/${id}.tsx`).catch(() => ({
      default: () => (
        <div className="p-8 text-center">
          <p className="text-xl font-semibold mb-2">File not found</p>
          <p className="text-gray-500">
            Expected: <code>src/prototypes/{id}.tsx</code>
          </p>
        </div>
      ),
    }))
  )

  const statusColors: Record<string, string> = {
    'wip': 'bg-yellow-100 text-yellow-800',
    'ready-for-review': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
  }

  return (
    <div>
      {/* Reviewer toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-800">← All prototypes</Link>
          <span className="text-gray-300">|</span>
          <span className="font-medium">{meta.title}</span>
          {meta.status && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[meta.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {meta.status}
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {meta.author && <span className="mr-3">by {meta.author}</span>}
          {meta.date && <span>{meta.date}</span>}
        </div>
      </div>

      {/* Prototype itself */}
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading prototype…</div>}>
        <Component />
      </Suspense>
    </div>
  )
}

// Index page listing all registered prototypes
function Index() {
  const statusColors: Record<string, string> = {
    'wip': 'bg-yellow-100 text-yellow-800',
    'ready-for-review': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">UX Prototypes</h1>
        <p className="text-gray-500 mb-8">Click a prototype to view and review.</p>

        {prototypes.length === 0 && (
          <p className="text-gray-400">No prototypes registered yet. Add entries to <code>src/registry.ts</code>.</p>
        )}

        <div className="grid gap-4">
          {prototypes.map(p => (
            <Link
              key={p.id}
              to={`/p/${p.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{p.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-gray-400">
                  {p.status && (
                    <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </span>
                  )}
                  {p.date && <span>{p.date}</span>}
                  {p.author && <span>by {p.author}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/p/:id" element={<PrototypeLoader />} />
    </Routes>
  )
}
