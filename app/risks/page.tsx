'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Risk {
  id: string
  riskNumber: string
  title: string
  probability: number
  impact: number
  score: number
  status: string
  category: string
}

export default function RiskRegister() {
  const [risks] = useState<Risk[]>([
    { id: '1', riskNumber: 'R001', title: 'Foundation Delays', probability: 4, impact: 5, score: 20, status: 'OPEN', category: 'Schedule' },
    { id: '2', riskNumber: 'R002', title: 'Material Cost Increase', probability: 3, impact: 4, score: 12, status: 'OPEN', category: 'Cost' },
    { id: '3', riskNumber: 'R003', title: 'Weather Delays', probability: 3, impact: 3, score: 9, status: 'MITIGATED', category: 'Schedule' },
    { id: '4', riskNumber: 'R004', title: 'Labour Shortage', probability: 2, impact: 4, score: 8, status: 'OPEN', category: 'Resource' },
    { id: '5', riskNumber: 'R005', title: 'Equipment Failure', probability: 2, impact: 3, score: 6, status: 'MITIGATED', category: 'Technical' },
  ])

  const getRiskLevel = (score: number) => {
    if (score >= 20) return { label: 'CRITICAL', color: 'bg-red-600 text-white' }
    if (score >= 15) return { label: 'HIGH', color: 'bg-red-500 text-white' }
    if (score >= 10) return { label: 'MEDIUM', color: 'bg-orange-500 text-white' }
    return { label: 'LOW', color: 'bg-yellow-500 text-white' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'MITIGATED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Create heatmap data
  const heatmapData: Array<{
    probability: number
    impact: number
    score: number
    count: number
    risks: Risk[]
    bgColor: string
  }> = []
  for (let impact = 5; impact >= 1; impact--) {
    for (let probability = 1; probability <= 5; probability++) {
      const risksInCell = risks.filter(
        r => r.probability === probability && r.impact === impact
      )
      const score = probability * impact
      let bgColor = 'bg-green-200'
      if (score >= 20) bgColor = 'bg-red-600'
      else if (score >= 15) bgColor = 'bg-red-500'
      else if (score >= 10) bgColor = 'bg-orange-500'
      else if (score >= 6) bgColor = 'bg-yellow-400'
      else if (score >= 3) bgColor = 'bg-yellow-300'

      heatmapData.push({
        probability,
        impact,
        score,
        count: risksInCell.length,
        risks: risksInCell,
        bgColor,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Risk Register</h1>
              <p className="text-red-100 mt-1">Probability/Impact scoring and risk heatmap</p>
            </div>
            <Link href="/" className="btn bg-red-700 hover:bg-red-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Risk Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Total Risks</h3>
            <p className="text-3xl font-bold text-gray-800">{risks.length}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Critical Risks</h3>
            <p className="text-3xl font-bold text-red-600">
              {risks.filter(r => r.score >= 20).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Open Risks</h3>
            <p className="text-3xl font-bold text-orange-600">
              {risks.filter(r => r.status === 'OPEN').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Mitigated Risks</h3>
            <p className="text-3xl font-bold text-green-600">
              {risks.filter(r => r.status === 'MITIGATED').length}
            </p>
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Risk Heatmap (P × I)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-100 text-left">Impact →<br/>Probability ↓</th>
                  <th className="p-2 border bg-gray-100 text-center">1<br/>Negligible</th>
                  <th className="p-2 border bg-gray-100 text-center">2<br/>Minor</th>
                  <th className="p-2 border bg-gray-100 text-center">3<br/>Moderate</th>
                  <th className="p-2 border bg-gray-100 text-center">4<br/>Major</th>
                  <th className="p-2 border bg-gray-100 text-center">5<br/>Severe</th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map(impact => (
                  <tr key={impact}>
                    <td className="p-2 border bg-gray-100 font-semibold">
                      {impact}<br/>
                      <span className="text-xs font-normal">
                        {impact === 5 ? 'Certain' : impact === 4 ? 'Likely' : impact === 3 ? 'Possible' : impact === 2 ? 'Unlikely' : 'Rare'}
                      </span>
                    </td>
                    {[1, 2, 3, 4, 5].map(probability => {
                      const cell = heatmapData.find(
                        d => d.probability === probability && d.impact === impact
                      )
                      return (
                        <td
                          key={`${probability}-${impact}`}
                          className={`p-4 border ${cell?.bgColor} text-center cursor-pointer hover:opacity-80 transition-opacity`}
                          title={cell?.risks.map(r => r.title).join(', ')}
                        >
                          <div className="font-bold text-lg">{cell?.score}</div>
                          {cell && cell.count > 0 && (
                            <div className="text-sm mt-1">
                              {cell.count} risk{cell.count > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-200 border"></div>
              <span>Low (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-300 border"></div>
              <span>Medium (6-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 border"></div>
              <span>High (10-14)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 border"></div>
              <span>Critical (15+)</span>
            </div>
          </div>
        </div>

        {/* Risk List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Risk Register</h2>
            <button className="btn btn-primary">+ Add Risk</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Risk ID</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-center">P</th>
                  <th className="p-3 text-center">I</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-left">Level</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {risks.map(risk => {
                  const level = getRiskLevel(risk.score)
                  return (
                    <tr key={risk.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{risk.riskNumber}</td>
                      <td className="p-3">{risk.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {risk.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">{risk.probability}</td>
                      <td className="p-3 text-center font-semibold">{risk.impact}</td>
                      <td className="p-3 text-center font-bold">{risk.score}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${level.color}`}>
                          {level.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                        <button className="text-gray-600 hover:text-gray-800">Edit</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
