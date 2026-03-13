import { useEffect, useState } from 'react'
import { Eye, FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Calendar } from 'lucide-react'
import axiosInstance from '../../api/axios'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import { PageLoader } from '../../components/common/UI'
import { formatDateTime, getRiskBadgeClass, getStatusBadgeClass, capitalize } from '../../utils/helpers'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    clean: 0,
    detected: 0,
    pending: 0
  })

  useEffect(() => {
    axiosInstance.get('/reports/my-reports').then(({ data }) => {
      setReports(data || [])
      // Calculate stats
      const total = data?.length || 0
      const clean = data?.filter(r => r.detection_status === 'clean').length || 0
      const detected = data?.filter(r => r.detection_status === 'detected').length || 0
      const pending = data?.filter(r => r.detection_status === 'pending' || r.doctor_verified === false).length || 0
      setStats({ total, clean, detected, pending })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openDetail = async (row) => {
    try {
      const { data } = await axiosInstance.get(`/reports/${row.id}`)
      setDetail(data)
    } catch { setDetail(row) }
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
      key: 'file_name',
      label: 'File',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} color="#9ca3af" />
          <span style={{ fontSize: 13, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {v || '—'}
          </span>
        </div>
      )
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
      label: 'AI Confidence',
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
          <FileText size={14} />
          MY REPORTS
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>Medical Reports</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>View and track all your uploaded medical reports</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 32,
      }}>
        {[
          { icon: FileText, label: 'Total Reports', value: stats.total, color: '#16a34a' },
          { icon: CheckCircle, label: 'Clean', value: stats.clean, color: '#22c55e' },
          { icon: AlertTriangle, label: 'Detected', value: stats.detected, color: '#ef4444' },
          { icon: Clock, label: 'Pending', value: stats.pending, color: '#f59e0b' },
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

      {/* Reports Table */}
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
            Report History
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

      {/* Report Details Modal */}
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
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{detail.file_name}</p>
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
                ['Doctor Verified', detail.doctor_verified ? 'Yes' : 'Pending'],
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
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>
                    {val || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Detected Substances */}
            {detail.detected_drugs?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Detected Substances
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {detail.detected_drugs.map((d, i) => (
                    <span key={i} style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      padding: '6px 14px',
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

            {/* Doctor Comments */}
            {detail.doctor_comments && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Doctor Comments
                </p>
                <div style={{
                  background: '#f8faf8',
                  border: '1.5px solid #e8f5e9',
                  borderRadius: 14,
                  padding: 16,
                }}>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
                    {detail.doctor_comments}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}