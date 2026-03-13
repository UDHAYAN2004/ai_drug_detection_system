import { useEffect, useState } from 'react'
import { LogOut, User, Shield, Mail, Calendar, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axios'
import { logout } from '../api/authApi'
import useAuthStore from '../store/authStore'
import { PageLoader } from '../components/common/UI'
import { formatDateTime } from '../utils/helpers'

export default function Account() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState([])
  const { logout: clearStore } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/auth/me'),
      axiosInstance.get('/auth/recent-activity').catch(() => ({ data: [] }))
    ]).then(([userRes, activityRes]) => {
      setMe(userRes.data)
      setActivity(activityRes.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearStore()
    navigate('/login')
  }

  if (loading) return <PageLoader />

  const roleColor = {
    admin: '#16a34a',
    doctor: '#16a34a',
    athlete: '#16a34a'
  }[me?.role] || '#16a34a'

  const roleIcon = {
    admin: Shield,
    doctor: Award,
    athlete: User
  }[me?.role] || User

  const RoleIcon = roleIcon

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  return (
    <div style={{ 
      maxWidth: 560, 
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
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .account-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 28px;
          padding: 28px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.02);
        }
        .account-card:hover {
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 16px 32px rgba(22,163,74,0.08);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1.5px solid #e8f5e9;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1.5px solid #e8f5e9;
          animation: slideIn 0.3s ease;
        }
        .activity-item:last-child {
          border-bottom: none;
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
          <User size={14} />
          ACCOUNT SETTINGS
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>My Account</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>View and manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="account-card" style={{ marginBottom: 20, animation: 'slideIn 0.4s ease' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 24,
          flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 96,
              height: 96,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 32px rgba(22,163,74,0.25)',
              animation: 'pulse 3s ease-in-out infinite',
            }}>
              <span style={{
                fontSize: 40,
                fontWeight: 600,
                color: '#fff',
                fontFamily: '"Playfair Display", serif',
              }}>
                {getInitials(me?.name)}
              </span>
            </div>
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: me?.status === 'active' ? '#22c55e' : '#f59e0b',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }} />
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#0d1f0d',
                fontFamily: '"Playfair Display", serif',
              }}>
                {me?.name}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: `${roleColor}10`,
                border: `1px solid ${roleColor}30`,
                borderRadius: 40,
              }}>
                <RoleIcon size={12} color={roleColor} />
                <span style={{ fontSize: 11, fontWeight: 600, color: roleColor, textTransform: 'capitalize' }}>
                  {me?.role}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mail size={14} color="#9ca3af" />
              <p style={{ fontSize: 14, color: '#4b5563' }}>{me?.email}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} color="#9ca3af" />
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Member since {me?.created_at ? formatDateTime(me.created_at).split(',')[0] : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="account-card" style={{ marginBottom: 20 }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          marginBottom: 16,
        }}>
          Account Details
        </h3>

        <div>
          {[
            { icon: User, label: 'User ID', value: me?.id },
            { icon: Mail, label: 'Email Address', value: me?.email },
            { icon: Shield, label: 'Role', value: me?.role, capitalize: true },
            { icon: Clock, label: 'Status', value: me?.status, capitalize: true },
          ].map(({ icon: Icon, label, value, capitalize }) => (
            <div key={label} className="detail-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} color="#16a34a" />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {label === 'Status' && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: value === 'active' ? '#22c55e' : '#f59e0b',
                    animation: value === 'active' ? 'pulse 2s infinite' : 'none',
                  }} />
                )}
                <span style={{
                  fontSize: 13,
                  fontFamily: 'monospace',
                  color: label === 'Status' ? (value === 'active' ? '#22c55e' : '#f59e0b') : '#111827',
                  fontWeight: label === 'Status' ? 600 : 400,
                  textTransform: capitalize ? 'capitalize' : 'none',
                }}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Card */}
      {activity.length > 0 && (
        <div className="account-card" style={{ marginBottom: 20 }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            marginBottom: 16,
          }}>
            Recent Activity
          </h3>

          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {activity.map((act, i) => (
              <div key={i} className="activity-item">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: act.type === 'login' ? 'rgba(34,197,94,0.1)' :
                             act.type === 'upload' ? 'rgba(22,163,74,0.1)' :
                             'rgba(245,158,11,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {act.type === 'login' ? (
                    <LogOut size={14} color="#22c55e" style={{ transform: 'rotate(90deg)' }} />
                  ) : act.type === 'upload' ? (
                    <Shield size={14} color="#16a34a" />
                  ) : (
                    <Clock size={14} color="#f59e0b" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                    {act.description || act.action || 'Activity'}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                    {formatDateTime(act.timestamp || act.created_at)}
                  </p>
                </div>
                {act.status && (
                  <span style={{
                    padding: '2px 8px',
                    background: act.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: act.status === 'success' ? '#22c55e' : '#ef4444',
                    borderRadius: 40,
                    fontSize: 10,
                    fontWeight: 600,
                  }}>
                    {act.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Card */}
      <div className="account-card" style={{ marginBottom: 20 }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          marginBottom: 16,
        }}>
          Security
        </h3>

        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { label: 'Two-Factor Authentication', value: 'Disabled', action: 'Enable' },
            { label: 'Last Password Change', value: me?.last_password_change || '30 days ago' },
            { label: 'Active Sessions', value: '1 session' },
          ].map((item, i) => (
            <div key={i} className="detail-row">
              <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{item.value}</span>
                {item.action && (
                  <button style={{
                    padding: '4px 10px',
                    background: 'transparent',
                    border: '1.5px solid #16a34a',
                    borderRadius: 40,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#16a34a',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#16a34a';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#16a34a';
                  }}>
                    {item.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #fee2e2',
        borderRadius: 28,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <AlertCircle size={18} color="#ef4444" />
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#ef4444' }}>Danger Zone</h4>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 24px',
            background: 'transparent',
            border: '1.5px solid #ef4444',
            borderRadius: 60,
            fontSize: 15,
            fontWeight: 600,
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(239,68,68,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Footer Note */}
      <div style={{
        textAlign: 'center',
        padding: '16px',
        fontSize: 12,
        color: '#9ca3af',
        borderTop: '1.5px solid #e8f5e9',
      }}>
        <Shield size={14} style={{ display: 'inline', marginRight: 6, color: '#16a34a' }} />
        Your account information is protected and encrypted
      </div>
    </div>
  )
}