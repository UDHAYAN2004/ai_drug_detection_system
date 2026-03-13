import { useEffect, useState, useCallback } from 'react'
import { Search, RefreshCw, Activity, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react'
import { getActivityLogs } from '../api/userApi'
import { formatDateTime } from '../utils/helpers'

// ─── Design tokens (mirrors Home page) ────────────────────────────────────────
const GREEN       = '#16a34a'
const GREEN_DARK  = '#15803d'
const GREEN_BG    = '#f0fdf4'
const GREEN_TINT  = 'rgba(22,163,74,0.09)'
const GREEN_BORDER= 'rgba(22,163,74,0.22)'
const FONT_DISPLAY= '"Playfair Display", Georgia, serif'
const FONT_BODY   = '"Outfit", system-ui, sans-serif'
const PAGE_SIZE   = 15

// ─── Action config ──────────────────────────────────────────────────────────────
const ACTION_META = {
  login:   { color: GREEN,        bg: 'rgba(22,163,74,0.10)',  dot: '#22c55e' },
  logout:  { color: '#6b7280',    bg: 'rgba(107,114,128,0.09)',dot: '#9ca3af' },
  create:  { color: '#0284c7',    bg: 'rgba(2,132,199,0.09)',  dot: '#38bdf8' },
  update:  { color: '#d97706',    bg: 'rgba(217,119,6,0.10)',  dot: '#fbbf24' },
  delete:  { color: '#dc2626',    bg: 'rgba(220,38,38,0.09)',  dot: '#f87171' },
  upload:  { color: '#7c3aed',    bg: 'rgba(124,58,237,0.09)', dot: '#a78bfa' },
  verify:  { color: GREEN_DARK,   bg: 'rgba(21,128,61,0.09)',  dot: '#4ade80' },
  default: { color: '#374151',    bg: 'rgba(55,65,81,0.07)',   dot: '#9ca3af' },
}

const ALL_ACTIONS = ['login','logout','create','update','delete','upload','verify']

function getMeta(action) {
  return ACTION_META[action?.toLowerCase()] ?? ACTION_META.default
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ActionBadge({ action }) {
  const { color, bg, dot } = getMeta(action)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 999,
      background: bg, border: `1px solid ${color}33`,
      fontSize: 11, fontWeight: 700, color,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: FONT_BODY, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {action ?? '—'}
    </span>
  )
}

function ResourceTag({ value }) {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 8,
      background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`,
      fontSize: 11, color: GREEN_DARK, fontWeight: 600,
      fontFamily: '"Courier New", monospace', letterSpacing: '0.03em',
    }}>
      {value}
    </span>
  )
}

function IPChip({ value }) {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
  return (
    <span style={{
      fontFamily: '"Courier New", monospace', fontSize: 12,
      color: '#6b7280', background: '#f3f4f6',
      padding: '3px 9px', borderRadius: 7, border: '1px solid #e5e7eb',
    }}>
      {value}
    </span>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '140px 120px 130px 1fr 150px',
          gap: 16, padding: '14px 24px',
          borderBottom: '1px solid #f0fdf4',
          alignItems: 'center',
          opacity: 1 - i * 0.1,
        }}>
          {[100, 80, 90, 200, 120].map((w, j) => (
            <div key={j} style={{
              height: 24, borderRadius: 8, width: w,
              background: 'linear-gradient(90deg,#e8f5e9 0%,#d1fae5 50%,#e8f5e9 100%)',
              backgroundSize: '400px 100%',
              animation: 'shimmerAnim 1.4s linear infinite',
            }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search, onClear }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 40px', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: GREEN_TINT, border: `1.5px solid ${GREEN_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Activity size={30} color={GREEN} strokeWidth={1.5} />
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', fontFamily: FONT_DISPLAY, marginBottom: 6 }}>
          No logs found
        </p>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>
          {search ? `No results for "${search}"` : 'Activity logs will appear here.'}
        </p>
      </div>
      {search && (
        <button onClick={onClear} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 10,
          background: GREEN, color: '#fff', border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: FONT_BODY,
        }}>
          <X size={13} /> Clear Search
        </button>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ActivityLogs() {
  const [logs,       setLogs]       = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [action,     setAction]     = useState('all')
  const [page,       setPage]       = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await getActivityLogs()
      const list = data?.logs || data || []
      setLogs(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => {
    let result = logs
    if (action !== 'all') {
      result = result.filter(l => l.action?.toLowerCase() === action)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.action?.toLowerCase().includes(q) ||
        l.resource_type?.toLowerCase().includes(q) ||
        l.ip_address?.includes(q) ||
        (typeof l.details === 'string' ? l.details : JSON.stringify(l.details ?? '')).toLowerCase().includes(q)
      )
    }
    setFiltered(result)
    setPage(1)
  }, [search, action, logs])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const actionCounts = ALL_ACTIONS.reduce((acc, a) => {
    acc[a] = logs.filter(l => l.action?.toLowerCase() === a).length
    return acc
  }, {})

  return (
    <div style={{ fontFamily: FONT_BODY, color: '#111827', minHeight: '100vh', background: '#fafffe' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
        @keyframes shimmerAnim{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(1.6);}}
        .log-row{transition:background 0.15s;}
        .log-row:hover{background:${GREEN_BG}!important;}
        .filter-chip{cursor:pointer;transition:all 0.18s;border:1.5px solid #e5e7eb;background:#fff;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:600;font-family:${FONT_BODY};color:#6b7280;display:inline-flex;align-items:center;gap:6px;}
        .filter-chip:hover{border-color:${GREEN_BORDER};color:${GREEN};}
        .filter-chip.active{background:${GREEN_TINT};border-color:${GREEN_BORDER};color:${GREEN_DARK};}
        .pg-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;transition:all 0.18s;color:#6b7280;}
        .pg-btn:hover:not(:disabled){border-color:${GREEN_BORDER};color:${GREEN};background:${GREEN_TINT};}
        .pg-btn:disabled{opacity:0.35;cursor:default;}
        .pg-num{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;border:1.5px solid transparent;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s;color:#6b7280;background:transparent;}
        .pg-num:hover{background:${GREEN_TINT};color:${GREEN};}
        .pg-num.active{background:${GREEN};color:#fff;border-color:${GREEN};}
        .refresh-spin{animation:spin 0.7s linear infinite;}
        input.log-search{outline:none;border:1.5px solid #e8f5e9;border-radius:12px;padding:10px 14px 10px 40px;font-size:14px;font-family:${FONT_BODY};background:#fff;color:#111827;transition:border-color 0.2s,box-shadow 0.2s;width:100%;}
        input.log-search::placeholder{color:#9ca3af;}
        input.log-search:focus{border-color:${GREEN_BORDER};box-shadow:0 0 0 3px rgba(22,163,74,0.10);}
        .refresh-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:${FONT_BODY};transition:all 0.2s;background:${GREEN};color:#fff;border:1.5px solid ${GREEN};box-shadow:0 4px 14px rgba(22,163,74,0.25);}
        .refresh-btn:hover:not(:disabled){background:${GREEN_DARK};box-shadow:0 8px 24px rgba(22,163,74,0.32);transform:translateY(-2px);}
        .refresh-btn:disabled{background:${GREEN_TINT};color:${GREEN};border-color:${GREEN_BORDER};box-shadow:none;transform:none;}
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ animation: 'fadeUp 0.55s ease both', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10,
              padding: '5px 14px', borderRadius: 999,
              background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulseDot 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                System Activity
              </span>
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 600, color: '#0d1f0d',
              fontFamily: FONT_DISPLAY, letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              Activity Logs
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
              Track every action across the platform in real time.
            </p>
          </div>

          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="refresh-btn"
          >
            <RefreshCw size={14} className={refreshing ? 'refresh-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Action Filter Chips ── */}
      {!loading && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20,
          animation: 'fadeUp 0.55s ease 0.08s both',
        }}>
          <button
            className={`filter-chip${action === 'all' ? ' active' : ''}`}
            onClick={() => setAction('all')}
          >
            All&nbsp;<span style={{ color: '#9ca3af', fontWeight: 400 }}>({logs.length})</span>
          </button>
          {ALL_ACTIONS.filter(a => actionCounts[a] > 0).map(a => {
            const { color, dot } = getMeta(a)
            const isActive = action === a
            return (
              <button
                key={a}
                className={`filter-chip${isActive ? ' active' : ''}`}
                onClick={() => setAction(a)}
                style={isActive ? { borderColor: color + '55', background: color + '14', color } : {}}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot }} />
                {a.charAt(0).toUpperCase() + a.slice(1)}
                &nbsp;<span style={{ color: '#9ca3af', fontWeight: 400 }}>({actionCounts[a]})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Search + Count ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        animation: 'fadeUp 0.55s ease 0.12s both',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            className="log-search"
            placeholder="Search action, resource, IP, details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 10,
          background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`,
          flexShrink: 0,
        }}>
          <Filter size={13} color={GREEN} />
          <span style={{ fontSize: 13, fontWeight: 600, color: GREEN_DARK }}>
            {filtered.length.toLocaleString()} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: '#fff',
        border: `1.5px solid #e8f5e9`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(22,163,74,0.06)',
        animation: 'fadeUp 0.55s ease 0.18s both',
      }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '148px 120px 148px 1fr 160px',
          padding: '12px 24px',
          background: GREEN_BG,
          borderBottom: `1.5px solid #e8f5e9`,
        }}>
          {['Action', 'Resource', 'IP Address', 'Details', 'Timestamp'].map(h => (
            <span key={h} style={{
              fontSize: 10.5, fontWeight: 700, color: GREEN_DARK,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              fontFamily: FONT_BODY,
            }}>{h}</span>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <Skeleton />
        ) : paginated.length === 0 ? (
          <EmptyState search={search} onClear={() => { setSearch(''); setAction('all') }} />
        ) : (
          <div>
            {paginated.map((log, i) => {
              const detailStr = !log.details
                ? '—'
                : typeof log.details === 'object'
                  ? JSON.stringify(log.details)
                  : String(log.details)

              return (
                <div
                  key={log.id ?? i}
                  className="log-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '148px 120px 148px 1fr 160px',
                    padding: '13px 24px',
                    borderBottom: i < paginated.length - 1 ? '1px solid #f0fdf4' : 'none',
                    alignItems: 'center',
                    background: '#fff',
                    animation: `fadeUp 0.35s ease ${Math.min(i, 6) * 30}ms both`,
                  }}
                >
                  <div><ActionBadge action={log.action} /></div>
                  <div><ResourceTag value={log.resource_type} /></div>
                  <div><IPChip value={log.ip_address} /></div>
                  <div style={{ paddingRight: 20, overflow: 'hidden', minWidth: 0 }}>
                    <span style={{
                      fontSize: 12.5, color: '#6b7280', fontFamily: FONT_BODY,
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }} title={detailStr}>
                      {detailStr.length > 90 ? detailStr.slice(0, 90) + '…' : detailStr}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      fontSize: 11.5, color: '#9ca3af',
                      fontFamily: '"Courier New", monospace',
                    }}>
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
            borderTop: `1.5px solid #e8f5e9`,
            background: GREEN_BG,
            flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ fontSize: 12.5, color: '#9ca3af' }}>
              Showing{' '}
              <strong style={{ color: '#374151' }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong>
              {' '}of{' '}
              <strong style={{ color: '#374151' }}>{filtered.length}</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p
                if (totalPages <= 7)         p = i + 1
                else if (page <= 4)          p = i + 1
                else if (page >= totalPages - 3) p = totalPages - 6 + i
                else                         p = page - 3 + i
                return (
                  <button
                    key={p}
                    className={`pg-num${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {p}
                  </button>
                )
              })}
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Live indicator ── */}
      {!loading && filtered.length > 0 && (
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block', animation: 'pulseDot 1.8s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Live — updates on refresh</span>
        </div>
      )}
    </div>
  )
}