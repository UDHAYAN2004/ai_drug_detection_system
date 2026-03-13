import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, FileText, AlertTriangle, Clock, TrendingUp, Calendar } from 'lucide-react'
import { getAllReports, verifyReport } from '../api/reportApi'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/UI'
import { formatDateTime, getRiskBadgeClass, getStatusBadgeClass, capitalize } from '../utils/helpers'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [verify, setVerify] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    detected: 0
  })

  const fetch = async () => {
    try { 
      const { data } = await getAllReports()
      const reportsData = data?.reports || data || []
      setReports(reportsData)
      
      // Calculate stats
      const total = reportsData.length
      const verified = reportsData.filter(r => r.doctor_verified).length
      const pending = reportsData.filter(r => !r.doctor_verified).length
      const detected = reportsData.filter(r => r.detection_status === 'detected').length
      setStats({ total, verified, pending, detected })
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetch() }, [])

  const handleVerify = async (approved) => {
    setSaving(true)
    try {
      await verifyReport(verify.report_id || verify.id, { approved, doctor_notes: notes })
      setVerify(null)
      setNotes('')
      fetch()
    } catch (e) { 
      console.error(e) 
    } finally { 
      setSaving(false) 
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
      key: 'athlete_name',
      label: 'Athlete',
      render: v => <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{v || '—'}</span>
    },
    {
      key: 'detection_status',
      label: 'Status',
      render: v => (
        <span style={{
          background: v === 'clean' ? 'rgba(34,197,94,0.1)' :
                     v === 'detected' ? 'rgba(239,68,68,0.1)' :
                     'rgba(245,158,11,0.1)',
          color: v === 'clean' ? '#22c55e' :
                 v === 'detected' ? '#ef4444' :
                 '#f59e0b',
          padding: '4px 10px',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {v || 'pending'}
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
      label: 'Confidence',
      render: v => v != null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={12} color="#16a34a" />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
            {(v * 100).toFixed(0)}%
          </span>
        </div>
      ) : '—'
    },
    {
      key: 'doctor_verified',
      label: 'Verified',
      render: v => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: v ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
          color: v ? '#22c55e' : '#f59e0b',
          padding: '4px 10px',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {v ? <CheckCircle size={12} /> : <Clock size={12} />}
          {v ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Uploaded',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} color="#9ca3af" />
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {formatDateTime(v)}
          </span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      width: 100,
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
          >
            <Eye size={14} />
          </button>
          {!row.doctor_verified && (
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
            >
              <CheckCircle size={14} />
            </button>
          )}
        </div>
      )
    },
  ]

  if (loading) return <PageLoader />

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
          <FileText size={14} />
          REPORTS MANAGEMENT
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>Medical Reports</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Review and verify athlete medical reports</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { icon: FileText, label: 'Total Reports', value: stats.total, color: '#16a34a' },
          { icon: CheckCircle, label: 'Verified', value: stats.verified, color: '#22c55e' },
          { icon: Clock, label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { icon: AlertTriangle, label: 'Detected', value: stats.detected, color: '#ef4444' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1.5px solid #e8f5e9',
              borderRadius: 20,
              padding: 20,
              transition: 'all 0.3s ease',
              animation: `slideIn 0.5s ease ${i * 0.1}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(22,163,74,0.3)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(22,163,74,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e8f5e9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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

      {/* Table */}
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
            All Reports
          </h3>
          <span style={{
            padding: '6px 12px',
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 40,
            fontSize: 13,
            color: '#6b7280',
          }}>
            {reports.length} total
          </span>
        </div>
        <Table columns={columns} data={reports} loading={loading} />
      </div>

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
                background: detail.detection_status === 'clean' ? 'rgba(34,197,94,0.1)' :
                          detail.detection_status === 'detected' ? 'rgba(239,68,68,0.1)' :
                          'rgba(245,158,11,0.1)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {detail.detection_status === 'clean' ? (
                  <CheckCircle size={24} color="#22c55e" />
                ) : detail.detection_status === 'detected' ? (
                  <AlertTriangle size={24} color="#ef4444" />
                ) : (
                  <Clock size={24} color="#f59e0b" />
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Report {detail.report_id}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  {detail.athlete_name || 'Anonymous'} • {detail.file_name || 'Medical Report'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              {[
                ['Status', detail.detection_status],
                ['Risk Level', detail.risk_level?.toUpperCase()],
                ['AI Confidence', detail.ai_confidence_score != null ? `${(detail.ai_confidence_score * 100).toFixed(0)}%` : '—'],
                ['OCR Confidence', detail.ocr_confidence != null ? `${(detail.ocr_confidence * 100).toFixed(0)}%` : '—'],
                ['Verified', detail.doctor_verified ? 'Yes' : 'No'],
                ['Uploaded', formatDateTime(detail.created_at)],
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
                    {val || '—'}
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

            {/* Extracted Text */}
            {detail.extracted_text && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Extracted Text (OCR)
                </p>
                <div style={{
                  background: '#f8faf8',
                  border: '1.5px solid #e8f5e9',
                  borderRadius: 16,
                  padding: 16,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}>
                  <pre style={{
                    fontSize: 12,
                    color: '#4b5563',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}>
                    {detail.extracted_text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal isOpen={!!verify} onClose={() => { setVerify(null); setNotes('') }} title="Verify Report" size="sm">
        <div style={{ padding: '8px 0' }}>
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 16,
          }}>
            <p style={{ fontSize: 14, color: '#4b5563' }}>
              Review the AI detection results for report{' '}
              <span style={{ fontFamily: 'monospace', color: '#16a34a', fontWeight: 600 }}>
                {verify?.report_id}
              </span>
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
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
              placeholder="Add your professional notes..."
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

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleVerify(true)}
              disabled={saving}
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
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
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
              onClick={() => handleVerify(false)}
              disabled={saving}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                background: '#ef4444',
                border: 'none',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
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