import { Loader2 } from 'lucide-react'

export const Loader = ({ size = 'md', className = '' }) => {
  const sz = { 
    sm: 20, 
    md: 40, 
    lg: 60 
  }[size]
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: sz,
        height: sz,
        border: `3px solid #e8f5e9`,
        borderTop: `3px solid #16a34a`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  )
}

export const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 400,
    background: '#fff',
    borderRadius: 24,
    border: '1.5px solid #e8f5e9',
    margin: 24,
  }}>
    <div style={{ textAlign: 'center' }}>
      <Loader size="lg" />
      <p style={{ 
        fontSize: 15, 
        color: '#6b7280', 
        marginTop: 16,
        fontFamily: '"Outfit", sans-serif',
      }}>
        Loading...
      </p>
    </div>
  </div>
)

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '64px 24px',
    background: '#fff',
    borderRadius: 24,
    border: '1.5px dashed #e8f5e9',
    margin: '24px 0',
  }}>
    {Icon && (
      <div style={{
        width: 80,
        height: 80,
        background: '#f0fdf4',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <Icon size={40} color="#16a34a" strokeWidth={1.5} />
      </div>
    )}
    <h3 style={{
      fontSize: 18,
      fontWeight: 600,
      color: '#0d1f0d',
      fontFamily: '"Playfair Display", serif',
      marginBottom: 8,
    }}>
      {title}
    </h3>
    {description && (
      <p style={{
        fontSize: 14,
        color: '#6b7280',
        maxWidth: 400,
        margin: '0 auto',
      }}>
        {description}
      </p>
    )}
  </div>
)

export const StatCard = ({ label, value, icon: Icon, color = 'primary', delay = 0 }) => {
  const colors = {
    primary: { 
      bg: 'rgba(22,163,74,0.1)', 
      color: '#16a34a', 
      border: 'rgba(22,163,74,0.2)',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
    },
    danger: { 
      bg: 'rgba(239,68,68,0.1)', 
      color: '#ef4444', 
      border: 'rgba(239,68,68,0.2)',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    success: { 
      bg: 'rgba(34,197,94,0.1)', 
      color: '#22c55e', 
      border: 'rgba(34,197,94,0.2)',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    },
    warning: { 
      bg: 'rgba(245,158,11,0.1)', 
      color: '#f59e0b', 
      border: 'rgba(245,158,11,0.2)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    info: { 
      bg: 'rgba(16,185,129,0.1)', 
      color: '#10b981', 
      border: 'rgba(16,185,129,0.2)',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
  }
  
  const c = colors[color] || colors.primary

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 20,
        padding: 24,
        transition: 'all 0.3s ease',
        animation: `slideIn 0.5s ease ${delay}ms both`,
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
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: 13, 
            color: '#6b7280',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {label}
          </p>
          <p style={{ 
            fontSize: 32, 
            fontWeight: 600, 
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            lineHeight: 1.2,
          }}>
            {value ?? '—'}
          </p>
        </div>
        
        {Icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: c.bg,
            border: `1.5px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.color,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = c.gradient;
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = c.bg;
            e.currentTarget.style.color = c.color;
            e.currentTarget.style.transform = 'scale(1) rotate(0)';
          }}>
            <Icon size={22} strokeWidth={1.8} />
          </div>
        )}
      </div>
      
      {/* Optional mini trend indicator */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: c.color,
        }} />
        <p style={{
          fontSize: 11,
          color: '#9ca3af',
        }}>
          Updated just now
        </p>
      </div>
    </div>
  )
}