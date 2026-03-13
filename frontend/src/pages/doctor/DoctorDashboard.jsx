import { useEffect, useState } from 'react'
import { CheckCircle, Clock, TrendingUp, FileText, AlertTriangle, Activity, Shield, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import axiosInstance from '../../api/axios'
import { getMonthlyReports, getDetectionTrends } from '../../api/analyticsApi'
import { StatCard, PageLoader } from '../../components/common/UI'
import { MonthlyReportsChart } from '../../components/charts/Charts'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/doctor/dashboard'),
      getMonthlyReports(6),
      getDetectionTrends(),
      axiosInstance.get('/doctor/recent-activity').catch(() => ({ data: [] }))
    ])
      .then(([s, m, t, a]) => {
        setStats(s.data)

        // Backend returns: [{year, month, total, detected}, ...]
        const raw = Array.isArray(m.data) ? m.data : []
        setMonthly(
          raw.map(r => ({
            month: MONTH_NAMES[(r.month ?? 1) - 1],
            total: r.total ?? 0,
            detected: r.detected ?? 0,
            clean: (r.total ?? 0) - (r.detected ?? 0),
          }))
        )

        // Backend returns: {total_reports, detected, clean, detection_rate_percent, by_risk_level}
        setTrends(t.data ?? null)
        setRecentActivity(a.data ?? [])
      })
      .catch(e => setError(e?.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const detectionRate = trends?.detection_rate_percent ?? 0
  const byRisk = trends?.by_risk_level ?? {}

  const riskColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#22c55e',
  }

  return (
    <div style={{ 
      maxWidth: 1400, 
      margin: '0 auto',
      animation: 'fadeUp 0.6s ease'
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .dashboard-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 24px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.02);
        }
        .dashboard-card:hover {
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 16px 32px rgba(22,163,74,0.08);
        }
        .stat-tile {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .stat-tile:hover {
          transform: translateY(-4px);
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 12px 28px rgba(22,163,74,0.08);
        }
      `}</style>

      {/* Header with Welcome */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.15)',
            borderRadius: 40,
            fontSize: 12,
            fontWeight: 600,
            color: '#16a34a',
            marginBottom: 12,
          }}>
            <Shield size={14} />
            DOCTOR DASHBOARD
          </span>
          <h1 style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Welcome back, Dr. {stats?.doctor_name || '—'}
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>
            Here's your review summary and analytics
          </p>
        </div>

        {/* Date Badge */}
        <div style={{
          padding: '12px 20px',
          background: '#fff',
          border: '1.5px solid #e8f5e9',
          borderRadius: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Calendar size={18} color="#16a34a" />
          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: 24,
          padding: '16px 20px',
          background: '#fef2f2',
          border: '1.5px solid #fee2e2',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <AlertTriangle size={20} color="#ef4444" />
          <p style={{ fontSize: 14, color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      {/* Top Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { 
            label: 'Pending Reviews', 
            value: stats?.pending_reviews ?? 0, 
            icon: Clock, 
            color: '#f59e0b',
            bgColor: 'rgba(245,158,11,0.1)',
            trend: '+2 from yesterday'
          },
          { 
            label: 'Verified by Me', 
            value: stats?.total_verified_by_me ?? 0, 
            icon: CheckCircle, 
            color: '#22c55e',
            bgColor: 'rgba(34,197,94,0.1)',
            trend: 'This month'
          },
          { 
            label: 'Detection Rate', 
            value: `${detectionRate}%`, 
            icon: TrendingUp, 
            color: '#16a34a',
            bgColor: 'rgba(22,163,74,0.1)',
            trend: detectionRate > 50 ? 'Above average' : 'Below average'
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="stat-tile"
            style={{ animation: `slideIn 0.5s ease ${i * 0.1}s both` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                background: stat.bgColor,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{stat.label}</p>
                <p style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#0d1f0d',
                  fontFamily: '"Playfair Display", serif',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{stat.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Strip */}
      {trends && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 24,
        }}>
          {[
            { label: 'Total Reports', value: trends.total_reports, icon: FileText, color: '#16a34a', change: '+12%' },
            { label: 'Detected', value: trends.detected, icon: AlertTriangle, color: '#ef4444', change: '-3%' },
            { label: 'Clean', value: trends.clean, icon: Activity, color: '#22c55e', change: '+8%' },
          ].map(({ label, value, icon: Icon, color, change }, i) => (
            <div key={label} className="dashboard-card" style={{ padding: '20px', animation: `slideIn 0.5s ease ${(i+3)*0.1}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: `${color}10`,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: change.startsWith('+') ? '#22c55e' : '#ef4444',
                  background: change.startsWith('+') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  padding: '4px 8px',
                  borderRadius: 40,
                }}>
                  {change.startsWith('+') ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {change}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</p>
              <p style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#0d1f0d',
                fontFamily: '"Playfair Display", serif',
              }}>
                {value ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Monthly bar chart */}
        <div className="dashboard-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
              marginBottom: 4,
            }}>
              Monthly Reports
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Total vs detected — last 6 months
            </p>
          </div>
          {monthly.length > 0 ? (
            <MonthlyReportsChart data={monthly} />
          ) : (
            <EmptyState label="No monthly data yet" />
          )}
        </div>

        {/* Risk breakdown */}
        <div className="dashboard-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
              marginBottom: 4,
            }}>
              Cases by Risk Level
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Breakdown of detected cases by severity
            </p>
          </div>
          {Object.keys(byRisk).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(byRisk).map(([level, count]) => {
                const color = riskColors[level] || '#16a34a'
                const max = Math.max(...Object.values(byRisk), 1)
                const pct = Math.round((count / max) * 100)
                return (
                  <div key={level}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: 8 
                    }}>
                      <span style={{ 
                        fontSize: 13, 
                        color: '#374151',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                      }}>
                        {level}
                      </span>
                      <span style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#111827' 
                      }}>
                        {count}
                      </span>
                    </div>
                    <div style={{ 
                      height: 10, 
                      borderRadius: 5, 
                      background: '#e8f5e9',
                      overflow: 'hidden',
                    }}>
                      <div style={{ 
                        height: '100%', 
                        borderRadius: 5, 
                        width: `${pct}%`, 
                        background: color,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState label="No risk data yet" />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="dashboard-card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
            }}>
              Recent Activity
            </h3>
            <span style={{
              padding: '4px 12px',
              background: '#f0fdf4',
              borderRadius: 40,
              fontSize: 12,
              color: '#16a34a',
              fontWeight: 600,
            }}>
              Last 5 actions
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.slice(0, 5).map((act, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: '#f8faf8',
                borderRadius: 16,
                border: '1.5px solid #e8f5e9',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  background: act.type === 'verify' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {act.type === 'verify' ? (
                    <CheckCircle size={16} color="#22c55e" />
                  ) : (
                    <Clock size={16} color="#f59e0b" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                    {act.description}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>
                    {act.time || 'Just now'}
                  </p>
                </div>
                {act.report_id && (
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: '#16a34a',
                    background: 'rgba(22,163,74,0.1)',
                    padding: '4px 8px',
                    borderRadius: 6,
                  }}>
                    {act.report_id}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly data table */}
      {monthly.length > 0 && (
        <div className="dashboard-card" style={{ marginTop: 20 }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            marginBottom: 16,
          }}>
            Monthly Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 14,
            }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e8f5e9' }}>
                  {['Month', 'Total', 'Detected', 'Clean', 'Detection Rate'].map(h => (
                    <th key={h} style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      color: '#6b7280',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => {
                  const rate = row.total > 0 ? ((row.detected / row.total) * 100).toFixed(0) : 0
                  return (
                    <tr key={i} style={{ 
                      borderBottom: i < monthly.length - 1 ? '1.5px solid #e8f5e9' : 'none',
                    }}>
                      <td style={{ 
                        padding: '14px 16px',
                        fontWeight: 600,
                        color: '#111827',
                      }}>
                        {row.month}
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#4b5563',
                      }}>
                        {row.total}
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#ef4444',
                        fontWeight: 600,
                      }}>
                        {row.detected}
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#22c55e',
                      }}>
                        {row.clean}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: rate > 50 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                          color: rate > 50 ? '#ef4444' : '#22c55e',
                          borderRadius: 40,
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div style={{ 
      height: 250, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8faf8',
      borderRadius: 16,
      border: '1.5px dashed #e8f5e9',
    }}>
      <Activity size={32} color="#9ca3af" style={{ marginBottom: 12, opacity: 0.5 }} />
      <p style={{ fontSize: 14, color: '#9ca3af' }}>{label}</p>
    </div>
  )
}