import { useEffect, useState } from 'react'
import { FileText, Search, CheckCircle, AlertTriangle, Upload, ChevronRight, ArrowUpRight, Shield, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateTime, getRiskBadgeClass, getStatusBadgeClass, capitalize } from '../../utils/helpers'

// ─── Design tokens (Home page theme) ─────────────────────────────────────────
const GREEN        = '#16a34a'
const GREEN_DARK   = '#15803d'
const GREEN_BG     = '#f0fdf4'
const GREEN_TINT   = 'rgba(22,163,74,0.09)'
const GREEN_BORDER = 'rgba(22,163,74,0.22)'
const FONT_DISPLAY = '"Playfair Display", Georgia, serif'
const FONT_BODY    = '"Outfit", system-ui, sans-serif'

// ─── Risk / status color maps ─────────────────────────────────────────────────
const RISK_COLORS = {
  critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.09)',  border: 'rgba(220,38,38,0.22)' },
  high:     { color: '#d97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.25)'  },
  medium:   { color: '#0284c7', bg: 'rgba(2,132,199,0.09)',  border: 'rgba(2,132,199,0.22)'  },
  low:      { color: GREEN,     bg: GREEN_TINT,               border: GREEN_BORDER             },
}
const STATUS_COLORS = {
  detected: { color: '#dc2626', bg: 'rgba(220,38,38,0.09)',  border: 'rgba(220,38,38,0.22)' },
  clean:    { color: GREEN,     bg: GREEN_TINT,               border: GREEN_BORDER             },
  pending:  { color: '#d97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.25)'  },
  default:  { color: '#6b7280', bg: 'rgba(107,114,128,0.09)',border: 'rgba(107,114,128,0.2)' },
}

function getBadge(map, key) {
  return map[key?.toLowerCase()] ?? map.default ?? map.low
}

function Pill({ label, map, value }) {
  if (!label && !value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
  const { color, bg, border } = getBadge(map, value)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 11px', borderRadius: 999,
      background: bg, border: `1px solid ${border}`,
      fontSize: 11, fontWeight: 700, color,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      fontFamily: FONT_BODY, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }) {
  const palettes = {
    primary: { accent: GREEN,     light: GREEN_TINT,               border: GREEN_BORDER,              iconBg: 'rgba(22,163,74,0.12)' },
    success: { accent: GREEN,     light: GREEN_TINT,               border: GREEN_BORDER,              iconBg: 'rgba(22,163,74,0.12)' },
    danger:  { accent: '#dc2626', light: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.18)',    iconBg: 'rgba(220,38,38,0.10)' },
    warning: { accent: '#d97706', light: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.20)',    iconBg: 'rgba(217,119,6,0.10)'  },
  }
  const p = palettes[color] ?? palettes.primary
  return (
    <div style={{
      background: '#fff', border: `1.5px solid ${p.border}`,
      borderRadius: 18, padding: '22px 24px',
      boxShadow: `0 4px 20px ${p.accent}12`,
      display: 'flex', alignItems: 'center', gap: 18,
      animation: `fadeUp 0.55s ease ${delay}ms both`,
      transition: 'transform 0.22s, box-shadow 0.22s',
      cursor: 'default',
      fontFamily: FONT_BODY,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${p.accent}1e` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = `0 4px 20px ${p.accent}12` }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
        background: p.iconBg, border: `1.5px solid ${p.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={p.accent} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 30, fontWeight: 700, color: '#0d1f0d', fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  )
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 18 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: GREEN_TINT, border: `1.5px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Shield size={26} color={GREEN} strokeWidth={1.8} style={{ animation: 'spin 1.2s linear infinite' }} />
      </div>
      <p style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT_BODY }}>Loading your dashboard…</p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AthleteDashboard() {
  const [reports, setReports] = useState([])
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      import('../../api/axios').then(m => m.default.get('/reports/my-reports')),
      import('../../api/axios').then(m => m.default.get('/investigations/my-cases')),
    ]).then(([r, c]) => {
      setReports(r.data || [])
      setCases(c.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const detected  = reports.filter(r => r.detection_status === 'detected').length
  const clean     = reports.filter(r => r.detection_status === 'clean').length
  const openCases = cases.filter(c => !['dismissed', 'banned'].includes(c.status)).length

  return (
    <div style={{ fontFamily: FONT_BODY, color: '#111827' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:none;}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(1.7);}}
        @keyframes drift{0%,100%{transform:translate(0,0);}50%{transform:translate(4px,-6px);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .report-row{transition:background 0.15s,transform 0.15s;}
        .report-row:hover{background:${GREEN_BG}!important;transform:translateX(3px);}
        .case-row{transition:background 0.15s;}
        .case-row:hover{background:${GREEN_BG}!important;}
        .upload-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 26px;border-radius:13px;background:${GREEN};color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:${FONT_BODY};transition:all 0.22s;box-shadow:0 4px 18px rgba(22,163,74,0.30);}
        .upload-btn:hover{background:${GREEN_DARK};transform:translateY(-3px);box-shadow:0 12px 32px rgba(22,163,74,0.38);}
        .ghost-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:10px;background:${GREEN_TINT};color:${GREEN_DARK};border:1px solid ${GREEN_BORDER};font-size:12px;font-weight:600;cursor:pointer;font-family:${FONT_BODY};transition:all 0.18s;}
        .ghost-btn:hover{background:${GREEN};color:#fff;border-color:${GREEN};}
        .space-y-6>*+*{margin-top:24px;}
      `}</style>

      <div className="space-y-6">

        {/* ── Page header ── */}
        <div style={{ animation: 'fadeUp 0.55s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '5px 14px', borderRadius: 999,
            background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulseDot 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Athlete Portal</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#0d1f0d', fontFamily: FONT_DISPLAY, letterSpacing: '-0.02em' }}>
            My Dashboard
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 5 }}>Track your reports, results, and active cases in one place.</p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <StatCard label="Total Reports" value={reports.length} icon={FileText}      color="primary" delay={0}   />
          <StatCard label="Clean Reports" value={clean}          icon={CheckCircle}   color="success" delay={80}  />
          <StatCard label="Detected"      value={detected}       icon={AlertTriangle} color="danger"  delay={160} />
          <StatCard label="Active Cases"  value={openCases}      icon={Search}        color="warning" delay={240} />
        </div>

        {/* ── Upload CTA ── */}
        <div style={{
          background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
          border: `1.5px solid ${GREEN_BORDER}`,
          borderRadius: 20, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 18,
          boxShadow: '0 4px 20px rgba(22,163,74,0.08)',
          animation: 'fadeUp 0.55s ease 0.28s both',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative blob */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(22,163,74,0.08)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 15, flexShrink: 0,
              background: '#fff', border: `1.5px solid ${GREEN_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(22,163,74,0.15)',
              animation: 'drift 4s ease-in-out infinite',
            }}>
              <Upload size={22} color={GREEN} strokeWidth={1.8} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0d1f0d', fontFamily: FONT_DISPLAY, marginBottom: 4 }}>
                Upload Medical Report
              </h3>
              <p style={{ fontSize: 13.5, color: '#6b7280' }}>
                Submit a new report for AI-powered drug detection analysis
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/athlete/upload')} className="upload-btn">
            <Upload size={15} /> Upload Report <ArrowUpRight size={14} />
          </button>
        </div>

        {/* ── Recent Reports ── */}
        <div style={{
          background: '#fff', border: `1.5px solid #e8f5e9`,
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(22,163,74,0.06)',
          animation: 'fadeUp 0.55s ease 0.35s both',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px', background: GREEN_BG,
            borderBottom: `1.5px solid #e8f5e9`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={15} color={GREEN} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0d1f0d', fontFamily: FONT_DISPLAY }}>Recent Reports</span>
            </div>
            <button onClick={() => navigate('/athlete/reports')} className="ghost-btn">
              View All <ChevronRight size={13} />
            </button>
          </div>

          {/* Rows */}
          {reports.slice(0, 5).length === 0 ? (
            <div style={{ padding: '52px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: GREEN_TINT, border: `1.5px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <FileText size={24} color={GREEN} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', fontFamily: FONT_DISPLAY, marginBottom: 6 }}>No reports yet</p>
              <p style={{ fontSize: 13.5, color: '#9ca3af' }}>Upload your first medical report to get started.</p>
            </div>
          ) : (
            reports.slice(0, 5).map((r, i) => (
              <div
                key={r.id || i}
                className="report-row"
                onClick={() => navigate('/athlete/reports')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 22px',
                  borderBottom: i < Math.min(reports.length, 5) - 1 ? '1px solid #f0fdf4' : 'none',
                  cursor: 'pointer',
                  background: '#fff',
                  animation: `fadeUp 0.35s ease ${i * 40}ms both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={15} color={GREEN} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: GREEN_DARK, fontFamily: '"Courier New", monospace', letterSpacing: '0.04em' }}>
                      {r.report_id}
                    </p>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{formatDateTime(r.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.risk_level && (
                    <Pill label={r.risk_level?.toUpperCase()} map={RISK_COLORS} value={r.risk_level} />
                  )}
                  <Pill label={capitalize(r.detection_status || '')} map={STATUS_COLORS} value={r.detection_status} />
                  <ChevronRight size={14} color="#d1d5db" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Active Cases ── */}
        {cases.length > 0 && (
          <div style={{
            background: '#fff', border: `1.5px solid #e8f5e9`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(22,163,74,0.06)',
            animation: 'fadeUp 0.55s ease 0.44s both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 22px', background: GREEN_BG,
              borderBottom: `1.5px solid #e8f5e9`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: GREEN_TINT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={15} color={GREEN} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0d1f0d', fontFamily: FONT_DISPLAY }}>My Cases</span>
              </div>
              <button onClick={() => navigate('/athlete/cases')} className="ghost-btn">
                View All <ChevronRight size={13} />
              </button>
            </div>

            {cases.slice(0, 3).map((c, i) => (
              <div
                key={c.id || i}
                className="case-row"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 22px',
                  borderBottom: i < Math.min(cases.length, 3) - 1 ? '1px solid #f0fdf4' : 'none',
                  background: '#fff',
                  animation: `fadeUp 0.35s ease ${i * 50}ms both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={15} color="#dc2626" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: GREEN_DARK, fontFamily: '"Courier New", monospace', letterSpacing: '0.04em' }}>
                      {c.case_id}
                    </p>
                    <p style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                      {c.detected_drug || '—'}
                    </p>
                  </div>
                </div>
                <Pill label={capitalize(c.status?.replace('_', ' ') || '')} map={STATUS_COLORS} value={c.status} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}