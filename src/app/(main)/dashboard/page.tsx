"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Leaf, Users, Shield, BarChart3, Loader2, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface DeptScore {
  id: string
  name: string
  envScore: number
  socialScore: number
  govScore: number
  totalScore: number
  trend: number
  reason: string | null
}

interface ScoresData {
  overall: number
  environmental: number
  social: number
  governance: number
  departments: DeptScore[]
}

interface Diagnosis {
  department: string
  area: string
  finding: string
  severity: 'high' | 'medium' | 'low'
}

interface Recommendation {
  action: string
  impact: string
  priority: number
}

interface AdvisorData {
  summary: string
  score: number
  diagnoses: Diagnosis[]
  recommendations: Recommendation[]
}

function ScoreCard({ title, value, icon: Icon, color }: { title: string; value: number | null; icon: any; color: string }) {
  const getColor = () => {
    if (value === null) return 'text-gray-400'
    if (value >= 75) return 'text-emerald-600'
    if (value >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className={`rounded-full p-2 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className={`text-4xl font-bold ${getColor()}`}>
        {value === null ? <span className="text-2xl text-gray-300 animate-pulse">...</span> : value}
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            value && value >= 75 ? 'bg-emerald-500' : value && value >= 50 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">out of 100</p>
    </div>
  )
}

function DepartmentLeaderboard({ departments }: { departments: DeptScore[] }) {
  const sorted = [...departments].sort((a, b) => b.totalScore - a.totalScore)
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Department Leaderboard</h3>
      <div className="space-y-3">
        {sorted.map((dept, i) => (
          <div key={dept.id} className="flex items-center gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
              i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-200 text-gray-600'
            }`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={dept.reason || ''}>{dept.name}</span>
                <div className="flex items-center gap-2">
                  {(dept.trend || 0) > 0 ? (
                    <span className="flex items-center text-xs font-medium text-emerald-500" title={dept.reason || 'Improving'}>
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +{(dept.trend || 0).toFixed(1)}
                    </span>
                  ) : (dept.trend || 0) < 0 ? (
                    <span className="flex items-center text-xs font-medium text-red-500" title={dept.reason || 'Declining'}>
                      <TrendingDown className="h-3 w-3 mr-0.5" /> {(dept.trend || 0).toFixed(1)}
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-medium text-gray-400" title={dept.reason || 'Stable'}>
                      <Minus className="h-3 w-3 mr-0.5" /> {(dept.trend || 0).toFixed(1)}
                    </span>
                  )}
                  <span className={`text-sm font-bold ${
                    dept.totalScore >= 75 ? 'text-emerald-600' : dept.totalScore >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>{Math.round(dept.totalScore)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {[
                  { label: 'E', value: dept.envScore, color: 'bg-emerald-500' },
                  { label: 'S', value: dept.socialScore, color: 'bg-blue-500' },
                  { label: 'G', value: dept.govScore, color: 'bg-purple-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex-1">
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{label}:{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No department data yet</p>
        )}
      </div>
    </div>
  )
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DUMMY_TREND_DATA = [
  { month: 'Jan', score: 55, env: 52, soc: 60, gov: 54 },
  { month: 'Feb', score: 58, env: 54, soc: 62, gov: 58 },
  { month: 'Mar', score: 57, env: 53, soc: 61, gov: 57 },
  { month: 'Apr', score: 62, env: 60, soc: 65, gov: 60 },
  { month: 'May', score: 68, env: 67, soc: 69, gov: 68 },
  { month: 'Jun', score: 72, env: 71, soc: 75, gov: 70 },
]

export default function DashboardPage() {
  const [scores, setScores] = useState<ScoresData | null>(null)
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null)
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorError, setAdvisorError] = useState('')

  useEffect(() => {
    fetch('/api/scores')
      .then(r => r.json())
      .then(setScores)
      .catch(console.error)
  }, [])

  const getInsights = async () => {
    setAdvisorLoading(true)
    setAdvisorError('')
    try {
      const res = await fetch('/api/ai/advisor', { method: 'POST' })
      const data = await res.json()
      setAdvisor(data)
    } catch {
      setAdvisorError('Failed to fetch insights. Please try again.')
    } finally {
      setAdvisorLoading(false)
    }
  }

  const severityIcon = (s: string) =>
    s === 'high' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
    s === 'medium' ? <Info className="h-4 w-4 text-amber-500" /> :
    <CheckCircle className="h-4 w-4 text-emerald-500" />

  const severityBg = (s: string) =>
    s === 'high' ? 'border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900' :
    s === 'medium' ? 'border-amber-100 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900' :
    'border-emerald-100 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Organization Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your ESG performance and insights.</p>
        </div>
        <a 
          href="/api/reports/full"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          Export Full Report PDF
        </a>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ScoreCard title="Overall ESG Score" value={scores?.overall ?? null} icon={BarChart3} color="bg-emerald-600" />
        <ScoreCard title="Environmental Score" value={scores?.environmental ?? null} icon={Leaf} color="bg-green-500" />
        <ScoreCard title="Social Score" value={scores?.social ?? null} icon={Users} color="bg-blue-500" />
        <ScoreCard title="Governance Score" value={scores?.governance ?? null} icon={Shield} color="bg-purple-500" />
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historical ESG Trend (6 Months)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DUMMY_TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="score" name="Overall" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="env" name="Environment" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="soc" name="Social" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gov" name="Governance" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard + Advisor */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Department Leaderboard */}
        <div className="lg:col-span-2">
          {scores ? (
            <DepartmentLeaderboard departments={scores.departments} />
          ) : (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          )}
        </div>

        {/* ESG Advisor AI */}
        <div className="lg:col-span-3 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-amber-400" />
                ESG Advisor AI
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent insights based on your live metrics.</p>
            </div>
            <button
              onClick={getInsights}
              disabled={advisorLoading}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 transition-colors"
            >
              {advisorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {advisorLoading ? 'Analysing...' : 'Get ESG Insights'}
            </button>
          </div>

          {!advisor && !advisorLoading && !advisorError && (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm text-gray-400">Click "Get ESG Insights" to generate AI analysis.</p>
            </div>
          )}

          {advisorLoading && (
            <div className="flex h-32 items-center justify-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-500">Analysing your ESG data...</p>
            </div>
          )}

          {advisorError && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{advisorError}</div>
          )}

          {advisor && !advisorLoading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 dark:bg-emerald-900/20 dark:border-emerald-900">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{advisor.summary}</p>
              </div>

              {/* Diagnoses */}
              {advisor.diagnoses?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Diagnoses</h4>
                  <div className="space-y-2">
                    {advisor.diagnoses.map((d, i) => (
                      <div key={i} className={`flex gap-3 rounded-lg border p-3 ${severityBg(d.severity)}`}>
                        {severityIcon(d.severity)}
                        <div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.department} · {d.area}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{d.finding}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {advisor.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {advisor.recommendations.sort((a, b) => a.priority - b.priority).map((r, i) => (
                      <div key={i} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{r.priority}</span>
                        <div>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{r.action}</p>
                          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{r.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
