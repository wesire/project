'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Task {
  id: string
  taskNumber: string
  title: string
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
  priority: string
  estimatedHours?: number
  assignedTo?: {
    name: string
  }
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
}

export default function SprintsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [burndownData, setBurndownData] = useState<Array<{ day: string; ideal: number; actual: number }>>([])
  const [velocityData, setVelocityData] = useState<Array<{ sprint: string; planned: number; completed: number }>>([])

  // Mock data for demonstration
  useEffect(() => {
    const mockSprint: Sprint = {
      id: '1',
      name: 'Sprint 2 - Ground Floor Construction',
      startDate: '2024-02-16',
      endDate: '2024-03-31',
      status: 'ACTIVE',
    }

    const mockTasks: Task[] = [
      {
        id: '1',
        taskNumber: 'T001',
        title: 'Review architectural drawings',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        estimatedHours: 8,
        assignedTo: { name: 'John Smith' },
      },
      {
        id: '2',
        taskNumber: 'T002',
        title: 'Prepare material list',
        status: 'BACKLOG',
        priority: 'HIGH',
        estimatedHours: 12,
      },
      {
        id: '3',
        taskNumber: 'T003',
        title: 'Ground Floor Framing',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        estimatedHours: 80,
        assignedTo: { name: 'Sarah Williams' },
      },
      {
        id: '4',
        taskNumber: 'T004',
        title: 'Install floor joists',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 40,
        assignedTo: { name: 'Mike Johnson' },
      },
      {
        id: '5',
        taskNumber: 'T005',
        title: 'Plumbing rough-in',
        status: 'BLOCKED',
        priority: 'HIGH',
        estimatedHours: 32,
        assignedTo: { name: 'David Brown' },
      },
      {
        id: '6',
        taskNumber: 'T006',
        title: 'Site Preparation',
        status: 'DONE',
        priority: 'HIGH',
        estimatedHours: 24,
        assignedTo: { name: 'John Smith' },
      },
      {
        id: '7',
        taskNumber: 'T007',
        title: 'Foundation Pour',
        status: 'DONE',
        priority: 'CRITICAL',
        estimatedHours: 56,
        assignedTo: { name: 'Mike Johnson' },
      },
    ]

    // Mock burndown data
    const mockBurndown = [
      { day: 'Day 1', ideal: 200, actual: 200 },
      { day: 'Day 5', ideal: 160, actual: 180 },
      { day: 'Day 10', ideal: 120, actual: 145 },
      { day: 'Day 15', ideal: 80, actual: 120 },
      { day: 'Day 20', ideal: 40, actual: 92 },
      { day: 'Day 25', ideal: 0, actual: 72 },
    ]

    // Mock velocity data
    const mockVelocity = [
      { sprint: 'Sprint 1', planned: 120, completed: 95 },
      { sprint: 'Sprint 2', planned: 150, completed: 140 },
      { sprint: 'Sprint 3', planned: 180, completed: 165 },
      { sprint: 'Sprint 4', planned: 200, completed: 185 },
    ]

    setSelectedSprint(mockSprint)
    setTasks(mockTasks)
    setBurndownData(mockBurndown)
    setVelocityData(mockVelocity)
  }, [])

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-4 border-red-500'
      case 'HIGH': return 'border-l-4 border-orange-500'
      case 'MEDIUM': return 'border-l-4 border-yellow-500'
      case 'LOW': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-500'
    }
  }

  const columns: { title: string; status: Task['status']; bgColor: string }[] = [
    { title: 'Backlog', status: 'BACKLOG', bgColor: 'bg-gray-100' },
    { title: 'To Do', status: 'TODO', bgColor: 'bg-blue-50' },
    { title: 'In Progress', status: 'IN_PROGRESS', bgColor: 'bg-yellow-50' },
    { title: 'Blocked', status: 'BLOCKED', bgColor: 'bg-red-50' },
    { title: 'Done', status: 'DONE', bgColor: 'bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Sprint Board</h1>
              <p className="text-purple-100 mt-1">Agile task management with burndown & velocity tracking</p>
            </div>
            <Link href="/" className="btn bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Sprint Info */}
        {selectedSprint && (
          <div className="card mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{selectedSprint.name}</h2>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedSprint.startDate).toLocaleDateString('en-GB')} - {new Date(selectedSprint.endDate).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{getTasksByStatus('DONE').length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{getTasksByStatus('IN_PROGRESS').length}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{getTasksByStatus('BLOCKED').length}</div>
                  <div className="text-sm text-gray-600">Blocked</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {columns.map(column => {
              const columnTasks = getTasksByStatus(column.status)
              const totalHours = columnTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
              
              return (
                <div key={column.status} className="flex flex-col">
                  <div className={`${column.bgColor} p-4 rounded-t-lg border-b-2 border-gray-300`}>
                    <h3 className="font-bold text-lg mb-1">{column.title}</h3>
                    <div className="text-sm text-gray-600">
                      {columnTasks.length} tasks • {totalHours}h
                    </div>
                  </div>
                  <div className={`${column.bgColor} p-4 space-y-3 min-h-[500px] rounded-b-lg`}>
                    {columnTasks.map(task => (
                      <div
                        key={task.id}
                        className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move ${getPriorityColor(task.priority)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono text-gray-500">{task.taskNumber}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-2">{task.title}</h4>
                        {task.estimatedHours && (
                          <div className="text-xs text-gray-600 mb-2">
                            ⏱️ {task.estimatedHours}h
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-semibold">
                              {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Burndown Chart */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Sprint Burndown</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Track remaining work hours over the sprint duration
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Ideal Burndown"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Actual Burndown"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ Current sprint is behind schedule. Consider re-prioritizing tasks or extending the sprint.
              </p>
            </div>
          </div>

          {/* Velocity Chart */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Team Velocity</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Compare planned vs completed hours across sprints
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#93c5fd" name="Planned Hours" />
                <Bar dataKey="completed" fill="#8b5cf6" name="Completed Hours" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">172</div>
                <div className="text-xs text-gray-600">Avg. Velocity</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-xs text-gray-600">Completion Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">+15h</div>
                <div className="text-xs text-gray-600">Trend</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint Metrics */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Sprint Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Hours</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {getTasksByStatus('DONE').reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed Hours</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {getTasksByStatus('IN_PROGRESS').reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">In Progress Hours</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {getTasksByStatus('BACKLOG').reduce((sum, task) => sum + (task.estimatedHours || 0), 0) +
                 getTasksByStatus('TODO').reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Remaining Hours</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
