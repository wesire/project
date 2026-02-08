'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast, { Toaster } from 'react-hot-toast'
import { apiFetch } from '@/lib/api-client'

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

export default function RiskRegister() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }
    
    setIsAuthenticated(true)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    router.push('/login?returnUrl=/risks')
  }

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
    { 
      id: '4', 
      riskNumber: 'R004', 
      title: 'Labour Shortage', 
      description: 'Difficulty in recruiting skilled workers',
      category: 'Resource', 
      probability: 2, 
      impact: 4, 
      score: 8, 
      status: 'OPEN', 
      owner: 'John Smith',
      mitigation: 'Early recruitment, competitive wages, training programs',
      contingency: 'Subcontractor agreements, overtime authorization',
      mitigationDueDate: '2024-01-25',
      createdAt: '2024-01-05'
    },
    { 
      id: '5', 
      riskNumber: 'R005', 
      title: 'Equipment Failure', 
      description: 'Critical equipment breakdown causing delays',
      category: 'Technical', 
      probability: 2, 
      impact: 3, 
      score: 6, 
      status: 'MITIGATED', 
      owner: 'Sarah Johnson',
      mitigation: 'Regular maintenance schedule, backup equipment arrangements',
      contingency: 'Rental agreements in place, repair service contracts',
      mitigationDueDate: '2023-12-30',
      createdAt: '2023-12-10'
    },
    { 
      id: '6', 
      riskNumber: 'R006', 
      title: 'Permit Delays', 
      description: 'Delays in obtaining necessary permits and approvals',
      category: 'Regulatory', 
      probability: 3, 
      impact: 4, 
      score: 12, 
      status: 'OPEN', 
      owner: 'Mike Brown',
      mitigation: 'Early submission, follow-up meetings with authorities',
      contingency: 'Expedited processing, legal support if needed',
      mitigationDueDate: '2024-01-10',
      createdAt: '2024-01-03'
    },
    { 
      id: '7', 
      riskNumber: 'R007', 
      title: 'Design Changes', 
      description: 'Late design changes impacting construction progress',
      category: 'Technical', 
      probability: 2, 
      impact: 3, 
      score: 6, 
      status: 'ACCEPTED', 
      owner: 'John Smith',
      mitigation: 'Design freeze agreement, change control process',
      contingency: 'Extra budget allocation for changes',
      mitigationDueDate: '2024-02-15',
      createdAt: '2024-01-08'
    },
  ])

  // State for filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterOwner, setFilterOwner] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  
  // State for export loading
  const [isExporting, setIsExporting] = useState(false)
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  
  // State for new risk form
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    title: '',
    description: '',
    category: 'Schedule',
    probability: 3,
    impact: 3,
    status: 'OPEN',
    owner: '',
    mitigation: '',
    contingency: '',
    mitigationDueDate: '',
  })

  // Get unique values for filters
  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(risks.map(r => r.owner))).sort()
  }, [risks])

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(risks.map(r => r.category))).sort()
  }, [risks])

  // Filter risks
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      if (filterStatus !== 'ALL' && risk.status !== filterStatus) return false
      if (filterOwner !== 'ALL' && risk.owner !== filterOwner) return false
      if (filterCategory !== 'ALL' && risk.category !== filterCategory) return false
      return true
    })
  }, [risks, filterStatus, filterOwner, filterCategory])

  // Check if risk is overdue
  const isOverdue = (risk: Risk) => {
    if (risk.status === 'MITIGATED' || risk.status === 'CLOSED') return false
    const dueDate = new Date(risk.mitigationDueDate)
    return dueDate < new Date()
  }

  // Count overdue risks
  const overdueCount = useMemo(() => {
    return risks.filter(isOverdue).length
  }, [risks])

  // Trend data (mock data showing risk trends over time)
  const trendData = useMemo(() => {
    return [
      { month: 'Oct', critical: 1, high: 2, medium: 3, low: 1 },
      { month: 'Nov', critical: 2, high: 1, medium: 2, low: 2 },
      { month: 'Dec', critical: 1, high: 2, medium: 2, low: 2 },
      { month: 'Jan', critical: 2, high: 1, medium: 2, low: 2 },
    ]
  }, [])

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

  // Handle add risk
  const handleAddRisk = () => {
    const maxRiskNum = risks.reduce((max, r) => {
      const num = parseInt(r.riskNumber.substring(1), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 0)
    const riskNumber = `R${String(maxRiskNum + 1).padStart(3, '0')}`
    const score = (newRisk.probability || 1) * (newRisk.impact || 1)
    
    const risk: Risk = {
      id: String(risks.length + 1),
      riskNumber,
      title: newRisk.title || '',
      description: newRisk.description || '',
      category: newRisk.category || 'Schedule',
      probability: newRisk.probability || 3,
      impact: newRisk.impact || 3,
      score,
      status: newRisk.status || 'OPEN',
      owner: newRisk.owner || '',
      mitigation: newRisk.mitigation || '',
      contingency: newRisk.contingency || '',
      mitigationDueDate: newRisk.mitigationDueDate || '',
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    setRisks([...risks, risk])
    setShowAddModal(false)
    setNewRisk({
      title: '',
      description: '',
      category: 'Schedule',
      probability: 3,
      impact: 3,
      status: 'OPEN',
      owner: '',
      mitigation: '',
      contingency: '',
      mitigationDueDate: '',
    })
  }

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (isExporting) return // Prevent multiple simultaneous exports
    
    setIsExporting(true)
    const toastId = toast.loading(`Exporting ${format.toUpperCase()} file...`)
    
    try {
      // Build query parameters with active filters
      const params = new URLSearchParams({ format })
      if (filterStatus !== 'ALL') params.append('status', filterStatus)
      if (filterOwner !== 'ALL') params.append('owner', filterOwner)
      if (filterCategory !== 'ALL') params.append('category', filterCategory)
      
      // Fetch the file
      const response = await apiFetch(`/api/risks/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      // Extract filename from Content-Disposition header or use default
      let filename = `risk-register-${new Date().toISOString().split('T')[0]}.${format}`
      const contentDisposition = response.headers.get('Content-Disposition')
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`${format.toUpperCase()} file exported successfully!`, { id: toastId })
    } catch (error) {
      console.error('Export error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to export risk register: ${errorMessage}. Please try again.`, { id: toastId })
    } finally {
      setIsExporting(false)
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
      const risksInCell = filteredRisks.filter(
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the risk register.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleLogin}
                className="btn btn-primary w-full"
              >
                Sign In
              </button>
              <Link 
                href="/"
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full inline-block text-center"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Risk Register</h1>
              <p className="text-red-100 mt-1">Comprehensive risk management and tracking</p>
            </div>
            <Link href="/" className="btn bg-red-700 hover:bg-red-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Risk Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Overdue</h3>
            <p className="text-3xl font-bold text-red-600 flex items-center gap-2">
              {overdueCount > 0 && <span className="text-2xl">⚠️</span>}
              {overdueCount}
            </p>
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Risk Trends Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} name="Critical" />
                <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} name="High" />
                <Line type="monotone" dataKey="medium" stroke="#f97316" strokeWidth={2} name="Medium" />
                <Line type="monotone" dataKey="low" stroke="#eab308" strokeWidth={2} name="Low" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Risk Heatmap (Probability × Impact)</h2>
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
          <div className="mt-4 flex gap-4 justify-center text-sm flex-wrap">
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

        {/* Filters and Export */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-2">Filter by Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="CLOSED">Closed</option>
                <option value="ACCEPTED">Accepted</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-2">Filter by Owner</label>
              <select 
                value={filterOwner} 
                onChange={(e) => setFilterOwner(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">All Owners</option>
                {uniqueOwners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-2">Filter by Category</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className={`btn bg-green-600 hover:bg-green-700 text-white ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <button 
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
                className={`btn bg-blue-600 hover:bg-blue-700 text-white ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isExporting ? 'Exporting...' : 'Export XLSX'}
              </button>
            </div>
          </div>
        </div>

        {/* Risk List */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Risk Register ({filteredRisks.length})</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              + Add Risk
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Risk ID</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Owner</th>
                  <th className="p-3 text-center">P</th>
                  <th className="p-3 text-center">I</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-left">Level</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Due Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map(risk => {
                  const level = getRiskLevel(risk.score)
                  const overdue = isOverdue(risk)
                  return (
                    <tr key={risk.id} className={`border-t hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="p-3 font-mono text-sm">
                        {overdue && <span className="mr-1">⚠️</span>}
                        {risk.riskNumber}
                      </td>
                      <td className="p-3">{risk.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {risk.category}
                        </span>
                      </td>
                      <td className="p-3">{risk.owner}</td>
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
                      <td className="p-3 text-sm">
                        {overdue && <span className="text-red-600 font-semibold">OVERDUE<br/></span>}
                        {risk.mitigationDueDate}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            setSelectedRisk(risk)
                            setShowDetailsModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mitigation Tracking */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Mitigation Tracking</h2>
          <div className="space-y-4">
            {filteredRisks.filter(r => r.status === 'OPEN').map(risk => {
              const overdue = isOverdue(risk)
              return (
                <div key={risk.id} className={`border rounded-lg p-4 ${overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {overdue && <span className="text-red-600">⚠️ </span>}
                        {risk.riskNumber} - {risk.title}
                      </h3>
                      <p className="text-sm text-gray-600">Owner: {risk.owner} | Due: {risk.mitigationDueDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getRiskLevel(risk.score).color}`}>
                      {getRiskLevel(risk.score).label}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Mitigation Strategy:</h4>
                      <p className="text-sm">{risk.mitigation}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Contingency Plan:</h4>
                      <p className="text-sm">{risk.contingency}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Add Risk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Risk</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title *</label>
                  <input
                    type="text"
                    value={newRisk.title}
                    onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Risk title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Description *</label>
                  <textarea
                    value={newRisk.description}
                    onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Detailed description of the risk"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Category *</label>
                    <select
                      value={newRisk.category}
                      onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Schedule">Schedule</option>
                      <option value="Cost">Cost</option>
                      <option value="Resource">Resource</option>
                      <option value="Technical">Technical</option>
                      <option value="Regulatory">Regulatory</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Owner *</label>
                    <input
                      type="text"
                      value={newRisk.owner}
                      onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Risk owner name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Probability (1-5) *</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRisk.probability}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setNewRisk({ ...newRisk, probability: isNaN(val) ? 1 : val })
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Impact (1-5) *</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRisk.impact}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setNewRisk({ ...newRisk, impact: isNaN(val) ? 1 : val })
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Status *</label>
                    <select
                      value={newRisk.status}
                      onChange={(e) => setNewRisk({ ...newRisk, status: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="OPEN">Open</option>
                      <option value="MITIGATED">Mitigated</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Mitigation Due Date *</label>
                  <input
                    type="date"
                    value={newRisk.mitigationDueDate}
                    onChange={(e) => setNewRisk({ ...newRisk, mitigationDueDate: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Mitigation Strategy *</label>
                  <textarea
                    value={newRisk.mitigation}
                    onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={2}
                    placeholder="How will this risk be mitigated?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Contingency Plan *</label>
                  <textarea
                    value={newRisk.contingency}
                    onChange={(e) => setNewRisk({ ...newRisk, contingency: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={2}
                    placeholder="What is the backup plan?"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-semibold">Risk Score: {(newRisk.probability || 1) * (newRisk.impact || 1)}</p>
                  <p className="text-xs text-gray-600 mt-1">Probability × Impact = Score</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddRisk}
                  className="btn btn-primary flex-1"
                >
                  Add Risk
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn bg-gray-500 hover:bg-gray-600 text-white flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRisk.riskNumber} - {selectedRisk.title}</h2>
                  {isOverdue(selectedRisk) && (
                    <p className="text-red-600 font-semibold mt-1">⚠️ OVERDUE</p>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Category</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm inline-block mt-1">
                      {selectedRisk.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Status</h3>
                    <span className={`px-2 py-1 rounded text-sm inline-block mt-1 ${getStatusColor(selectedRisk.status)}`}>
                      {selectedRisk.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Risk Level</h3>
                    <span className={`px-2 py-1 rounded text-sm font-semibold inline-block mt-1 ${getRiskLevel(selectedRisk.score).color}`}>
                      {getRiskLevel(selectedRisk.score).label}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Description</h3>
                  <p className="mt-1">{selectedRisk.description}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Probability</h3>
                    <p className="text-2xl font-bold mt-1">{selectedRisk.probability}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Impact</h3>
                    <p className="text-2xl font-bold mt-1">{selectedRisk.impact}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Score</h3>
                    <p className="text-2xl font-bold mt-1">{selectedRisk.score}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Owner</h3>
                    <p className="mt-1">{selectedRisk.owner}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Mitigation Due Date</h3>
                    <p className={`mt-1 ${isOverdue(selectedRisk) ? 'text-red-600 font-semibold' : ''}`}>
                      {selectedRisk.mitigationDueDate}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Mitigation Strategy</h3>
                  <p className="mt-1 bg-green-50 p-3 rounded">{selectedRisk.mitigation}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Contingency Plan</h3>
                  <p className="mt-1 bg-yellow-50 p-3 rounded">{selectedRisk.contingency}</p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Created: {selectedRisk.createdAt}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn bg-gray-500 hover:bg-gray-600 text-white w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
