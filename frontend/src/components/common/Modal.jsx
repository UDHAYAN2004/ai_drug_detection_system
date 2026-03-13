import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const widths = { sm: 420, md: 520, lg: 680, xl: 860 }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 50, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 16,
      animation: 'fadeIn 0.2s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-content {
          animation: slideUp 0.3s ease;
        }
      `}</style>
      
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(13,31,13,0.7)', 
          backdropFilter: 'blur(4px)' 
        }} 
      />
      
      {/* Modal Card */}
      <div 
        className="modal-content"
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: widths[size], 
          background: '#fff',
          border: '1.5px solid #e8f5e9',
          borderRadius: 28,
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '20px 24px',
          borderBottom: '1.5px solid #e8f5e9',
          background: '#f8faf8',
        }}>
          <h2 style={{ 
            fontSize: 18, 
            fontWeight: 600, 
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
          }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'transparent',
              border: '1.5px solid #e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#e8f5e9';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}