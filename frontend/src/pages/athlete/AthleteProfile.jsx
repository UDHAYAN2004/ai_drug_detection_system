import { useEffect, useState } from 'react'
import { Save, User, Calendar, Flag, Users, Award, MapPin, Edit2 } from 'lucide-react'
import axiosInstance from '../../api/axios'
import { PageLoader } from '../../components/common/UI'

export default function AthleteProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    axiosInstance.get('/athletes/profile').then(({ data }) => {
      setProfile(data)
      setForm({
        sport: data.athlete?.sport || '',
        nationality: data.athlete?.nationality || '',
        team: data.athlete?.team || '',
        bio: data.athlete?.bio || '',
        date_of_birth: data.athlete?.date_of_birth || '',
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axiosInstance.put('/athletes/profile', form)
      setSuccess(true)
      setEditMode(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', animation: 'fadeUp 0.6s ease' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .profile-stat-card {
          background: #fff;
          border: 1.5px solid #e8f5e9;
          border-radius: 18px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .profile-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(22,163,74,0.3);
          box-shadow: 0 12px 28px rgba(22,163,74,0.1);
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e8f5e9;
          border-radius: 14px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          background: #fff;
          transition: all 0.2s ease;
          color: #111827;
        }
        .input-field:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.1);
        }
        .input-field:hover {
          border-color: #16a34a;
        }
        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          ATHLETE PROFILE
        </span>
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>My Profile</h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Manage your personal information and athlete details</p>
      </div>

      {/* User Info Card */}
      <div className="profile-stat-card" style={{ marginBottom: 24, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(22,163,74,0.25)',
          }}>
            <span style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
            }}>
              {profile?.user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0d1f0d', fontFamily: '"Playfair Display", serif' }}>
                {profile?.user?.name}
              </h2>
              <span style={{
                padding: '4px 12px',
                background: 'rgba(22,163,74,0.1)',
                border: '1px solid rgba(22,163,74,0.2)',
                borderRadius: 40,
                fontSize: 12,
                fontWeight: 600,
                color: '#16a34a',
              }}>
                {profile?.user?.role}
              </span>
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 4 }}>{profile?.user?.email}</p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: profile?.user?.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${profile?.user?.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: 40,
              fontSize: 11,
              fontWeight: 600,
              color: profile?.user?.status === 'active' ? '#22c55e' : '#f59e0b',
            }}>
              {profile?.user?.status?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: editMode ? '#f3f4f6' : '#16a34a',
              border: '1.5px solid',
              borderColor: editMode ? '#e5e7eb' : '#16a34a',
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 600,
              color: editMode ? '#374151' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!editMode) {
                e.currentTarget.style.background = '#15803d';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.25)';
              }
            }}
            onMouseLeave={e => {
              if (!editMode) {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <Edit2 size={14} />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Athlete Profile Form */}
      <div className="profile-stat-card" style={{ padding: 28 }}>
        <form onSubmit={handleSave}>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 28,
          }}>
            {[
              { icon: Award, label: 'Sport', value: form.sport || 'Not set' },
              { icon: Flag, label: 'Nationality', value: form.nationality || 'Not set' },
              { icon: Users, label: 'Team', value: form.team || 'Not set' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: '#f8faf8',
                border: '1.5px solid #e8f5e9',
                borderRadius: 16,
                padding: 16,
                textAlign: 'center',
              }}>
                <stat.icon size={20} color="#16a34a" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0d1f0d' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {editMode ? (
            /* Edit Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}>
                <div>
                  <label>Sport</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Football, Swimming"
                    value={form.sport}
                    onChange={e => setForm({ ...form, sport: e.target.value })}
                  />
                </div>
                <div>
                  <label>Nationality</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. India, USA"
                    value={form.nationality}
                    onChange={e => setForm({ ...form, nationality: e.target.value })}
                  />
                </div>
                <div>
                  <label>Team</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Team India"
                    value={form.team}
                    onChange={e => setForm({ ...form, team: e.target.value })}
                  />
                </div>
                <div>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.date_of_birth}
                    onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label>Bio</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 28px',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: 40,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 8px 20px rgba(22,163,74,0.2)',
                  }}
                  onMouseEnter={e => {
                    if (!saving) {
                      e.currentTarget.style.background = '#15803d';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(22,163,74,0.3)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!saving) {
                      e.currentTarget.style.background = '#16a34a';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.2)';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile
                    </>
                  )}
                </button>
                {success && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#16a34a',
                    fontSize: 14,
                    fontWeight: 500,
                    animation: 'fadeUp 0.3s ease',
                  }}>
                    <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: '50%' }} />
                    Profile updated successfully!
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* View Mode */
            <div>
              {form.bio && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ marginBottom: 8 }}>Bio</label>
                  <p style={{
                    fontSize: 15,
                    color: '#374151',
                    lineHeight: 1.7,
                    background: '#f8faf8',
                    padding: 16,
                    borderRadius: 16,
                    border: '1.5px solid #e8f5e9',
                  }}>
                    {form.bio}
                  </p>
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}>
                {form.date_of_birth && (
                  <div style={{
                    background: '#f8faf8',
                    padding: 12,
                    borderRadius: 12,
                    border: '1.5px solid #e8f5e9',
                  }}>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>DATE OF BIRTH</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                      {new Date(form.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 16,
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
      }}>
        Your profile information is used for verification and case management purposes only.
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}