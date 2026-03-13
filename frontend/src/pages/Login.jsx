import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { login } from '../api/authApi'
import useAuthStore from '../store/authStore'

const ROLES = [
  { value: 'admin',   label: 'Admin',   color: '#16a34a', light: 'rgba(22,163,74,0.10)',  border: 'rgba(22,163,74,0.35)' },
  { value: 'doctor',  label: 'Doctor',  color: '#15803d', light: 'rgba(21,128,61,0.10)',  border: 'rgba(21,128,61,0.35)' },
  { value: 'athlete', label: 'Athlete', color: '#166534', light: 'rgba(22,101,52,0.10)',  border: 'rgba(22,101,52,0.35)' },
]
const REDIRECT = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', athlete: '/athlete/dashboard' }
const PERKS = ['50+ banned substances detected', 'Real-time AI analysis', 'Doctor-verified every result', 'WADA compliant platform']

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '', role: 'admin' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await login(form.email, form.password, form.role)
      setAuth(data)
      navigate(REDIRECT[data.role] || '/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  const sel = ROLES.find(r => r.value === form.role)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(26px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn {from{opacity:0;transform:translateX(-32px);}to{opacity:1;transform:translateX(0);}}
        @keyframes drift   {0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(7px,-10px) rotate(1deg);}66%{transform:translate(-5px,7px) rotate(-1deg);}}
        @keyframes spin    {to{transform:rotate(360deg);}}

        .l-input{width:100%;padding:13px 16px;border-radius:12px;border:1.5px solid #e5e7eb;background:#fff;font-size:15px;font-family:inherit;color:#111827;outline:none;transition:all 0.22s;}
        .l-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.11);}
        .l-input::placeholder{color:#9ca3af;}

        .role-btn{flex:1;padding:10px 6px;border-radius:11px;border:1.5px solid #e5e7eb;background:transparent;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;}

        .sub-btn{width:100%;padding:14px;border-radius:13px;border:none;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.24s;box-shadow:0 4px 16px rgba(22,163,74,0.28);}
        .sub-btn:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 10px 30px rgba(22,163,74,0.38);}
        .sub-btn:disabled{opacity:0.65;cursor:not-allowed;}

        .spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.30);border-top-color:#fff;animation:spin 0.72s linear infinite;}
      `}</style>

      {/* ── Left — image + brand panel ── */}
      <div style={{ width: '44%', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'slideIn 0.65s ease both' }}>
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=85"
          alt="Medical professional"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(155deg,rgba(10,24,10,0.88) 0%,rgba(21,101,52,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 48px' }}>
          <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'drift 5s ease-in-out infinite' }}>
              <Shield size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 600, color: '#fff', fontFamily: '"Playfair Display",serif' }}>DrugShield</span>
          </Link>

          <div>
            <h2 style={{ fontSize: 'clamp(26px,2.8vw,38px)', fontWeight: 600, color: '#fff', fontFamily: '"Playfair Display",serif', lineHeight: 1.22, marginBottom: 20 }}>
              Protecting sport,<br /><em style={{ fontStyle: 'italic', fontWeight: 400 }}>one test at a time.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.67)', lineHeight: 1.72, maxWidth: 300, marginBottom: 36 }}>
              AI-powered detection, physician-verified results, and real-time reporting — all in one platform.
            </p>
            {PERKS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={11} color="#4ade80" />
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.80)' }}>{p}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.36)' }}>© 2026 DrugShield</p>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', background: '#f8faf8' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.65s ease 0.15s both' }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: '#0d1f0d', fontFamily: '"Playfair Display",serif', letterSpacing: '-0.02em', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Sign in to your account to continue</p>
          </div>

          <div style={{ marginBottom: 26 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Login as</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" className="role-btn"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{ borderColor: form.role === r.value ? r.border : '#e5e7eb', background: form.role === r.value ? r.light : 'transparent', color: form.role === r.value ? r.color : '#6b7280' }}>
                  {r.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 7 }}>Must match the role you registered with</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Email address</label>
              <input type="email" required className="l-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                <a href="#" style={{ fontSize: 12.5, color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} required className="l-input"
                  placeholder="••••••••" style={{ paddingRight: 50 }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)', animation: 'fadeUp 0.3s ease' }}>
                <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 13.5, color: '#dc2626' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="sub-btn"
              style={{ background: sel?.color || '#16a34a', marginTop: 6 }}>
              {loading ? <><div className="spinner" />Signing in...</> : <>Sign in as {sel?.label} <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '26px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>new here?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}