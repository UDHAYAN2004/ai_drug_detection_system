import { useEffect, useState } from 'react'
import { Eye, AlertTriangle, Calendar, UserCheck, FileText, Shield, Clock } from 'lucide-react'
import axiosInstance from '../../api/axios'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import { PageLoader } from '../../components/common/UI'
import { formatDateTime, getRiskBadgeClass, getStatusBadgeClass, capitalize } from '../../utils/helpers'

export default function MyCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0
  })

  useEffect(() => {
    axiosInstance.get('/investigations/my-cases').then(({ data }) => {
      setCases(data || [])
      // Calculate stats
      const total = data?.length || 0
      const active = data?.filter(c => c.status === 'under_investigation' || c.status === 'pending_review').length || 0
      const resolved = data?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0
      const critical = data?.filter(c => c.risk_level === 'critical' || c.risk_level === 'high').length || 0
      setStats({ total, active, resolved, critical })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openDetail = async (row) => {
    try {
      const { data } = await axiosInstance.get(`/investigations/${row.case_id}`)
      setDetail(data)
    } catch { setDetail(row) }
  }

  const columns = [
    {
      key: 'case_id',
      label: 'Case ID',
      render: v => (
        <span style={{
          fontFamily: 'monospace',
          fontSize: 12,
          background: 'rgba(22,163,74,0.1)',
          padding: '4px 8px',
          borderRadius: 6,
          color: '#16a34a',
          fontWeight: 500,
        }}>
          {v}
        </span>
      )
    },
    {
      key: 'detected_drug',
      label: 'Substance',
      render: v => v ? (
        <span style={{
          background: 'rgba(239,68,68,0.1)',
          color: '#ef4444',
          padding: '4px 10px',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {v}
        </span>
      ) : '—'
    },
    {
      key: 'risk_level',
      label: 'Risk',
      render: v => v ? (
        <span style={{
          background: v === 'critical' ? 'rgba(239,68,68,0.1)' : 
                     v === 'high' ? 'rgba(249,115,22,0.1)' :
                     v === 'medium' ? 'rgba(245,158,11,0.1)' :
                     'rgba(34,197,94,0.1)',
          color: v === 'critical' ? '#ef4444' :
                 v === 'high' ? '#f97316' :
                 v === 'medium' ? '#f59e0b' :
                 '#22c55e',
          padding: '4px 10px',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {v}
        </span>
      ) : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: v => (
        <span style={{
          background: v === 'resolved' || v === 'closed' ? 'rgba(34,197,94,0.1)' :
                     v === 'under_investigation' ? 'rgba(245,158,11,0.1)' :
                     'rgba(99,102,241,0.1)',
          color: v === 'resolved' || v === 'closed' ? '#22c55e' :
                 v === 'under_investigation' ? '#f59e0b' :
                 '#6366f1',
          padding: '4px 10px',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {v?.replace('_', ' ') || ''}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Opened',
      render: v => (
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {formatDateTime(v)}
        </span>
      )
    },
    {
      key: 'id',
      label: '',
      width: 40,
      render: (_, row) => (
        <button
          onClick={() => openDetail(row)}
          style={{
            background: 'none',
            border: '1.5px solid #e8f5e9',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#6b7280',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#16a34a';
            e.currentTarget.style.borderColor = '#16a34a';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = '#e8f5e9';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <Eye size={14} />
        </button>
      )
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.6s ease' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .stat-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 16px 32px rgba(22,163,74,0.08);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
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
          marginBottom: 16,
        }}>
          <Shield size={14} />
          MY CASES
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>Investigations</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Track and monitor your active cases</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 32,
      }}>
        {[
          { icon: FileText, label: 'Total Cases', value: stats.total, color: '#16a34a' },
          { icon: Clock, label: 'Active Cases', value: stats.active, color: '#f59e0b' },
          { icon: UserCheck, label: 'Resolved', value: stats.resolved, color: '#22c55e' },
          { icon: AlertTriangle, label: 'Critical', value: stats.critical, color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ animation: `slideIn 0.5s ease ${i * 0.1}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                background: `${stat.color}10`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{stat.label}</p>
            </div>
            <p style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#0d1f0d',
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1,
            }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Cases Table */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0d1f0d', fontFamily: '"Playfair Display", serif' }}>
            Case List
          </h3>
          <span style={{
            padding: '6px 12px',
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 40,
            fontSize: 13,
            color: '#6b7280',
          }}>
            {cases.length} total
          </span>
        </div>
        <Table columns={columns} data={cases} loading={loading} />
      </div>

      {/* Case Details Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Case Details" size="lg">
        {detail && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Header Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              padding: 16,
              background: '#f8faf8',
              border: '1.5px solid #e8f5e9',
              borderRadius: 16,
            }}>
              <AlertTriangle size={24} color={detail.risk_level === 'critical' ? '#ef4444' : '#f59e0b'} />
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Case {detail.case_id}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                  {detail.detected_drug ? `Substance: ${detail.detected_drug}` : 'Investigation Case'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              {[
                ['Status', detail.status?.replace('_', ' ')],
                ['Risk Level', detail.risk_level?.toUpperCase()],
                ['Opened', formatDateTime(detail.created_at)],
                ['Last Updated', formatDateTime(detail.updated_at)],
              ].map(([label, val]) => (
                <div key={label} style={{
                  background: '#f8faf8',
                  border: '1.5px solid #e8f5e9',
                  borderRadius: 14,
                  padding: '14px 16px',
                }}>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>
                    {val || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Comments */}
            {detail.authority_comments && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Authority Comments
                </p>
                <div style={{
                  background: '#f8faf8',
                  border: '1.5px solid #e8f5e9',
                  borderRadius: 14,
                  padding: 16,
                }}>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                    {detail.authority_comments}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {detail.timeline?.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Timeline
                </p>
                <div style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  padding: '4px 8px',
                }}>
                  {detail.timeline.map((t, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: 16,
                      padding: '12px 0',
                      borderBottom: i < detail.timeline.length - 1 ? '1.5px solid #e8f5e9' : 'none',
                    }}>
                      <span style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        minWidth: 80,
                        fontFamily: 'monospace',
                      }}>
                        {formatDateTime(t.timestamp)}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: '#374151',
                      }}>
                        {t.action || t.note || JSON.stringify(t)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}