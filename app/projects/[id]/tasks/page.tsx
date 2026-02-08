'use client'

import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface Task {
  id: string
  taskNumber: string
  title: string
  description?: string
  status: string
  priority: string
  progress?: number
  startDate?: string
  endDate?: string
  assignedTo?: {
    id: string
    name: string
  }
}

interface Sprint {
  id: string
  name: string
  goal?: string
  startDate: string
  endDate: string
  status: string
}

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both tasks and sprints in parallel
        const [tasksResponse, sprintsResponse] = await Promise.all([
          fetch(`/api/tasks?projectId=${id}`),
          fetch(`/api/sprints?projectId=${id}`)
        ])

        if (!tasksResponse.ok || !sprintsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const tasksData = await tasksResponse.json()
        const sprintsData = await sprintsResponse.json()

        // Handle both paginated and non-paginated responses
        setTasks(Array.isArray(tasksData) ? tasksData : (tasksData.data || []))
        setSprints(Array.isArray(sprintsData) ? sprintsData : (sprintsData.data || []))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load tasks and sprints')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
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
          {sprints.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">No sprints found for this project.</p>
            </div>
          ) : (
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
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">All Tasks</h2>
          {tasks.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">No tasks found for this project.</p>
            </div>
          ) : (
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
                        {task.taskNumber}{task.assignedTo && ` • Assigned to: ${task.assignedTo.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold">{task.progress || 0}%</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {task.startDate && task.endDate && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Start: {new Date(task.startDate).toLocaleDateString('en-GB')}</span>
                      <span>End: {new Date(task.endDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
