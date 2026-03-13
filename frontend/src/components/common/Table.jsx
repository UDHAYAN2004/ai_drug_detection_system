import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Table({ columns, data, pageSize = 10, loading = false }) {
  const [page, setPage] = useState(1)
  const total = data?.length || 0
  const pages = Math.ceil(total / pageSize)
  const rows = data?.slice((page - 1) * pageSize, page * pageSize) || []

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .table-row-hover:hover {
          background: #f8faf8;
        }
      `}</style>
      
      <div style={{ overflowX: 'auto', borderRadius: 16 }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontFamily: '"Outfit", system-ui, sans-serif',
        }}>
          <thead>
            <tr style={{ 
              borderBottom: '1.5px solid #e8f5e9',
              background: '#f8faf8',
            }}>
              {columns.map((col) => (
                <th key={col.key} style={{
                  textAlign: 'left', 
                  padding: '14px 16px',
                  fontSize: 12, 
                  fontWeight: 600,
                  color: '#16a34a', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap', 
                  width: col.width
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1.5px solid #e8f5e9' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '14px 16px' }}>
                      <div style={{
                        height: 16,
                        background: 'linear-gradient(90deg, #e8f5e9 25%, #d1fae5 50%, #e8f5e9 75%)',
                        backgroundSize: '200% 100%',
                        borderRadius: 8,
                        width: '80%',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ 
                  padding: '48px 16px', 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  fontSize: 14,
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8f5e9" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>No data found</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  style={{ 
                    borderBottom: i < rows.length - 1 ? '1.5px solid #e8f5e9' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  className="table-row-hover"
                  onMouseEnter={e => e.currentTarget.style.background = '#f8faf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ 
                      padding: '14px 16px', 
                      fontSize: 13,
                      color: '#374151',
                    }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '16px 16px 0',
          marginTop: 16,
          borderTop: '1.5px solid #e8f5e9',
        }}>
          <p style={{ 
            fontSize: 12, 
            color: '#6b7280',
          }}>
            Showing {(page-1)*pageSize+1}–{Math.min(page*pageSize, total)} of {total} results
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p-1))} 
              disabled={page===1}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: '1.5px solid #e8f5e9',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                color: '#6b7280',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (page !== 1) {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.borderColor = '#16a34a';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (page !== 1) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e8f5e9';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let pageNum = i + 1
              if (pages > 5) {
                if (page > 3) {
                  pageNum = page - 3 + i
                  if (pageNum > pages - 4) pageNum = pages - 4 + i
                }
              }
              return pageNum <= pages ? (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: 10,
                    border: 'none',
                    background: page === pageNum ? '#16a34a' : 'transparent',
                    color: page === pageNum ? '#fff' : '#6b7280',
                    fontSize: 13,
                    fontWeight: page === pageNum ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (page !== pageNum) {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.color = '#16a34a';
                    }
                  }}
                  onMouseLeave={e => {
                    if (page !== pageNum) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  {pageNum}
                </button>
              ) : null
            })}

            <button
              onClick={() => setPage(p => Math.min(pages, p+1))}
              disabled={page===pages}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: '1.5px solid #e8f5e9',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                opacity: page === pages ? 0.5 : 1,
                color: '#6b7280',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (page !== pages) {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.borderColor = '#16a34a';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (page !== pages) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e8f5e9';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}