import { useEffect, useState } from 'react'
import { CheckCircle,X, XCircle, Eye, Clock, AlertTriangle, FileText, User, Calendar, Shield } from 'lucide-react'
import axiosInstance from '../../api/axios'
import { verifyReport } from '../../api/reportApi'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import { PageLoader } from '../../components/common/UI'
import { formatDateTime, getRiskBadgeClass } from '../../utils/helpers'

export default function PendingReviews() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [verify, setVerify] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0
  })

  const fetch = async () => {
    setLoading(true)
    try { 
      const { data } = await axiosInstance.get('/doctor/pending-reviews')
      setReports(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const critical = data?.filter(r => r.risk_level === 'critical').length || 0
      const high = data?.filter(r => r.risk_level === 'high').length || 0
      const medium = data?.filter(r => r.risk_level === 'medium').length || 0
      setStats({ total, critical, high, medium })
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetch() }, [])

  const handleVerify = async (action) => {
    setSaving(true)
    try {
      await verifyReport(verify.id, { action, comments: notes })
      setVerify(null)
      setNotes('')
      fetch()
    } catch (e) { 
      console.error(e) 
    } finally { 
      setSaving(false) 
    }
  }

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const columns = [
    {
      key: 'report_id',
      label: 'Report ID',
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
      key: 'ai_confidence_score',
      label: 'AI Confidence',
      render: v => v != null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 40,
            height: 4,
            background: '#e8f5e9',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${v * 100}%`,
              height: '100%',
              background: v > 0.8 ? '#22c55e' : v > 0.6 ? '#f59e0b' : '#ef4444',
              borderRadius: 2,
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
            {(v * 100).toFixed(0)}%
          </span>
        </div>
      ) : '—'
    },
    {
      key: 'detected_drugs',
      label: 'Detected',
      render: v => v?.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {v.map((d, i) => (
            <span key={i} style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              padding: '2px 8px',
              borderRadius: 40,
              fontSize: 11,
              fontWeight: 600,
            }}>
              {d}
            </span>
          ))}
        </div>
      ) : (
        <span style={{ color: '#9ca3af', fontSize: 12 }}>None</span>
      )
    },
    {
      key: 'created_at',
      label: 'Uploaded',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} color="#9ca3af" />
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {formatDateTime(v)}
          </span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      width: 120,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setDetail(row)}
            style={{
              padding: '6px 10px',
              background: 'none',
              border: '1.5px solid #e8f5e9',
              borderRadius: 8,
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
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setVerify(row)}
            style={{
              padding: '6px 10px',
              background: '#16a34a',
              border: '1.5px solid #16a34a',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#15803d';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#16a34a';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Verify Report"
          >
            <CheckCircle size={14} />
          </button>
        </div>
      )
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div style={{ 
      maxWidth: 1200, 
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
        .pending-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 24px;
          padding: 24px;
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
          <Clock size={14} />
          PENDING REVIEWS
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Reports Awaiting Review
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>
          Review and verify AI-detected substances in medical reports
        </p>
      </div>

      {/* Stats Cards */}
      {reports.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}>
          {[
            { label: 'Total Pending', value: stats.total, icon: FileText, color: '#16a34a' },
            { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: '#ef4444' },
            { label: 'High Risk', value: stats.high, icon: AlertTriangle, color: '#f97316' },
            { label: 'Medium Risk', value: stats.medium, icon: AlertTriangle, color: '#f59e0b' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1.5px solid #e8f5e9',
                borderRadius: 20,
                padding: '16px',
                animation: `slideIn 0.5s ease ${i * 0.1}s both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
                <p style={{ fontSize: 12, color: '#6b7280' }}>{stat.label}</p>
              </div>
              <p style={{
                fontSize: 28,
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
      )}

      {/* Empty State or Table */}
      {reports.length === 0 ? (
        <div className="pending-card" style={{ 
          padding: 64, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fff 0%, #f8faf8 100%)',
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'rgba(22,163,74,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h2 style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            marginBottom: 8,
          }}>
            All caught up!
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
            No pending reports to review at this moment.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#f0fdf4',
            borderRadius: 40,
            color: '#16a34a',
            fontSize: 13,
            fontWeight: 600,
          }}>
            <Clock size={14} />
            Check back later
          </div>
        </div>
      ) : (
        <div className="pending-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="#16a34a" />
              <span style={{
                fontSize: 14,
                color: '#374151',
                fontWeight: 500,
              }}>
                Reports requiring verification
              </span>
            </div>
            <span style={{
              padding: '6px 14px',
              background: '#f0fdf4',
              borderRadius: 40,
              fontSize: 13,
              color: '#16a34a',
              fontWeight: 600,
            }}>
              {reports.length} pending
            </span>
          </div>
          <Table columns={columns} data={reports} loading={loading} />
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Report Details" size="lg">
        {detail && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
              padding: 20,
              background: '#f8faf8',
              border: '1.5px solid #e8f5e9',
              borderRadius: 20,
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: detail.risk_level === 'critical' ? 'rgba(239,68,68,0.1)' :
                          detail.risk_level === 'high' ? 'rgba(249,115,22,0.1)' :
                          detail.risk_level === 'medium' ? 'rgba(245,158,11,0.1)' :
                          'rgba(34,197,94,0.1)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertTriangle size={24} color={getRiskColor(detail.risk_level)} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                  Report {detail.report_id}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  Risk Level: <span style={{ color: getRiskColor(detail.risk_level), textTransform: 'uppercase' }}>
                    {detail.risk_level}
                  </span>
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
                ['AI Confidence', detail.ai_confidence_score != null ? `${(detail.ai_confidence_score * 100).toFixed(0)}%` : '—'],
                ['Uploaded', formatDateTime(detail.created_at)],
                ['File Name', detail.file_name || '—'],
                ['Report Type', detail.report_type || 'Medical Report'],
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
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>

            {/* Detected Substances */}
            {detail.detected_drugs?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Detected Substances
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {detail.detected_drugs.map((d, i) => (
                    <span key={i} style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      padding: '8px 16px',
                      borderRadius: 40,
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => { setDetail(null); setVerify(detail) }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#15803d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <CheckCircle size={16} />
                Verify Report
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal isOpen={!!verify} onClose={() => { setVerify(null); setNotes('') }} title="Verify Report" size="sm">
        <div style={{ padding: '8px 0' }}>
          {/* Report Summary */}
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FileText size={16} color="#16a34a" />
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#111827' }}>
                {verify?.report_id}
              </span>
            </div>
            {verify?.detected_drugs?.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Detected Substances:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {verify.detected_drugs.map((d, i) => (
                    <span key={i} style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      padding: '4px 10px',
                      borderRadius: 40,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Doctor Notes
            </label>
            <textarea
              rows={4}
              placeholder="Add your professional notes about this report..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e8f5e9',
                borderRadius: 14,
                fontSize: 14,
                color: '#111827',
                background: '#fff',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleVerify('approve')}
              disabled={saving}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                background: saving ? '#9ca3af' : '#16a34a',
                border: 'none',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!saving) {
                  e.currentTarget.style.background = '#15803d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
                }
              }}
              onMouseLeave={e => {
                if (!saving) {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <CheckCircle size={16} />
              Approve
            </button>
            <button
              onClick={() => handleVerify('reject')}
              disabled={saving}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                background: saving ? '#9ca3af' : '#ef4444',
                border: 'none',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!saving) {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.2)';
                }
              }}
              onMouseLeave={e => {
                if (!saving) {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}