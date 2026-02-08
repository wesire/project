import Link from 'next/link'

export default function RFIsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📨 RFIs</h1>
              <p className="text-blue-100 mt-1">Request for Information management</p>
            </div>
            <Link href="/" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card bg-yellow-50 border-2 border-yellow-300">
          <h2 className="text-2xl font-bold mb-4 text-yellow-800">🚧 TODO</h2>
          <p className="text-gray-700 mb-4">
            This page is under construction. Request for Information (RFI) management features will be implemented here.
          </p>
          <p className="text-gray-600 mb-6">
            Planned features:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>RFI submission and tracking</li>
            <li>Response management</li>
            <li>Status tracking and notifications</li>
            <li>RFI register and reporting</li>
          </ul>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
