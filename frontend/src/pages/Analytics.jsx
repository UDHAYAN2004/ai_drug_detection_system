import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Activity, 
  PieChart, 
  BarChart3,
  ArrowUp,
  ArrowDown,
  Shield
} from 'lucide-react'
import { getMonthlyReports, getDetectionTrends } from '../api/analyticsApi'
import { MonthlyReportsChart, RiskLevelPieChart } from '../components/charts/Charts'
import { PageLoader } from '../components/common/UI'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Analytics() {
  const [monthly, setMonthly] = useState([])
  const [trends, setTrends] = useState(null)
  const [riskData, setRiskData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('6months')
  const [comparison, setComparison] = useState(null)

  useEffect(() => {
    Promise.all([getMonthlyReports(6), getDetectionTrends()])
      .then(([m, t]) => {

        // Backend returns flat array: [{year, month, total, detected}]
        const raw = Array.isArray(m.data) ? m.data : []
        const monthlyData = raw.map(r => ({
          month: MONTH_NAMES[(r.month ?? 1) - 1],
          total: r.total ?? 0,
          detected: r.detected ?? 0,
          clean: (r.total ?? 0) - (r.detected ?? 0),
        }))
        setMonthly(monthlyData)

        // Calculate month-over-month change
        if (monthlyData.length >= 2) {
          const lastMonth = monthlyData[monthlyData.length - 1]
          const prevMonth = monthlyData[monthlyData.length - 2]
          const change = lastMonth.total - prevMonth.total
          const percentChange = prevMonth.total > 0 
            ? ((change / prevMonth.total) * 100).toFixed(1)
            : 0
          setComparison({ change, percentChange })
        }

        // Backend returns single object: {total_reports, detected, clean,
        //   detection_rate_percent, by_risk_level}
        const trendsObj = t.data ?? {}
        setTrends(trendsObj)

        // Build pie chart data from by_risk_level
        const riskMap = trendsObj.by_risk_level ?? {}
        setRiskData(
          Object.entries(riskMap)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ 
              name: name.toUpperCase(), 
              value,
              color: name === 'critical' ? '#ef4444' :
                     name === 'high' ? '#f97316' :
                     name === 'medium' ? '#f59e0b' :
                     name === 'low' ? '#22c55e' : '#16a34a'
            }))
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const detectionRate = trends?.detection_rate_percent ?? 0
  const totalReports = trends?.total_reports ?? 0
  const detected = trends?.detected ?? 0
  const clean = trends?.clean ?? 0

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
        .analytics-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 24px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.02);
        }
        .analytics-card:hover {
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

      {/* Header */}
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
            <BarChart3 size={14} />
            ANALYTICS DASHBOARD
          </span>
          <h1 style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Detection Analytics
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280' }}>
            Comprehensive analysis of drug detection patterns and trends
          </p>
        </div>

        {/* Timeframe selector */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '4px',
          background: '#f8faf8',
          border: '1.5px solid #e8f5e9',
          borderRadius: 60,
        }}>
          {['6months', '1year', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 40,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: timeframe === t ? '#16a34a' : 'transparent',
                border: 'none',
                color: timeframe === t ? '#fff' : '#6b7280',
              }}
            >
              {t === '6months' ? '6 Months' : t === '1year' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {trends && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginBottom: 24,
        }}>
          {[
            { 
              label: 'Total Reports', 
              value: totalReports, 
              icon: FileText, 
              color: '#16a34a',
              change: comparison?.change,
              percentChange: comparison?.percentChange
            },
            { 
              label: 'Detected', 
              value: detected, 
              icon: AlertTriangle, 
              color: '#ef4444',
              subtitle: `${((detected / totalReports) * 100).toFixed(1)}% of total`
            },
            { 
              label: 'Clean', 
              value: clean, 
              icon: CheckCircle, 
              color: '#22c55e',
              subtitle: `${((clean / totalReports) * 100).toFixed(1)}% of total`
            },
            { 
              label: 'Detection Rate', 
              value: `${detectionRate}%`, 
              icon: TrendingUp, 
              color: '#f59e0b',
              trend: detectionRate > 50 ? 'High' : 'Moderate'
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-tile"
              style={{ animation: `slideIn 0.5s ease ${i * 0.1}s both` }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  background: `${stat.color}10`,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                {stat.change !== undefined && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 40,
                    background: stat.change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: stat.change >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {stat.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(stat.percentChange)}%
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{stat.label}</p>
              <p style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#0d1f0d',
                fontFamily: '"Playfair Display", serif',
                lineHeight: 1.2,
                marginBottom: stat.subtitle ? 4 : 0,
              }}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{stat.subtitle}</p>
              )}
              {stat.trend && (
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{stat.trend} detection rate</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Charts Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* Monthly Report Volume */}
        <div className="analytics-card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16 
          }}>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#0d1f0d',
                fontFamily: '"Playfair Display", serif',
                marginBottom: 4,
              }}>
                Monthly Report Volume
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Total reports vs detected cases over time
              </p>
            </div>
            <Activity size={20} color="#16a34a" />
          </div>
          {monthly.length > 0 ? (
            <MonthlyReportsChart data={monthly} />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Risk Level Distribution */}
        <div className="analytics-card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16 
          }}>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#0d1f0d',
                fontFamily: '"Playfair Display", serif',
                marginBottom: 4,
              }}>
                Risk Level Distribution
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Breakdown of cases by severity
              </p>
            </div>
            <PieChart size={20} color="#16a34a" />
          </div>
          {riskData.length > 0 ? (
            <RiskLevelPieChart data={riskData} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* Detection Rate Progress Bars */}
        <div className="analytics-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
              marginBottom: 4,
            }}>
              Detection Rate by Month
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Monthly detection percentage trends
            </p>
          </div>
          {monthly.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {monthly.map((row, i) => {
                const rate = row.total > 0 ? (row.detected / row.total) * 100 : 0
                return (
                  <div key={i} style={{ animation: `slideIn 0.3s ease ${i * 0.05}s both` }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 6 
                    }}>
                      <span style={{ 
                        fontSize: 13, 
                        fontWeight: 600, 
                        color: '#374151',
                        minWidth: 40 
                      }}>
                        {row.month}
                      </span>
                      <span style={{ 
                        fontSize: 12, 
                        color: rate > 50 ? '#ef4444' : '#22c55e',
                        fontWeight: 600 
                      }}>
                        {rate.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ 
                      height: 10, 
                      background: '#e8f5e9',
                      borderRadius: 5,
                      overflow: 'hidden',
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${rate}%`, 
                        background: rate > 50 
                          ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                          : 'linear-gradient(90deg, #16a34a, #4ade80)',
                        borderRadius: 5,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Monthly Breakdown Table */}
        <div className="analytics-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
              marginBottom: 4,
            }}>
              Monthly Breakdown
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Detailed statistics by month
            </p>
          </div>
          {monthly.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: 14,
              }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e8f5e9' }}>
                    {['Month', 'Total', 'Detected', 'Clean', 'Rate'].map(h => (
                      <th key={h} style={{ 
                        padding: '12px 8px', 
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
                          padding: '12px 8px',
                          fontWeight: 600,
                          color: '#111827',
                        }}>
                          {row.month}
                        </td>
                        <td style={{ 
                          padding: '12px 8px',
                          color: '#4b5563',
                        }}>
                          {row.total}
                        </td>
                        <td style={{ 
                          padding: '12px 8px',
                          color: '#ef4444',
                          fontWeight: 600,
                        }}>
                          {row.detected}
                        </td>
                        <td style={{ 
                          padding: '12px 8px',
                          color: '#22c55e',
                        }}>
                          {row.clean}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
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
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Risk Level Legend */}
      {riskData.length > 0 && (
        <div className="analytics-card" style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            marginBottom: 16,
          }}>
            Risk Level Legend
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {[
              { level: 'Critical', color: '#ef4444', desc: 'Immediate action required' },
              { level: 'High', color: '#f97316', desc: 'Urgent review needed' },
              { level: 'Medium', color: '#f59e0b', desc: 'Standard investigation' },
              { level: 'Low', color: '#22c55e', desc: 'Routine monitoring' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px',
                background: '#f8faf8',
                borderRadius: 12,
                border: '1.5px solid #e8f5e9',
              }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: item.color,
                }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                    {item.level}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <Shield size={18} color="#16a34a" />
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Data reflects AI-powered detection results from medical reports. 
          All statistics are updated in real-time based on the latest analyses.
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
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
      <p style={{ fontSize: 14, color: '#9ca3af' }}>No analytics data available</p>
      <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>Check back after uploading reports</p>
    </div>
  )
}