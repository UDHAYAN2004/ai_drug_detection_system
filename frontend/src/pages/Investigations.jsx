import { useEffect, useState } from 'react'
import { Eye, AlertTriangle, Clock, UserCheck, Shield, FileText, Filter,X,XCircle  } from 'lucide-react'
import { getAllInvestigations, updateInvestigationStatus } from '../api/investigationApi'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/UI'
import { formatDateTime, getRiskBadgeClass, getStatusBadgeClass, capitalize } from '../utils/helpers'

const STATUSES = ['', 'pending', 'under_review', 'confirmed', 'dismissed', 'banned']

export default function Investigations() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    dismissed: 0
  })

  const fetch = async () => {
    setLoading(true)
    try { 
      const { data } = await getAllInvestigations(filter || undefined)
      const casesData = data?.investigations || data || []
      setCases(casesData)
      
      // Calculate stats
      const total = casesData.length
      const pending = casesData.filter(c => c.status === 'pending' || c.status === 'under_review').length
      const confirmed = casesData.filter(c => c.status === 'confirmed').length
      const dismissed = casesData.filter(c => c.status === 'dismissed').length
      setStats({ total, pending, confirmed, dismissed })
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetch() }, [filter])

  const handleUpdate = async () => {
    if (!newStatus) return
    setSaving(true)
    try { 
      await updateInvestigationStatus(statusModal.case_id || statusModal.id, newStatus, notes)
      setStatusModal(null)
      setNotes('')
      setNewStatus('')
      fetch()
    } catch (e) { 
      console.error(e) 
    } finally { 
      setSaving(false) 
    }
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
      key: 'athlete_name',
      label: 'Athlete',
      render: v => <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{v || '—'}</span>
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
          background: v === 'confirmed' ? 'rgba(34,197,94,0.1)' :
                     v === 'dismissed' ? 'rgba(107,114,128,0.1)' :
                     v === 'banned' ? 'rgba(239,68,68,0.1)' :
                     'rgba(245,158,11,0.1)',
          color: v === 'confirmed' ? '#22c55e' :
                 v === 'dismissed' ? '#6b7280' :
                 v === 'banned' ? '#ef4444' :
                 '#f59e0b',
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
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => { setStatusModal(row); setNewStatus(row.status) }}
            style={{
              padding: '6px 12px',
              background: '#16a34a',
              border: '1.5px solid #16a34a',
              borderRadius: 8,
              fontSize: 12,
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
            Update
          </button>
        </div>
      )
    },
  ]

  if (loading && !cases.length) return <PageLoader />

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
        .filter-btn {
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
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
          INVESTIGATIONS
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>Case Management</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Manage and track doping investigation cases</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { icon: FileText, label: 'Total Cases', value: stats.total, color: '#16a34a' },
          { icon: Clock, label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { icon: UserCheck, label: 'Confirmed', value: stats.confirmed, color: '#22c55e' },
          { icon: XCircle, label: 'Dismissed', value: stats.dismissed, color: '#6b7280' },
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

      {/* Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 24,
        padding: 16,
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 60,
      }}>
        <Filter size={16} color="#9ca3af" style={{ marginLeft: 8 }} />
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px',
              borderRadius: 40,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: filter === s ? '#16a34a' : 'transparent',
              border: filter === s ? '1.5px solid #16a34a' : '1.5px solid #e8f5e9',
              color: filter === s ? '#fff' : '#6b7280',
            }}
          >
            {s === '' ? 'All' : capitalize(s.replace('_', ' '))}
          </button>
        ))}
        <span style={{
          marginLeft: 'auto',
          padding: '6px 12px',
          background: '#f8faf8',
          borderRadius: 40,
          fontSize: 13,
          color: '#6b7280',
        }}>
          {cases.length} cases
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
      }}>
        <Table columns={columns} data={cases} loading={loading} />
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Investigation Details" size="lg">
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
              <AlertTriangle size={24} color={detail.risk_level === 'critical' ? '#ef4444' : '#f59e0b'} />
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Case {detail.case_id}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  {detail.athlete_name || 'Anonymous'} • {detail.detected_drug || 'Investigation'}
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
                ['Status', detail.status?.replace('_', ' ')],
                ['Risk Level', detail.risk_level?.toUpperCase()],
                ['Opened', formatDateTime(detail.created_at)],
                ['Last Updated', formatDateTime(detail.updated_at)],
                ['Assigned To', detail.assigned_to || 'Unassigned'],
                ['Priority', detail.priority || 'Normal'],
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

            {/* Timeline */}
            {detail.timeline?.length > 0 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Timeline
                </p>
                <div style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  padding: '4px 8px',
                  background: '#f8faf8',
                  border: '1.5px solid #e8f5e9',
                  borderRadius: 16,
                }}>
                  {detail.timeline.map((t, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: 16,
                      padding: '12px 16px',
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

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => { setStatusModal(null); setNotes(''); setNewStatus('') }} title="Update Case Status" size="sm">
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e8f5e9',
                borderRadius: 14,
                fontSize: 14,
                color: '#111827',
                background: '#fff',
                outline: 'none',
              }}
            >
              {STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Notes
            </label>
            <textarea
              rows={4}
              placeholder="Add notes about this update..."
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
              onClick={() => setStatusModal(null)}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: '1.5px solid #e8f5e9',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || !newStatus}
              style={{
                flex: 1,
                padding: '12px',
                background: saving || !newStatus ? '#9ca3af' : '#16a34a',
                border: 'none',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: saving || !newStatus ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}