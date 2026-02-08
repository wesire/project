'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement project creation API call
    alert('Project creation will be implemented with API integration')
    router.push('/projects')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">New Project</h1>
              <p className="text-blue-100 mt-1">Create a new construction project</p>
            </div>
            <Link href="/projects" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Back to Projects
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Project Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Number</label>
              <input type="text" className="input" placeholder="e.g., PRJ001" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input type="text" className="input" placeholder="e.g., City Centre Office Block" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input type="text" className="input" placeholder="Client name" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <input type="number" className="input" placeholder="0" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="input" required>
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" className="input" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" className="input" required />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary">Create Project</button>
              <Link href="/projects" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
