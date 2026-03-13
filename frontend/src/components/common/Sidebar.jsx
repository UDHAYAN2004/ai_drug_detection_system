import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Search, ScrollText, BarChart3, LogOut, Shield, ChevronRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { logout } from '../../api/authApi'

const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',          icon: Users,            label: 'Users' },
  { to: '/reports',        icon: FileText,         label: 'Reports' },
  { to: '/investigations', icon: Search,           label: 'Investigations' },
  { to: '/activity-logs',  icon: ScrollText,       label: 'Activity Logs' },
  { to: '/analytics',      icon: BarChart3,        label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logout: clearStore } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearStore()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 260, minHeight: '100vh', flexShrink: 0,
      background: '#0d1f0d', // Dark green from Home page footer/bands
      borderRight: '1px solid rgba(22,163,74,0.15)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Outfit", system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        
        .nav-link-sidebar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.22s ease;
          color: rgba(255,255,255,0.65);
          border: 1px solid transparent;
          margin-bottom: 2px;
        }
        
        .nav-link-sidebar:hover {
          background: rgba(22,163,74,0.15);
          color: #fff;
          transform: translateX(4px);
        }
        
        .nav-link-sidebar.active {
          background: rgba(22,163,74,0.20);
          color: #4ade80;
          border: 1px solid rgba(22,163,74,0.30);
          box-shadow: 0 4px 12px rgba(22,163,74,0.15);
        }
        
        .nav-link-sidebar.active .chevron {
          opacity: 0.8;
        }
        
        .user-initials {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          font-family: '"Playfair Display", serif';
          box-shadow: 0 4px 12px rgba(22,163,74,0.25);
          flex-shrink: 0;
        }
        
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 500;
          font-family: '"Outfit", sans-serif';
          cursor: pointer;
          transition: all 0.22s ease;
          margin-top: 4px;
        }
        
        .logout-btn:hover {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          transform: translateX(4px);
        }
      `}</style>

      {/* Logo Section - Enhanced from Home page style */}
      <div style={{ 
        padding: '28px 20px 20px',
        borderBottom: '1px solid rgba(22,163,74,0.15)',
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, 
            background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(22,163,74,0.35)',
            animation: 'drift 6s ease-in-out infinite',
          }}>
            <Shield size={20} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <p style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: '#fff', 
              fontFamily: '"Playfair Display", serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}>
              DrugShield
            </p>
            <p style={{ 
              fontSize: 10.5, 
              color: 'rgba(74,222,128,0.7)', 
              fontWeight: 500,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginTop: 2
            }}>
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1, 
        padding: '16px 12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2 
      }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link-sidebar ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={14} className="chevron" style={{ opacity: 0.3, transition: 'opacity 0.2s' }} />
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div style={{ 
        padding: '16px 12px 24px', 
        borderTop: '1px solid rgba(22,163,74,0.15)',
        marginTop: 'auto'
      }}>
        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 14,
          background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.15)',
          marginBottom: 8,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="user-initials">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#fff',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name || 'Admin User'}
            </p>
            <p style={{ 
              fontSize: 11, 
              color: 'rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.email || 'admin@drugshield.com'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Sign out
        </button>
      </div>

      {/* Decorative gradient line - subtle Home page touch */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, transparent, #16a34a, #4ade80, #16a34a, transparent)',
        opacity: 0.3,
        width: '100%'
      }} />
    </aside>
  )
}