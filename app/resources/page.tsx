import Link from 'next/link'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">👥 Resources</h1>
              <p className="text-purple-100 mt-1">Allocation and utilization tracking</p>
            </div>
            <Link href="/" className="btn bg-purple-700 hover:bg-purple-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card bg-yellow-50 border-2 border-yellow-300">
          <h2 className="text-2xl font-bold mb-4 text-yellow-800">🚧 TODO</h2>
          <p className="text-gray-700 mb-4">
            This page is under construction. Resource allocation and utilization tracking features will be implemented here.
          </p>
          <p className="text-gray-600 mb-6">
            Planned features:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Resource allocation overview</li>
            <li>Utilization tracking and reporting</li>
            <li>Capacity planning</li>
            <li>Resource scheduling</li>
          </ul>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
