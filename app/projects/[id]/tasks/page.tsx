'use client'

import Link from 'next/link'
import { use } from 'react'

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // Sample data - in real implementation, fetch from API filtered by project id
  const sprints = [
    {
      id: '1',
      name: 'Sprint 1 - Foundation Work',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'COMPLETED',
    },
    {
      id: '2',
      name: 'Sprint 2 - Ground Floor',
      startDate: '2024-02-16',
      endDate: '2024-03-31',
      status: 'ACTIVE',
    },
  ]

  const tasks = [
    {
      id: '1',
      taskNumber: 'T001',
      title: 'Site Preparation',
      status: 'DONE',
      priority: 'HIGH',
      progress: 100,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      assignedTo: 'John Smith',
    },
    {
      id: '2',
      taskNumber: 'T002',
      title: 'Foundation Excavation',
      status: 'DONE',
      priority: 'CRITICAL',
      progress: 100,
      startDate: '2024-01-23',
      endDate: '2024-02-05',
      assignedTo: 'Mike Johnson',
    },
    {
      id: '3',
      taskNumber: 'T003',
      title: 'Ground Floor Framing',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 65,
      startDate: '2024-02-16',
      endDate: '2024-03-15',
      assignedTo: 'Sarah Williams',
    },
    {
      id: '4',
      taskNumber: 'T004',
      title: 'Electrical Rough-in',
      status: 'TODO',
      priority: 'MEDIUM',
      progress: 0,
      startDate: '2024-03-16',
      endDate: '2024-03-31',
      assignedTo: 'David Brown',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'BLOCKED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600'
      case 'HIGH': return 'text-orange-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Project Tasks & Sprints</h1>
              <p className="text-green-100 mt-1">Project ID: {id}</p>
            </div>
            <Link href={`/projects/${id}`} className="btn bg-green-700 hover:bg-green-800 text-white">
              ← Back to Project
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'DONE').length}
            </p>
          </div>
          <div className="card bg-yellow-50">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="card bg-gray-50">
            <p className="text-sm text-gray-600">Todo</p>
            <p className="text-3xl font-bold text-gray-600">
              {tasks.filter(t => t.status === 'TODO').length}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sprints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sprints.map(sprint => (
              <div key={sprint.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{sprint.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    sprint.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(sprint.startDate).toLocaleDateString('en-GB')} - {new Date(sprint.endDate).toLocaleDateString('en-GB')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">All Tasks</h2>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {task.taskNumber} • Assigned to: {task.assignedTo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold">{task.progress}%</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Start: {new Date(task.startDate).toLocaleDateString('en-GB')}</span>
                  <span>End: {new Date(task.endDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
