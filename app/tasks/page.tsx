'use client'

import Link from 'next/link'

export default function TasksPage() {
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
              <h1 className="text-3xl font-bold">Tasks & Sprints</h1>
              <p className="text-green-100 mt-1">Task management with Gantt timeline</p>
            </div>
            <Link href="/" className="btn bg-green-700 hover:bg-green-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Sprints */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Sprints</h2>
            <button className="btn btn-primary">+ New Sprint</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sprints.map(sprint => (
              <div key={sprint.id} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{sprint.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${sprint.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {sprint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(sprint.startDate).toLocaleDateString('en-GB')} - {new Date(sprint.endDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <button className="btn btn-primary">+ New Task</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Task ID</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Progress</th>
                  <th className="p-3 text-left">Assigned To</th>
                  <th className="p-3 text-left">Timeline</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{task.taskNumber}</td>
                    <td className="p-3">{task.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">{task.assignedTo}</td>
                    <td className="p-3 text-sm">
                      <div>{new Date(task.startDate).toLocaleDateString('en-GB')}</div>
                      <div>{new Date(task.endDate).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gantt Chart (Simplified) */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Gantt Timeline</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="flex mb-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <div className="w-48">Task</div>
                <div className="flex-1 grid grid-cols-8">
                  <div>Week 1</div>
                  <div>Week 2</div>
                  <div>Week 3</div>
                  <div>Week 4</div>
                  <div>Week 5</div>
                  <div>Week 6</div>
                  <div>Week 7</div>
                  <div>Week 8</div>
                </div>
              </div>

              {/* Task Bars */}
              {tasks.map(task => (
                <div key={task.id} className="flex items-center mb-3">
                  <div className="w-48 pr-4 text-sm font-medium truncate">{task.title}</div>
                  <div className="flex-1 grid grid-cols-8 gap-1">
                    {/* Simplified bar representation */}
                    <div className={`col-span-2 h-8 rounded ${task.status === 'DONE' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center text-white text-xs`}>
                      {task.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
