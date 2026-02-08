'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'

interface Task {
  id: string
  taskNumber: string
  title: string
  status: string
  priority: string
  progress: number
  startDate?: string
  endDate?: string
  baselineStartDate?: string
  baselineEndDate?: string
  isCriticalPath?: boolean
  dependencies: string[]
  assignedTo?: {
    name: string
  }
}

interface Milestone {
  id: string
  name: string
  dueDate: string
  baselineDueDate?: string
  status: string
  progress: number
}

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([])

  // Mock data for demonstration
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        taskNumber: 'T001',
        title: 'Site Preparation',
        status: 'DONE',
        priority: 'HIGH',
        progress: 100,
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        baselineStartDate: '2024-01-15',
        baselineEndDate: '2024-01-20',
        isCriticalPath: true,
        dependencies: [],
        assignedTo: { name: 'John Smith' },
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
        baselineStartDate: '2024-01-21',
        baselineEndDate: '2024-02-05',
        isCriticalPath: true,
        dependencies: ['1'],
        assignedTo: { name: 'Mike Johnson' },
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
        baselineStartDate: '2024-02-16',
        baselineEndDate: '2024-03-10',
        isCriticalPath: true,
        dependencies: ['2'],
        assignedTo: { name: 'Sarah Williams' },
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
        baselineStartDate: '2024-03-16',
        baselineEndDate: '2024-03-31',
        isCriticalPath: false,
        dependencies: ['3'],
        assignedTo: { name: 'David Brown' },
      },
    ]

    const mockMilestones: Milestone[] = [
      {
        id: 'm1',
        name: 'Foundation Complete',
        dueDate: '2024-02-05',
        baselineDueDate: '2024-02-05',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        id: 'm2',
        name: 'Frame Inspection',
        dueDate: '2024-03-15',
        baselineDueDate: '2024-03-10',
        status: 'IN_PROGRESS',
        progress: 65,
      },
    ]

    setTasks(mockTasks)
    setMilestones(mockMilestones)

    // Convert to Gantt format
    const ganttData: GanttTask[] = []

    // Add tasks
    mockTasks.forEach(task => {
      if (task.startDate && task.endDate) {
        ganttData.push({
          id: task.id,
          name: task.title,
          start: new Date(task.startDate),
          end: new Date(task.endDate),
          progress: task.progress,
          type: 'task',
          dependencies: task.dependencies,
          styles: {
            backgroundColor: task.isCriticalPath ? '#ef4444' : '#3b82f6',
            backgroundSelectedColor: task.isCriticalPath ? '#dc2626' : '#2563eb',
            progressColor: task.isCriticalPath ? '#991b1b' : '#1e40af',
            progressSelectedColor: task.isCriticalPath ? '#7f1d1d' : '#1e3a8a',
          },
        })
      }
    })

    // Add milestones
    mockMilestones.forEach(milestone => {
      ganttData.push({
        id: milestone.id,
        name: milestone.name,
        start: new Date(milestone.dueDate),
        end: new Date(milestone.dueDate),
        progress: milestone.progress,
        type: 'milestone',
        styles: {
          backgroundColor: '#10b981',
          backgroundSelectedColor: '#059669',
        },
      })
    })

    setGanttTasks(ganttData)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'BLOCKED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Schedule Management</h1>
              <p className="text-indigo-100 mt-1">Interactive Gantt chart with critical path analysis</p>
            </div>
            <Link href="/" className="btn bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Legend */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Legend</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Critical Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Regular Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 border-2 border-orange-400 rounded bg-orange-50"></div>
              <span className="text-sm">Baseline Variance</span>
            </div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <span className="font-semibold">View Mode:</span>
            <button
              onClick={() => setViewMode(ViewMode.Day)}
              className={`px-4 py-2 rounded ${viewMode === ViewMode.Day ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Week)}
              className={`px-4 py-2 rounded ${viewMode === ViewMode.Week ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode(ViewMode.Month)}
              className={`px-4 py-2 rounded ${viewMode === ViewMode.Month ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Project Timeline</h2>
          <div className="overflow-x-auto">
            {ganttTasks.length > 0 ? (
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                listCellWidth="200px"
                columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 60}
              />
            ) : (
              <p className="text-gray-500">No tasks to display</p>
            )}
          </div>
        </div>

        {/* Task List with Baseline Comparison */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Task Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Task</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Progress</th>
                  <th className="p-3 text-left">Current Dates</th>
                  <th className="p-3 text-left">Baseline Dates</th>
                  <th className="p-3 text-left">Variance</th>
                  <th className="p-3 text-left">Critical</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const variance = task.endDate && task.baselineEndDate 
                    ? Math.ceil((new Date(task.endDate).getTime() - new Date(task.baselineEndDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  
                  return (
                    <tr key={task.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.taskNumber}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${
                          task.priority === 'CRITICAL' ? 'text-red-600' :
                          task.priority === 'HIGH' ? 'text-orange-600' :
                          task.priority === 'MEDIUM' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>{task.startDate ? new Date(task.startDate).toLocaleDateString('en-GB') : '-'}</div>
                        <div>{task.endDate ? new Date(task.endDate).toLocaleDateString('en-GB') : '-'}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        <div>{task.baselineStartDate ? new Date(task.baselineStartDate).toLocaleDateString('en-GB') : '-'}</div>
                        <div>{task.baselineEndDate ? new Date(task.baselineEndDate).toLocaleDateString('en-GB') : '-'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm font-semibold ${
                          variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {variance > 0 ? `+${variance}d` : variance < 0 ? `${variance}d` : 'On track'}
                        </span>
                      </td>
                      <td className="p-3">
                        {task.isCriticalPath && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                            Critical
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Milestones */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map(milestone => {
              const variance = milestone.baselineDueDate
                ? Math.ceil((new Date(milestone.dueDate).getTime() - new Date(milestone.baselineDueDate).getTime()) / (1000 * 60 * 60 * 24))
                : 0

              return (
                <div key={milestone.id} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{milestone.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      milestone.status === 'DELAYED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(milestone.dueDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    {milestone.baselineDueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Baseline:</span>
                        <span className="text-gray-600">{new Date(milestone.baselineDueDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                    {variance !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Variance:</span>
                        <span className={`font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {variance > 0 ? `+${variance}d` : `${variance}d`}
                        </span>
                      </div>
                    )}
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{milestone.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
