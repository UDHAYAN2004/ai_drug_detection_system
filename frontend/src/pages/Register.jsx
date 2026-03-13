import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, Upload, X, CheckCircle, ArrowRight } from 'lucide-react'
import { API_BASE_URL, API_PREFIX } from '../utils/constants'

const ROLES = [
  { value: 'admin',   label: 'Admin',   color: '#16a34a', light: 'rgba(22,163,74,0.10)',  border: 'rgba(22,163,74,0.35)' },
  { value: 'doctor',  label: 'Doctor',  color: '#15803d', light: 'rgba(21,128,61,0.10)',  border: 'rgba(21,128,61,0.35)' },
  { value: 'athlete', label: 'Athlete', color: '#166534', light: 'rgba(22,101,52,0.10)',  border: 'rgba(22,101,52,0.35)' },
]

export default function Register() {
  const [form, setForm]           = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'athlete' })
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [idProof,     setIdProof]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const navigate = useNavigate()

  const handleFile = (e) => { const f = e.target.files[0]; if (f) setIdProof(f) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role }).forEach(([k, v]) => fd.append(k, v))
      if (idProof) fd.append('id_proof', idProof)
      const res  = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/register`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2600)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const sel = ROLES.find(r => r.value === form.role)

  /* ── Success screen ── */
  if (success) return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        @keyframes scaleIn  {from{transform:scale(0.6);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes fadeUp   {from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes drawCheck{from{stroke-dashoffset:40;}to{stroke-dashoffset:0;}}
        @keyframes expandProg{from{width:0;}to{width:100%;}}
      `}</style>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(22,163,74,0.12)', border: '2.5px solid rgba(22,163,74,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scaleIn 0.45s ease' }}>
          <svg width="38" height="38" viewBox="0 0 38 38">
            <path d="M8 19l8 8 14-14" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="40" strokeDashoffset="40" style={{ animation: 'drawCheck 0.55s ease 0.35s forwards' }} />
          </svg>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 600, color: '#0d1f0d', fontFamily: '"Playfair Display",serif', marginBottom: 10 }}>Account Created!</h2>
        <p style={{ fontSize: 15, color: '#6b7280' }}>Redirecting you to login...</p>
        <div style={{ width: 180, height: 3, background: '#d1fae5', borderRadius: 99, margin: '28px auto 0', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#16a34a', borderRadius: 99, animation: 'expandProg 2.5s linear forwards' }} />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(26px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn {from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);}}
        @keyframes drift   {0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(7px,-10px) rotate(1deg);}66%{transform:translate(-5px,7px) rotate(-1deg);}}
        @keyframes spin    {to{transform:rotate(360deg);}}
        @keyframes shimA   {0%{background-position:-400px 0;}100%{background-position:400px 0;}}

        .r-input{width:100%;padding:12px 14px;border-radius:11px;border:1.5px solid #e5e7eb;background:#fff;font-size:14px;font-family:inherit;color:#111827;outline:none;transition:all 0.22s;}
        .r-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.10);}
        .r-input::placeholder{color:#9ca3af;}

        .role-btn{flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid #e5e7eb;background:transparent;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;}

        .sub-btn{width:100%;padding:13px;border-radius:13px;border:none;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.24s;box-shadow:0 4px 16px rgba(22,163,74,0.28);}
        .sub-btn:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 10px 30px rgba(22,163,74,0.38);}
        .sub-btn:disabled{opacity:0.65;cursor:not-allowed;}

        .spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,0.28);border-top-color:#fff;animation:spin 0.72s linear infinite;}

        .flabel{display:block;font-size:12.5px;font-weight:500;color:#374151;margin-bottom:7px;}
        .opt{font-weight:400;color:#9ca3af;font-size:12px;}

        .upload-zone{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;background:#fafafa;border:1.5px dashed #d1d5db;cursor:pointer;transition:all 0.22s;}
        .upload-zone:hover{border-color:rgba(22,163,74,0.45);background:rgba(22,163,74,0.03);}
      `}</style>

      {/* ── Left — visual accent panel ── */}
      <div style={{ width: '38%', minHeight: '100vh', position: 'relative', overflow: 'hidden', animation: 'slideIn 0.65s ease both' }}>
        <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&q=85"
          alt="Lab research" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(155deg,rgba(10,24,10,0.90) 0%,rgba(21,101,52,0.80) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Progress bar shimmer decoration */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundImage: 'linear-gradient(90deg,transparent,rgba(74,222,128,0.6),transparent)', backgroundSize: '200px 100%', animation: 'shimA 2.5s linear infinite' }} />

        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 44px' }}>
          <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'drift 5s ease-in-out infinite' }}>
              <Shield size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 600, color: '#fff', fontFamily: '"Playfair Display",serif' }}>DrugShield</span>
          </Link>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'block' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4ade80', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Free to join</span>
            </div>

            <h2 style={{ fontSize: 'clamp(24px,2.5vw,34px)', fontWeight: 600, color: '#fff', fontFamily: '"Playfair Display",serif', lineHeight: 1.25, marginBottom: 18 }}>
              Join the fight<br /><em style={{ fontStyle: 'italic', fontWeight: 400 }}>for clean sport.</em>
            </h2>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.64)', lineHeight: 1.72, maxWidth: 280, marginBottom: 32 }}>
              Create your account and access the most accurate anti-doping platform available.
            </p>

            {['Setup in under 2 minutes', 'No credit card required', 'Instant dashboard access', 'Full WADA compliance'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CheckCircle size={14} color="#4ade80" />
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.77)' }}>{p}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.34)' }}>© 2026 DrugShield</p>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 36px', background: '#f8faf8', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.65s ease 0.15s both' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#0d1f0d', fontFamily: '"Playfair Display",serif', letterSpacing: '-0.02em', marginBottom: 8 }}>Create Account</h1>
            <p style={{ fontSize: 14.5, color: '#6b7280' }}>Join the anti-doping management system</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <label className="flabel">Register as</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" className="role-btn"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{ borderColor: form.role === r.value ? r.border : '#e5e7eb', background: form.role === r.value ? r.light : 'transparent', color: form.role === r.value ? r.color : '#6b7280' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #e8f5e9', borderRadius: 20, padding: '28px 28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name + Phone (2 col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="flabel">Full Name</label>
                  <input type="text" required className="r-input" placeholder="John Doe"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="flabel">Phone <span className="opt">(optional)</span></label>
                  <input type="tel" className="r-input" placeholder="+91 9876543210"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="flabel">Email address</label>
                <input type="email" required className="r-input" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              {/* Passwords (2 col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="flabel">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} required className="r-input" placeholder="Min 8 chars" style={{ paddingRight: 42 }}
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="flabel">Confirm</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} required className="r-input" placeholder="Re-enter" style={{ paddingRight: 42 }}
                      value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ID Proof */}
              <div>
                <label className="flabel">ID Proof <span className="opt">(optional)</span></label>
                {idProof ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.25)' }}>
                    <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#16a34a' }}>{idProof.name}</span>
                    <button type="button" onClick={() => setIdProof(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}><X size={14} /></button>
                  </div>
                ) : (
                  <label className="upload-zone">
                    <Upload size={14} color="#9ca3af" />
                    <span style={{ fontSize: 13.5, color: '#9ca3af' }}>Click to upload — JPG, PNG or PDF</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)', animation: 'fadeUp 0.3s ease' }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13.5, color: '#dc2626' }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="sub-btn"
                style={{ background: sel?.color || '#16a34a', marginTop: 4 }}>
                {loading ? <><div className="spinner" />Creating Account...</> : <>Create {sel?.label} Account <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}