'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { apiFetch } from '@/lib/api-client';

interface Project {
  id: string;
  name: string;
  projectNumber: string;
}

interface CostAnalytics {
  project: {
    id: string;
    name: string;
    projectNumber: string;
    budget: number;
    actualCost: number;
    currency: string;
  };
  costSummary: {
    budget: number;
    actualCost: number;
    committedCost: number;
    approvedVariations: number;
    totalBudget: number;
    eac: number;
    variance: number;
    margin: number;
    marginPercentage: number;
    marginThreshold: number;
  };
  performanceIndices: {
    cpi: number;
    spi: number;
  };
  cashflow: {
    period: string;
    aggregated: Array<{
      period: string;
      forecastInflow: number;
      forecastOutflow: number;
      actualInflow: number;
      actualOutflow: number;
    }>;
    sCurve: Array<{
      date: string;
      cumulativeForecast: number;
      cumulativeActual: number;
    }>;
  };
  eacTrend: Array<{
    id: string;
    eac: number;
    margin: number;
    marginPercentage: number;
    cpi: number;
    spi: number;
    recordedAt: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

export default function CostControlPage() {
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics();
    }
  }, [selectedProject, period]);

  const fetchProjects = async () => {
    try {
      const response = await apiFetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(
        `/api/cost-control/analytics?projectId=${selectedProject}&period=${period}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  const activeAlerts = analytics.alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cost Control Analytics</h1>
          <p className="text-gray-600 mt-1">
            {analytics.project.name} ({analytics.project.projectNumber})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg ${
                period === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg ${
                period === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded">
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(analytics.costSummary.totalBudget)}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Actual Cost</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(analytics.costSummary.actualCost)}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Committed Cost</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(analytics.costSummary.committedCost)}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">EAC</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(analytics.costSummary.eac)}
          </p>
          <p
            className={`text-sm mt-1 ${
              analytics.costSummary.variance < 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            Variance: {formatCurrency(analytics.costSummary.variance)}
          </p>
        </div>
      </div>

      {/* Margin Analysis & Performance Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Analysis */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Margin Analysis</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Margin</span>
                <span className="text-sm font-bold">
                  {formatCurrency(analytics.costSummary.margin)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Margin Percentage</span>
                <span
                  className={`text-sm font-bold ${
                    analytics.costSummary.marginPercentage <
                    analytics.costSummary.marginThreshold
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {analytics.costSummary.marginPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analytics.costSummary.marginPercentage <
                    analytics.costSummary.marginThreshold
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(analytics.costSummary.marginPercentage, 0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Threshold: {analytics.costSummary.marginThreshold}%
              </div>
            </div>
          </div>
        </div>

        {/* Performance Indices */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance Indices</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Cost Performance Index (CPI)
                </span>
                <span
                  className={`text-sm font-bold ${
                    analytics.performanceIndices.cpi < 1
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {analytics.performanceIndices.cpi.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analytics.performanceIndices.cpi < 1
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      analytics.performanceIndices.cpi * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Schedule Performance Index (SPI)
                </span>
                <span
                  className={`text-sm font-bold ${
                    analytics.performanceIndices.spi < 1
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {analytics.performanceIndices.spi.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analytics.performanceIndices.spi < 1
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      analytics.performanceIndices.spi * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow Chart */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Cashflow ({period === 'weekly' ? 'Weekly' : 'Monthly'})
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.cashflow.aggregated}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar
              dataKey="forecastInflow"
              fill="#10b981"
              name="Forecast Inflow"
            />
            <Bar dataKey="actualInflow" fill="#059669" name="Actual Inflow" />
            <Bar
              dataKey="forecastOutflow"
              fill="#f59e0b"
              name="Forecast Outflow"
            />
            <Bar
              dataKey="actualOutflow"
              fill="#d97706"
              name="Actual Outflow"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* S-Curve Chart */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">S-Curve (Cumulative)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.cashflow.sCurve}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Area
              type="monotone"
              dataKey="cumulativeForecast"
              stroke="#3b82f6"
              fill="#93c5fd"
              name="Cumulative Forecast"
            />
            <Area
              type="monotone"
              dataKey="cumulativeActual"
              stroke="#10b981"
              fill="#6ee7b7"
              name="Cumulative Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* EAC Trend Chart */}
      {analytics.eacTrend.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">EAC Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.eacTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="recordedAt"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'Margin %') {
                    return `${Number(value).toFixed(2)}%`;
                  }
                  return formatCurrency(Number(value));
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-GB')
                }
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="eac"
                stroke="#3b82f6"
                name="EAC"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="margin"
                stroke="#10b981"
                name="Margin"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="marginPercentage"
                stroke="#f59e0b"
                name="Margin %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
