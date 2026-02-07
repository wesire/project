import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Construction Project Control</h1>
          <p className="text-blue-100 mt-2">Professional project management and control system</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-blue-600">📊 Dashboard</h2>
            <p className="text-gray-600">View project metrics, RAG status, SPI/CPI, and EAC</p>
          </Link>

          <Link href="/projects" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-blue-600">📋 Projects</h2>
            <p className="text-gray-600">Manage project register and details</p>
          </Link>

          <Link href="/risks" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-red-600">⚠️ Risk Register</h2>
            <p className="text-gray-600">P/I scoring and risk heatmap</p>
          </Link>

          <Link href="/changes" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-orange-600">🔄 Change Log</h2>
            <p className="text-gray-600">Track changes with cost/time impact</p>
          </Link>

          <Link href="/tasks" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-green-600">✅ Tasks & Sprints</h2>
            <p className="text-gray-600">Task management and Gantt charts</p>
          </Link>

          <Link href="/resources" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-purple-600">👥 Resources</h2>
            <p className="text-gray-600">Allocation and utilization tracking</p>
          </Link>

          <Link href="/cashflow" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-green-600">💰 Cashflow</h2>
            <p className="text-gray-600">Forecast vs actual financial tracking</p>
          </Link>

          <Link href="/issues" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-red-600">🔴 Issues</h2>
            <p className="text-gray-600">Issue tracking and resolution</p>
          </Link>

          <Link href="/rfis" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-blue-600">📨 RFIs</h2>
            <p className="text-gray-600">Request for Information management</p>
          </Link>

          <Link href="/procurement" className="card hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2 text-indigo-600">🛒 Procurement</h2>
            <p className="text-gray-600">Purchase orders and vendor management</p>
          </Link>

          <div className="card bg-blue-50 border-2 border-blue-300">
            <h2 className="text-xl font-bold mb-2 text-blue-700">📤 Export</h2>
            <p className="text-gray-700 mb-4">Generate executive reports</p>
            <div className="space-y-2">
              <button className="btn btn-primary w-full">📄 Export PDF</button>
              <button className="btn btn-success w-full">📊 Export XLSX</button>
              <button className="btn btn-secondary w-full">📽️ Export PPTX</button>
            </div>
          </div>

          <div className="card bg-gray-50 border-2 border-gray-300">
            <h2 className="text-xl font-bold mb-2 text-gray-700">🔒 Authentication</h2>
            <p className="text-gray-600 mb-4">Role-based access control (RBAC)</p>
            <button className="btn btn-primary w-full">Sign In</button>
          </div>
        </div>

        <div className="mt-12 card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">System Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>UK £ currency and date formatting</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>RAG (Red/Amber/Green) status indicators</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>SPI/CPI performance metrics</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>EAC (Estimate at Completion) calculations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Risk heatmap visualization</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Gantt chart timeline views</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Complete audit trail</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Automated alerts and notifications</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Construction Project Control System</p>
          <p className="text-gray-400 mt-2">Built with Next.js, TypeScript, Node.js, PostgreSQL, and Prisma</p>
        </div>
      </footer>
    </div>
  )
}
