import { Bell, Search, Shield } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

const TITLES = {
  '/admin/dashboard':       'Dashboard',
  '/admin/users':           'User Management',
  '/admin/reports':         'Reports',
  '/admin/investigations':  'Investigations',
  '/admin/activity-logs':   'Activity Logs',
  '/admin/analytics':       'Analytics',
  '/doctor/dashboard':      'Dashboard',
  '/doctor/pending-reviews':'Pending Reviews',
  '/doctor/investigations': 'Investigations',
  '/doctor/analytics':      'Analytics',
  '/athlete/dashboard':     'Dashboard',
  '/athlete/upload':        'Upload Report',
  '/athlete/reports':       'My Reports',
  '/athlete/cases':         'My Cases',
  '/athlete/profile':       'My Profile',
  '/chatbot':               'AI Assistant',
  '/account':               'Account',
  // legacy
  '/dashboard':             'Dashboard',
  '/users':                 'Users',
  '/reports':               'Reports',
  '/investigations':        'Investigations',
  '/activity-logs':         'Activity Logs',
  '/analytics':             'Analytics',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Determine portal color based on path
  const getPortalColor = () => {
    if (pathname.includes('/admin')) return '#16a34a'
    if (pathname.includes('/doctor')) return '#10b981'
    if (pathname.includes('/athlete')) return '#16a34a'
    return '#16a34a'
  }

  const portalColor = getPortalColor()

  return (
    <header style={{ 
      height: 72, 
      borderBottom: '1.5px solid #e8f5e9', 
      background: '#fff',
      backdropFilter: 'blur(12px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 28px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    }}>
      {/* Left side - Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Shield size={20} color={portalColor} />
        <h1 style={{ 
          fontSize: 20, 
          fontWeight: 600, 
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
        }}>
          {TITLES[pathname] || 'DrugShield'}
        </h1>
      </div>

      {/* Right side - Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: searchFocused ? '#fff' : '#f8faf8',
          border: `1.5px solid ${searchFocused ? portalColor : '#e8f5e9'}`,
          borderRadius: 40,
          transition: 'all 0.2s',
          width: 240,
        }}>
          <Search size={16} color={searchFocused ? portalColor : '#9ca3af'} />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              color: '#111827',
              width: '100%',
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: '#f8faf8',
          border: '1.5px solid #e8f5e9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          color: '#6b7280',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = portalColor;
          e.currentTarget.style.borderColor = portalColor;
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#f8faf8';
          e.currentTarget.style.borderColor = '#e8f5e9';
          e.currentTarget.style.color = '#6b7280';
        }}>
          <Bell size={16} />
          <span style={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            width: 8, 
            height: 8, 
            background: portalColor, 
            borderRadius: '50%',
            border: '2px solid #fff',
          }} />
        </button>
      </div>
    </header>
  )
}