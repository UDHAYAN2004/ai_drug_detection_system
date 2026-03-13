import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, Search, MessageCircle, User, LogOut, Shield, ChevronRight, Activity } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { logout } from '../../api/authApi'
import Navbar from './Navbar'

const NAV = [
  { to: '/athlete/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/athlete/upload',    icon: Upload,          label: 'Upload Report' },
  { to: '/athlete/reports',   icon: FileText,        label: 'My Reports' },
  { to: '/athlete/cases',     icon: Search,          label: 'My Cases' },
  { to: '/chatbot',           icon: MessageCircle,   label: 'AI Chatbot' },
  { to: '/account',           icon: User,            label: 'Account' },
]

export default function AthleteLayout() {
  const { user, logout: clearStore } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = async () => { 
    try { await logout() } catch {} 
    clearStore(); 
    navigate('/login') 
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden', 
      background: '#f8faf8', // Light green-white from Home page features section
      fontFamily: '"Outfit", system-ui, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        
        @keyframes drift {
          0%,100%{transform:translate(0,0) rotate(0deg);}
          33%{transform:translate(4px,-6px) rotate(1deg);}
          66%{transform:translate(-3px,4px) rotate(-1deg);}
        }
        
        @keyframes pulseDot {
          0%,100%{transform:scale(1);opacity:1;}
          50%{transform:scale(1.5);opacity:0.5;}
        }
        
        .nav-link-athlete {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          color: #4b5563;
          border: 1.5px solid transparent;
          margin-bottom: 4px;
          position: relative;
          overflow: hidden;
        }
        
        .nav-link-athlete::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(22,163,74,0.08), transparent 80%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        
        .nav-link-athlete:hover {
          background: #fff;
          border-color: #e8f5e9;
          transform: translateX(6px);
          box-shadow: 0 6px 16px rgba(22,163,74,0.08);
          color: #16a34a;
        }
        
        .nav-link-athlete:hover::before {
          opacity: 1;
        }
        
        .nav-link-athlete.active {
          background: #fff;
          border-color: rgba(22,163,74,0.30);
          color: #16a34a;
          box-shadow: 0 8px 20px rgba(22,163,74,0.12);
        }
        
        .nav-link-athlete.active .chevron {
          opacity: 0.8;
          color: #16a34a;
        }
        
        .athlete-initials {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          font-family: '"Playfair Display", serif';
          box-shadow: 0 4px 12px rgba(22,163,74,0.25);
          flex-shrink: 0;
        }
        
        .logout-btn-athlete {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 14px;
          border: 1.5px solid transparent;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          font-family: '"Outfit", sans-serif';
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 8px;
        }
        
        .logout-btn-athlete:hover {
          background: #fff;
          border-color: #fee2e2;
          color: #ef4444;
          transform: translateX(6px);
          box-shadow: 0 6px 16px rgba(239,68,68,0.08);
        }
        
        .badge-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          display: inline-block;
          animation: pulseDot 2s ease-in-out infinite;
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{ 
        width: 280, 
        minHeight: '100vh', 
        flexShrink: 0, 
        background: '#fff',
        borderRight: '1.5px solid #e8f5e9',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        position: 'relative',
        overflowY: 'auto'
      }}>
        {/* Decorative green dot pattern - subtle Home page touch */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          pointerEvents: 'none',
          opacity: 0.2,
          height: '100%',
          backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Logo Section - Enhanced from Home page */}
        <div style={{ 
          padding: '32px 24px 24px',
          borderBottom: '1.5px solid #e8f5e9',
          position: 'relative',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, 
              background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(22,163,74,0.3)',
              animation: 'drift 6s ease-in-out infinite',
            }}>
              <Shield size={22} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ 
                fontSize: 22, 
                fontWeight: 600, 
                color: '#0d1f0d', 
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '-0.01em',
                lineHeight: 1.2
              }}>
                DrugShield
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span className="badge-pulse" />
                <p style={{ 
                  fontSize: 11, 
                  color: '#16a34a', 
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}>
                  Athlete Portal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          position: 'relative',
        }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className="nav-link-athlete"
            >
              <Icon size={18} strokeWidth={1.8} />
              <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
              <ChevronRight 
                size={14} 
                className="chevron" 
                style={{ 
                  opacity: 0.3, 
                  transition: 'all 0.2s',
                  color: 'currentColor'
                }} 
              />
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ 
          padding: '20px 16px 28px', 
          borderTop: '1.5px solid #e8f5e9',
          background: 'linear-gradient(180deg, transparent, #f0fdf4 50%)',
          position: 'relative',
        }}>
          {/* User Card - Enhanced from Home page testimonial style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px',
            borderRadius: 18,
            background: '#fff',
            border: '1.5px solid #e8f5e9',
            boxShadow: '0 8px 20px rgba(22,163,74,0.06)',
            marginBottom: 12,
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(22,163,74,0.3)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(22,163,74,0.12)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e8f5e9';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.06)';
          }}>
            <div className="athlete-initials">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ 
                fontSize: 15, 
                fontWeight: 600, 
                color: '#111827',
                marginBottom: 4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Athlete User'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={12} color="#9ca3af" />
                <p style={{ 
                  fontSize: 11.5, 
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.email || 'athlete@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button - Styled like Home page button */}
          <button
            onClick={handleLogout}
            className="logout-btn-athlete"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign out
          </button>
        </div>

        {/* Decorative floating elements - Home page touch */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 10,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      </aside>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        overflow: 'hidden',
        background: '#f8faf8',
      }}>
        <Navbar />
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: 28,
          position: 'relative',
        }}>
          {/* Subtle background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
            backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}