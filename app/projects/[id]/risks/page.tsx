'use client'

import Link from 'next/link'
import { use, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Risk {
  id: string
  riskNumber: string
  title: string
  description: string
  category: string
  probability: number
  impact: number
  score: number
  status: string
  owner: string
  mitigation: string
  contingency: string
  mitigationDueDate: string
  createdAt: string
}

export default function ProjectRisksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // Sample data - in real implementation, fetch from API filtered by project id
  const [risks, setRisks] = useState<Risk[]>([
    { 
      id: '1', 
      riskNumber: 'R001', 
      title: 'Foundation Delays', 
      description: 'Potential delays in foundation work due to soil conditions and weather',
      category: 'Schedule', 
      probability: 4, 
      impact: 5, 
      score: 20, 
      status: 'OPEN', 
      owner: 'John Smith',
      mitigation: 'Conduct soil testing, schedule extra crew, have backup equipment ready',
      contingency: 'Fast-track other activities, add night shifts if necessary',
      mitigationDueDate: '2024-01-15',
      createdAt: '2024-01-01'
    },
    { 
      id: '2', 
      riskNumber: 'R002', 
      title: 'Material Cost Increase', 
      description: 'Rising prices for steel and concrete materials',
      category: 'Cost', 
      probability: 3, 
      impact: 4, 
      score: 12, 
      status: 'OPEN', 
      owner: 'Sarah Johnson',
      mitigation: 'Lock in prices with suppliers, explore alternative materials',
      contingency: 'Access contingency budget, negotiate payment terms',
      mitigationDueDate: '2024-02-01',
      createdAt: '2024-01-02'
    },
    { 
      id: '3', 
      riskNumber: 'R003', 
      title: 'Weather Delays', 
      description: 'Adverse weather conditions affecting outdoor construction',
      category: 'Schedule', 
      probability: 3, 
      impact: 3, 
      score: 9, 
      status: 'MITIGATED', 
      owner: 'Mike Brown',
      mitigation: 'Weather protection systems installed, flexible scheduling implemented',
      contingency: 'Indoor work prioritization during bad weather',
      mitigationDueDate: '2023-12-20',
      createdAt: '2023-12-15'
    },
  ])

  const [activeTab, setActiveTab] = useState('register')

  const risksByCategory = useMemo(() => {
    const grouped: { [key: string]: Risk[] } = {}
    risks.forEach(risk => {
      if (!grouped[risk.category]) {
        grouped[risk.category] = []
      }
      grouped[risk.category].push(risk)
    })
    return grouped
  }, [risks])

  const riskTrendData = useMemo(() => {
    return [
      { month: 'Jan', open: 12, closed: 3, total: 15 },
      { month: 'Feb', open: 14, closed: 5, total: 19 },
      { month: 'Mar', open: 11, closed: 8, total: 19 },
      { month: 'Apr', open: 9, closed: 10, total: 19 },
    ]
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'MITIGATED': return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (score: number) => {
    if (score >= 15) return 'bg-red-500'
    if (score >= 10) return 'bg-orange-500'
    if (score >= 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getRiskLevelText = (score: number) => {
    if (score >= 15) return 'Critical'
    if (score >= 10) return 'High'
    if (score >= 5) return 'Medium'
    return 'Low'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Project Risk Register</h1>
              <p className="text-red-100 mt-1">Project ID: {id}</p>
            </div>
            <Link href={`/projects/${id}`} className="btn bg-red-700 hover:bg-red-800 text-white">
              ← Back to Project
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'register'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Risk Register
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'analytics'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'register' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card bg-red-50">
                <p className="text-sm text-gray-600">Total Risks</p>
                <p className="text-3xl font-bold text-red-600">{risks.length}</p>
              </div>
              <div className="card bg-orange-50">
                <p className="text-sm text-gray-600">Open Risks</p>
                <p className="text-3xl font-bold text-orange-600">
                  {risks.filter(r => r.status === 'OPEN').length}
                </p>
              </div>
              <div className="card bg-yellow-50">
                <p className="text-sm text-gray-600">Mitigated</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {risks.filter(r => r.status === 'MITIGATED').length}
                </p>
              </div>
              <div className="card bg-green-50">
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-3xl font-bold text-green-600">
                  {risks.filter(r => r.status === 'CLOSED').length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {risks.map(risk => (
                <div key={risk.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{risk.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getRiskLevelColor(risk.score)}`}>
                          {getRiskLevelText(risk.score)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {risk.riskNumber} • {risk.category} • Owner: {risk.owner}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold">{risk.score}</p>
                      <p className="text-xs text-gray-500">P:{risk.probability} × I:{risk.impact}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Description:</p>
                      <p className="text-gray-600">{risk.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Mitigation:</p>
                      <p className="text-gray-600">{risk.mitigation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Contingency:</p>
                      <p className="text-gray-600">{risk.contingency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Risk Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="open" stroke="#EF4444" name="Open Risks" />
                  <Line type="monotone" dataKey="closed" stroke="#10B981" name="Closed Risks" />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total Risks" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Risks by Category</h3>
              <div className="space-y-4">
                {Object.entries(risksByCategory).map(([category, categoryRisks]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{category}</span>
                      <span className="text-gray-600">{categoryRisks.length} risks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(categoryRisks.length / risks.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
