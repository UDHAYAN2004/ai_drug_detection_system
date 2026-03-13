import { useEffect, useState } from 'react'
import { Trash2, UserCheck, UserX, Users as UsersIcon, Shield, Mail, Calendar, Filter, Search, X } from 'lucide-react'
import { getAllUsers, updateUser, deleteUser } from '../api/userApi'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/UI'
import { formatDate, getStatusBadgeClass, capitalize } from '../utils/helpers'

const ROLES = ['', 'admin', 'doctor', 'athlete']

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRole] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    doctor: 0,
    athlete: 0,
    active: 0
  })

  const fetch = async () => {
    setLoading(true)
    try { 
      const { data } = await getAllUsers(roleFilter || undefined)
      const usersData = data?.users || data || []
      setUsers(usersData)
      
      // Calculate stats
      const total = usersData.length
      const admin = usersData.filter(u => u.role === 'admin').length
      const doctor = usersData.filter(u => u.role === 'doctor').length
      const athlete = usersData.filter(u => u.role === 'athlete').length
      const active = usersData.filter(u => u.status === 'active').length
      setStats({ total, admin, doctor, athlete, active })
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetch() }, [roleFilter])

  const handleStatus = async (id, status) => {
    try { 
      await updateUser(id, { status }); 
      fetch() 
    } catch (e) { 
      console.error(e) 
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { 
      await deleteUser(deleteModal.id); 
      setDeleteModal(null); 
      fetch() 
    } catch (e) { 
      console.error(e) 
    } finally { 
      setSaving(false) 
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#16a34a'
      case 'doctor': return '#16a34a'
      case 'athlete': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(22,163,74,0.2)',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
            }}>
              {v?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{v}</p>
            <p style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>ID: {row.id?.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={12} color="#9ca3af" />
          <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: v => {
        const color = getRoleColor(v)
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            background: `${color}10`,
            border: `1px solid ${color}30`,
            borderRadius: 40,
            fontSize: 11,
            fontWeight: 600,
            color: color,
            textTransform: 'capitalize',
          }}>
            <Shield size={10} />
            {v}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: v => {
        const isActive = v === 'active'
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: 40,
            fontSize: 11,
            fontWeight: 600,
            color: isActive ? '#22c55e' : '#f59e0b',
            textTransform: 'capitalize',
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isActive ? '#22c55e' : '#f59e0b',
              animation: isActive ? 'pulse 2s infinite' : 'none',
            }} />
            {v}
          </span>
        )
      }
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} color="#9ca3af" />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(v)}</span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      width: 120,
      render: (id, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => handleStatus(id, row.status === 'active' ? 'inactive' : 'active')}
            style={{
              padding: '6px 10px',
              background: row.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1.5px solid ${row.status === 'active' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: row.status === 'active' ? '#f59e0b' : '#22c55e',
            }}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
            onMouseEnter={e => {
              e.currentTarget.style.background = row.status === 'active' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = row.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {row.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            style={{
              padding: '6px 10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1.5px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: '#ef4444',
            }}
            title="Delete User"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  if (loading && !users.length) return <PageLoader />

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
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .stat-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 16px 32px rgba(22,163,74,0.08);
        }
        .filter-btn {
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid #e8f5e9;
          background: transparent;
          color: #6b7280;
        }
        .filter-btn:hover {
          border-color: #16a34a;
          color: #16a34a;
          background: #f0fdf4;
        }
        .filter-btn.active {
          background: #16a34a;
          border-color: #16a34a;
          color: #fff;
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
          <UsersIcon size={14} />
          USER MANAGEMENT
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>Users</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Manage system users, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 20,
        marginBottom: 24,
      }}>
        {[
          { icon: UsersIcon, label: 'Total Users', value: stats.total, color: '#16a34a' },
          { icon: Shield, label: 'Admins', value: stats.admin, color: '#16a34a' },
          { icon: Shield, label: 'Doctors', value: stats.doctor, color: '#16a34a' },
          { icon: UsersIcon, label: 'Athletes', value: stats.athlete, color: '#16a34a' },
          { icon: UserCheck, label: 'Active', value: stats.active, color: '#22c55e' },
        ].map((stat, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ animation: `slideIn 0.5s ease ${i * 0.1}s both` }}
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

      {/* Filters and Search */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 60,
        padding: '8px 16px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <Filter size={16} color="#9ca3af" style={{ marginLeft: 8 }} />
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`filter-btn ${roleFilter === r ? 'active' : ''}`}
            >
              {r === '' ? 'All Roles' : capitalize(r)}
            </button>
          ))}
        </div>

        <div style={{ 
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8faf8',
          borderRadius: 40,
          padding: '4px 12px',
          minWidth: 240,
        }}>
          <Search size={14} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              fontSize: 13,
              color: '#111827',
              outline: 'none',
              width: '100%',
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} color="#9ca3af" />
            </button>
          )}
        </div>

        <span style={{
          padding: '4px 12px',
          background: '#f0fdf4',
          borderRadius: 40,
          fontSize: 12,
          color: '#16a34a',
          fontWeight: 600,
        }}>
          {filteredUsers.length} users
        </span>
      </div>

      {/* Users Table */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
      }}>
        <Table columns={columns} data={filteredUsers} loading={loading} />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User" size="sm">
        <div style={{ padding: '8px 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            padding: 20,
            background: '#fef2f2',
            border: '1.5px solid #fee2e2',
            borderRadius: 20,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'rgba(239,68,68,0.1)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#b91c1c', marginBottom: 2 }}>
                Delete User
              </p>
              <p style={{ fontSize: 13, color: '#ef4444' }}>
                This action cannot be undone
              </p>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
            Are you sure you want to delete <strong style={{ color: '#111827' }}>{deleteModal?.name}</strong>?
          </p>

          <div style={{
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Email</span>
              <span style={{ fontSize: 12, color: '#111827', fontFamily: 'monospace' }}>{deleteModal?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Role</span>
              <span style={{
                fontSize: 12,
                color: '#16a34a',
                background: 'rgba(22,163,74,0.1)',
                padding: '2px 8px',
                borderRadius: 40,
                fontWeight: 600,
              }}>
                {deleteModal?.role}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Status</span>
              <span style={{
                fontSize: 12,
                color: deleteModal?.status === 'active' ? '#22c55e' : '#f59e0b',
                fontWeight: 600,
              }}>
                {deleteModal?.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setDeleteModal(null)}
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
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#e8f5e9';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                flex: 1,
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
              {saving ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}