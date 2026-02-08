'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  // Sample data - in real implementation, fetch from API
  const project = {
    id: id,
    projectNumber: 'PRJ001',
    name: 'City Centre Office Block',
    status: 'ACTIVE',
    budget: 5000000,
    actualCost: 4200000,
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    client: 'ABC Corporation',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement project update API call
    alert('Project update will be implemented with API integration')
    router.push(`/projects/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit Project</h1>
              <p className="text-blue-100 mt-1">{project.projectNumber} • {project.name}</p>
            </div>
            <Link href={`/projects/${id}`} className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Back to Details
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
              <input type="text" className="input" defaultValue={project.projectNumber} required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input type="text" className="input" defaultValue={project.name} required />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input type="text" className="input" defaultValue={project.client} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <input type="number" className="input" defaultValue={project.budget} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="input" defaultValue={project.status} required>
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
                <input type="date" className="input" defaultValue={project.startDate} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" className="input" defaultValue={project.endDate} required />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <Link href={`/projects/${id}`} className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
