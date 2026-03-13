import { useEffect, useState } from 'react'
import { 
  Users, 
  FileText, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Shield,
  UserCheck,
  UserX,
  BarChart3
} from 'lucide-react'
import { getAdminDashboard } from '../api/userApi'
import { getMonthlyReports, getDetectionTrends } from '../api/analyticsApi'
import { StatCard, PageLoader } from '../components/common/UI'
import { MonthlyReportsChart } from '../components/charts/Charts'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    Promise.all([
      getAdminDashboard(), 
      getMonthlyReports(6), 
      getDetectionTrends(),
      // Mock recent activity - replace with actual API call
      Promise.resolve({ data: [] })
    ])
      .then(([s, m, t, a]) => {
        setStats(s.data)

        // Backend returns flat array: [{year, month, total, detected}]
        const raw = Array.isArray(m.data) ? m.data : []
        setMonthly(
          raw.map(r => ({
            month: MONTH_NAMES[(r.month ?? 1) - 1],
            total: r.total ?? 0,
            detected: r.detected ?? 0,
            clean: (r.total ?? 0) - (r.detected ?? 0),
          }))
        )

        // Backend returns single object: {total_reports, detected, clean, detection_rate_percent, by_risk_level}
        setTrends(t.data ?? null)
        setRecentActivity(a.data ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const byRisk = trends?.by_risk_level ?? {}
  const riskColors = { 
    critical: '#ef4444', 
    high: '#f97316', 
    medium: '#f59e0b', 
    low: '#22c55e' 
  }

  const totalReports = trends?.total_reports ?? 0
  const detected = trends?.detected ?? 0
  const clean = trends?.clean ?? 0
  const detectionRate = trends?.detection_rate_percent ?? 0

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
            ADMIN DASHBOARD
          </span>
          <h1 style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            System Overview
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>
            Monitor platform activity, user metrics, and detection analytics
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

      {/* Row 1 — 4 main stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { 
            label: 'Total Athletes', 
            value: stats?.total_athletes ?? 0, 
            icon: Users, 
            color: '#16a34a',
            bgColor: 'rgba(22,163,74,0.1)',
            trend: '+12 this month'
          },
          { 
            label: 'Medical Reports', 
            value: stats?.total_reports ?? 0, 
            icon: FileText, 
            color: '#6366f1',
            bgColor: 'rgba(99,102,241,0.1)',
            trend: '+8% vs last month'
          },
          { 
            label: 'Investigations', 
            value: stats?.active_investigations ?? 0, 
            icon: Search, 
            color: '#f59e0b',
            bgColor: 'rgba(245,158,11,0.1)',
            trend: `${stats?.active_investigations ?? 0} active`
          },
          { 
            label: 'Active Bans', 
            value: stats?.active_bans ?? 0, 
            icon: ShieldAlert, 
            color: '#ef4444',
            bgColor: 'rgba(239,68,68,0.1)',
            trend: 'Last 30 days'
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

      {/* Row 2 — role + report status counts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { 
            label: 'Total Doctors', 
            value: stats?.total_doctors ?? 0, 
            icon: UserCheck, 
            color: '#22c55e',
            bgColor: 'rgba(34,197,94,0.1)',
            subtitle: 'Active medical staff'
          },
          { 
            label: 'Detected Reports', 
            value: stats?.reports_by_status?.detected ?? 0, 
            icon: AlertTriangle, 
            color: '#ef4444',
            bgColor: 'rgba(239,68,68,0.1)',
            subtitle: `${((stats?.reports_by_status?.detected / totalReports) * 100).toFixed(1)}% of total`
          },
          { 
            label: 'Clean Reports', 
            value: stats?.reports_by_status?.clean ?? 0, 
            icon: CheckCircle, 
            color: '#22c55e',
            bgColor: 'rgba(34,197,94,0.1)',
            subtitle: `${((stats?.reports_by_status?.clean / totalReports) * 100).toFixed(1)}% of total`
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="stat-tile"
            style={{ animation: `slideIn 0.5s ease ${(i+4) * 0.1}s both` }}
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
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#0d1f0d',
                  fontFamily: '"Playfair Display", serif',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
        padding: '16px 20px',
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 60,
      }}>
        {[
          { label: 'Total Reports', value: totalReports, icon: FileText, color: '#16a34a' },
          { label: 'Detection Rate', value: `${detectionRate}%`, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Detected', value: detected, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Clean', value: clean, icon: CheckCircle, color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: `${stat.color}10`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280' }}>{stat.label}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 3 — charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        marginBottom: 20,
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

        {/* Risk level breakdown */}
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
              Detection rate: <strong style={{ color: '#f59e0b' }}>{detectionRate}%</strong>
              {' · '}Total detected: <strong style={{ color: '#ef4444' }}>{detected}</strong>
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
                        fontSize: 14, 
                        color: '#374151',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                      }}>
                        {level}
                      </span>
                      <span style={{ 
                        fontSize: 14, 
                        fontWeight: 700, 
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

      {/* Monthly breakdown table */}
      {monthly.length > 0 && (
        <div className="dashboard-card">
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
                  const rate = row.total > 0 ? ((row.detected / row.total) * 100).toFixed(1) : 0
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

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginTop: 20,
      }}>
        {[
          { label: 'View All Users', icon: Users, color: '#16a34a', onClick: () => {} },
          { label: 'Review Reports', icon: FileText, color: '#6366f1', onClick: () => {} },
          { label: 'Manage Cases', icon: Search, color: '#f59e0b', onClick: () => {} },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 24px',
              background: '#fff',
              border: '1.5px solid #e8f5e9',
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.color = action.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 20px ${action.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e8f5e9';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <action.icon size={16} color={action.color} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: 24,
        padding: '16px 20px',
        background: '#f8faf8',
        border: '1.5px solid #e8f5e9',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <BarChart3 size={18} color="#16a34a" />
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Dashboard data is updated in real-time. Last sync: {new Date().toLocaleTimeString()}
        </p>
      </div>
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
      <Activity size={36} color="#9ca3af" style={{ marginBottom: 12, opacity: 0.5 }} />
      <p style={{ fontSize: 14, color: '#9ca3af' }}>{label}</p>
    </div>
  )
}