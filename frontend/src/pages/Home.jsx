import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Shield, Activity, Search, FileText, Users, ChevronRight,
  CheckCircle, ArrowUpRight, Zap, Lock, Star
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Portals',  href: '#portals'  },
  { label: 'About',    href: '#about'    },
]

const FEATURES = [
  { icon: FileText,    title: 'AI-Powered OCR',      desc: 'Instantly extracts and processes data from any medical report format.' },
  { icon: Search,      title: 'Drug Detection',       desc: 'Identifies 50+ WADA banned substances with confidence scoring.' },
  { icon: Activity,    title: 'Real-time Analytics', desc: 'Live dashboards with trends, monthly breakdowns, and risk analysis.' },
  { icon: Users,       title: 'Role-Based Access',    desc: 'Separate portals for Admins, Doctors, and Athletes.' },
  { icon: Shield,      title: 'WADA Compliant',       desc: 'Built around the official WADA prohibited substance list.' },
  { icon: CheckCircle, title: 'Doctor Verification', desc: 'Every AI result is reviewed by a qualified physician.' },
]

const ROLES = [
  { role: 'Admin',   icon: Lock,     img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=700&q=80', desc: 'Manage users, oversee reports, investigations and all system activity.' },
  { role: 'Doctor',  icon: Activity, img: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=700&q=80', desc: 'Review AI results, verify detections and manage case statuses.' },
  { role: 'Athlete', icon: Zap,      img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80', desc: 'Upload reports, track your cases and communicate securely.' },
]

const STATS = [
  { value: '50+',  label: 'Banned Substances' },
  { value: '99%',  label: 'Detection Accuracy' },
  { value: '8',    label: 'Drug Categories' },
  { value: '24/7', label: 'Availability' },
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Chen',  role: 'Chief Medical Officer',     quote: 'DrugShield cut our review time by 70%. The AI detection is frighteningly accurate.', stars: 5 },
  { name: 'Marcus Webb',     role: 'Anti-Doping Coordinator',   quote: 'Finally a platform built around how our team actually works — clean, fast, reliable.', stars: 5 },
  { name: 'Aisha Patel',     role: 'Athletic Director',         quote: 'Athletes trust the process more knowing every result gets physician sign-off.', stars: 5 },
]

function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

export default function Home() {
  const navigate = useNavigate()
  const [scrollY,  setScrollY]  = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroRef,  heroInView]  = useInView(0.05)
  const [featRef,  featInView]  = useInView()
  const [roleRef,  roleInView]  = useInView()
  const [statRef,  statInView]  = useInView()
  const [testRef,  testInView]  = useInView()

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navBg = scrollY > 40

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '"Outfit", system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}

        @keyframes fadeUp    {from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeDown  {from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn    {from{opacity:0;}to{opacity:1;}}
        @keyframes scaleIn   {from{opacity:0;transform:scale(0.93);}to{opacity:1;transform:scale(1);}}
        @keyframes drift     {0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(8px,-12px) rotate(1deg);}66%{transform:translate(-6px,8px) rotate(-1deg);}}
        @keyframes pulseDot  {0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.7);opacity:0.35;}}
        @keyframes shimmerAnim{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
        @keyframes slideLeft {from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes menuIn    {from{opacity:0;transform:translateY(-8px)scale(0.97);}to{opacity:1;transform:translateY(0)scale(1);}}
        @keyframes navUnder  {from{width:0;}to{width:100%;}}
        @keyframes countUp   {from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

        /* Nav underline */
        .nav-a{position:relative;font-size:14px;font-weight:500;color:#374151;text-decoration:none;padding-bottom:3px;transition:color 0.2s;cursor:pointer;}
        .nav-a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;background:#16a34a;border-radius:99px;transition:width 0.28s cubic-bezier(0.4,0,0.2,1);}
        .nav-a:hover{color:#16a34a;}
        .nav-a:hover::after{width:100%;}

        /* Buttons */
        .btn-g{display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#fff;border:none;border-radius:14px;padding:13px 28px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.22s;box-shadow:0 4px 18px rgba(22,163,74,0.30);letter-spacing:-0.01em;}
        .btn-g:hover{background:#15803d;transform:translateY(-3px);box-shadow:0 12px 32px rgba(22,163,74,0.38);}
        .btn-g:active{transform:translateY(0);}
        .btn-o{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#16a34a;border:2px solid #16a34a;border-radius:14px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.22s;}
        .btn-o:hover{background:#16a34a;color:#fff;transform:translateY(-3px);box-shadow:0 10px 28px rgba(22,163,74,0.25);}

        /* Cards */
        .feat-card{background:#fff;border:1.5px solid #e8f5e9;border-radius:22px;padding:30px;transition:all 0.32s;position:relative;overflow:hidden;}
        .feat-card::before{content:'';position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(22,163,74,0.05),transparent 60%);transition:opacity 0.32s;}
        .feat-card:hover{transform:translateY(-7px);border-color:rgba(22,163,74,0.40);box-shadow:0 22px 52px rgba(22,163,74,0.11);}
        .feat-card:hover::before{opacity:1;}

        .role-card{border-radius:24px;overflow:hidden;border:1.5px solid #e8f5e9;transition:all 0.35s;cursor:pointer;background:#fff;}
        .role-card:hover{transform:translateY(-9px) scale(1.01);box-shadow:0 30px 60px rgba(22,163,74,0.14);border-color:rgba(22,163,74,0.45);}
        .role-card .rimg{width:100%;height:224px;object-fit:cover;display:block;transition:transform 0.52s;}
        .role-card:hover .rimg{transform:scale(1.07);}

        .test-card{background:#fff;border:1.5px solid #e8f5e9;border-radius:22px;padding:28px 26px;transition:all 0.3s;}
        .test-card:hover{box-shadow:0 18px 44px rgba(22,163,74,0.10);border-color:rgba(22,163,74,0.32);transform:translateY(-5px);}

        /* Stagger */
        .stg>*{opacity:0;transform:translateY(26px);transition:opacity 0.55s ease,transform 0.55s ease;}
        .stg.in>*:nth-child(1){opacity:1;transform:none;transition-delay:0ms;}
        .stg.in>*:nth-child(2){opacity:1;transform:none;transition-delay:100ms;}
        .stg.in>*:nth-child(3){opacity:1;transform:none;transition-delay:200ms;}
        .stg.in>*:nth-child(4){opacity:1;transform:none;transition-delay:300ms;}
        .stg.in>*:nth-child(5){opacity:1;transform:none;transition-delay:400ms;}
        .stg.in>*:nth-child(6){opacity:1;transform:none;transition-delay:500ms;}

        /* Pill tag */
        .spill{display:inline-flex;align-items:center;gap:7px;padding:5px 15px;border-radius:999px;background:rgba(22,163,74,0.09);border:1px solid rgba(22,163,74,0.22);font-size:12px;font-weight:600;color:#16a34a;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:18px;}

        /* Mobile */
        .mob-menu{position:fixed;inset:0;background:rgba(0,0,0,0.52);z-index:200;display:flex;justify-content:flex-end;animation:fadeIn 0.2s ease;}
        .mob-panel{width:280px;height:100%;background:#fff;padding:32px 26px;display:flex;flex-direction:column;gap:0;animation:slideLeft 0.25s ease;}

        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:rgba(22,163,74,0.28);border-radius:99px;}

        @media(max-width:860px){
          .hm{display:none!important;}
          .hd{display:flex!important;}
          .hero-g{grid-template-columns:1fr!important;}
          .roles-g{grid-template-columns:1fr!important;}
          .feat-g{grid-template-columns:repeat(2,1fr)!important;}
          .stat-g{grid-template-columns:repeat(2,1fr)!important;}
          .test-g{grid-template-columns:1fr!important;}
        }
        @media(max-width:560px){
          .feat-g,.stat-g{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ╔══════════════════════════════════════╗
          ║            NAVBAR                    ║
          ╚══════════════════════════════════════╝ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 52px',
        background: navBg ? 'rgba(255,255,255,0.94)' : 'transparent',
        backdropFilter: navBg ? 'blur(22px) saturate(1.6)' : 'none',
        borderBottom: navBg ? '1px solid rgba(22,163,74,0.13)' : '1px solid transparent',
        boxShadow: navBg ? '0 4px 28px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        animation: 'fadeDown 0.55s ease',
      }}>

        {/* Logo */}
        <div onClick={() => window.scrollTo({top:0,behavior:'smooth'})}
          style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:'linear-gradient(135deg,#16a34a 0%,#15803d 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(22,163,74,0.35)',
            animation:'drift 6s ease-in-out infinite',
          }}>
            <Shield size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize:19, fontWeight:600, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.01em' }}>
            DrugShield
          </span>
        </div>

        {/* Desktop links */}
        <div className="hm" style={{ display:'flex', alignItems:'center', gap:38 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="nav-a">{label}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hm" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('/login')} style={{
            background:'transparent', color:'#374151', border:'1.5px solid #e5e7eb',
            borderRadius:11, padding:'8px 20px', fontSize:14, fontWeight:500,
            cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#16a34a'; e.currentTarget.style.color='#16a34a' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#374151' }}
          >Login</button>
          <button onClick={() => navigate('/register')} className="btn-g" style={{ padding:'9px 20px', fontSize:14 }}>
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="hd" onClick={() => setMenuOpen(true)}
          style={{ display:'none', background:'none', border:'none', cursor:'pointer', flexDirection:'column', gap:5, padding:8 }}>
          {[22,14,22].map((w,i) => <div key={i} style={{ width:w, height:2, background:'#374151', borderRadius:2 }} />)}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mob-menu" onClick={() => setMenuOpen(false)}>
          <div className="mob-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <span style={{ fontWeight:700, fontSize:17, color:'#111', fontFamily:'"Playfair Display",serif' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:24, color:'#9ca3af', lineHeight:1 }}>×</button>
            </div>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}
                style={{ display:'block', padding:'15px 0', fontSize:16, fontWeight:500, color:'#374151', textDecoration:'none', borderBottom:'1px solid #f3f4f6' }}>
                {label}
              </a>
            ))}
            <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={() => navigate('/login')} style={{ padding:'12px', borderRadius:12, border:'1.5px solid #e5e7eb', background:'transparent', fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer' }}>Login</button>
              <button onClick={() => navigate('/register')} className="btn-g" style={{ justifyContent:'center' }}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════╗
          ║              HERO                    ║
          ╚══════════════════════════════════════╝ */}
      <section ref={heroRef} style={{
        paddingTop: 68, minHeight: '100vh', display:'flex', alignItems:'center',
        background:'linear-gradient(155deg,#f0fdf4 0%,#fff 52%,#f0fdf4 100%)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position:'absolute', top:'-5%', right:'-8%', width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,0.10) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:'-6%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.38, backgroundImage:'radial-gradient(circle,rgba(22,163,74,0.28) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />

        <div className="hero-g" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center', maxWidth:1180, margin:'0 auto', padding:'80px 52px', width:'100%', position:'relative' }}>

          {/* Text */}
          <div style={{ animation: heroInView ? 'fadeUp 0.8s ease both' : 'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'6px 16px', borderRadius:999, background:'rgba(22,163,74,0.10)', border:'1px solid rgba(22,163,74,0.25)', marginBottom:30 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'block', animation:'pulseDot 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize:12.5, fontWeight:600, color:'#16a34a', letterSpacing:'0.07em', textTransform:'uppercase' }}>AI-Powered Anti-Doping Platform</span>
            </div>

            <h1 style={{ fontSize:'clamp(36px,4.8vw,58px)', fontWeight:600, lineHeight:1.08, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.02em', marginBottom:24 }}>
              Detect Doping.<br />
              <em style={{ fontStyle:'italic', color:'#16a34a', fontWeight:400 }}>Protect Sports.</em>
            </h1>

            <p style={{ fontSize:17, color:'#4b5563', lineHeight:1.78, marginBottom:40, maxWidth:440 }}>
              AI-powered medical report analysis that identifies banned substances instantly — reviewed by doctors, trusted by organizations.
            </p>

            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:48 }}>
              <button onClick={() => navigate('/register')} className="btn-g" style={{ padding:'14px 32px', fontSize:15 }}>
                Get Started <ArrowUpRight size={16} />
              </button>
              <button onClick={() => navigate('/login')} className="btn-o" style={{ padding:'13px 32px', fontSize:15 }}>
                Sign In
              </button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:28, flexWrap:'wrap' }}>
              {['WADA Compliant','Doctor Verified','99% Accuracy'].map((t,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize:13, color:'#6b7280', fontWeight:500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image collage */}
          <div style={{ position:'relative', animation: heroInView ? 'scaleIn 0.9s ease 0.2s both' : 'none' }}>
            <div style={{ borderRadius:28, overflow:'hidden', border:'3px solid rgba(22,163,74,0.18)', boxShadow:'0 36px 88px rgba(22,163,74,0.18)', position:'relative' }}>
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=85"
                alt="Medical lab" style={{ width:'100%', height:430, objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 50%,rgba(10,24,10,0.52) 100%)' }} />
              <div style={{ position:'absolute', bottom:24, left:24, right:24 }}>
                <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.75)', fontWeight:500, marginBottom:8 }}>AI Analysis Active</p>
                <div style={{ height:4, borderRadius:99, background:'rgba(255,255,255,0.18)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:'74%', borderRadius:99, backgroundImage:'linear-gradient(90deg,#4ade80,#86efac,#4ade80)', backgroundSize:'200px 100%', animation:'shimmerAnim 2s linear infinite' }} />
                </div>
              </div>
            </div>

            {/* Float card — top right */}
            <div style={{ position:'absolute', top:-22, right:-26, background:'#fff', borderRadius:20, padding:'16px 22px', border:'1.5px solid #e8f5e9', boxShadow:'0 16px 44px rgba(22,163,74,0.16)', animation:'drift 5s ease-in-out infinite', minWidth:158 }}>
              <p style={{ fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.07em' }}>Substances</p>
              <p style={{ fontSize:30, fontWeight:700, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', lineHeight:1 }}>50<span style={{ fontSize:16, color:'#16a34a' }}>+</span></p>
            </div>

            {/* Float card — bottom left */}
            <div style={{ position:'absolute', bottom:-22, left:-26, background:'#fff', borderRadius:20, padding:'15px 20px', border:'1.5px solid #e8f5e9', boxShadow:'0 16px 44px rgba(22,163,74,0.16)', animation:'drift 7s ease-in-out infinite reverse', minWidth:148 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(22,163,74,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CheckCircle size={18} color="#16a34a" />
                </div>
                <div>
                  <p style={{ fontSize:11, color:'#9ca3af', fontWeight:500 }}>Accuracy</p>
                  <p style={{ fontSize:20, fontWeight:700, color:'#0d1f0d', fontFamily:'"Playfair Display",serif' }}>99%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, animation:'fadeIn 1.5s ease 1s both' }}>
          <span style={{ fontSize:10.5, color:'#9ca3af', fontWeight:500, letterSpacing:'0.09em', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:1, height:38, background:'linear-gradient(to bottom,#9ca3af,transparent)' }} />
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║           STATS BAND                 ║
          ╚══════════════════════════════════════╝ */}
      <section ref={statRef} style={{ background:'#0d1f0d', padding:'64px 52px' }}>
        <div className="stat-g" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', maxWidth:1100, margin:'0 auto' }}>
          {STATS.map((s,i) => (
            <div key={i} style={{
              textAlign:'center', padding:'4px 28px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.09)' : 'none',
              opacity: statInView ? 1 : 0, transform: statInView ? 'none' : 'translateY(20px)',
              transition:`all 0.6s ease ${i*110}ms`,
            }}>
              <p style={{ fontSize:'clamp(34px,3.8vw,50px)', fontWeight:600, color:'#fff', fontFamily:'"Playfair Display",serif', lineHeight:1, marginBottom:10 }}>{s.value}</p>
              <p style={{ fontSize:13.5, color:'rgba(255,255,255,0.50)', fontWeight:500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║          ROLE PORTALS                ║
          ╚══════════════════════════════════════╝ */}
      <section id="portals" style={{ padding:'100px 52px', background:'#fff' }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="spill">Portals</div>
            <h2 style={{ fontSize:'clamp(26px,3.8vw,42px)', fontWeight:600, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.02em', marginBottom:14 }}>Who is it for?</h2>
            <p style={{ fontSize:16, color:'#6b7280', maxWidth:480, margin:'0 auto' }}>Three dedicated portals built around how each role actually works.</p>
          </div>

          <div ref={roleRef} className={`roles-g stg${roleInView ? ' in' : ''}`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {ROLES.map(({ role, icon:Icon, img, desc }) => (
              <div key={role} className="role-card" onClick={() => navigate('/login')}>
                <div style={{ position:'relative', overflow:'hidden' }}>
                  <img src={img} alt={role} className="rimg" />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 30%,rgba(10,24,10,0.72) 100%)' }} />
                  <div style={{ position:'absolute', top:16, right:16, width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.16)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.26)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={17} color="#fff" />
                  </div>
                  <h3 style={{ position:'absolute', bottom:20, left:22, fontSize:22, fontWeight:600, color:'#fff', fontFamily:'"Playfair Display",serif' }}>{role}</h3>
                </div>
                <div style={{ padding:'22px 24px 28px' }}>
                  <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.70, marginBottom:20 }}>{desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:6, color:'#16a34a', fontSize:13.5, fontWeight:600 }}>
                    Login as {role} <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║            FEATURES                  ║
          ╚══════════════════════════════════════╝ */}
      <section id="features" style={{ padding:'80px 52px 100px', background:'#f8faf8' }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="spill">Features</div>
            <h2 style={{ fontSize:'clamp(26px,3.8vw,42px)', fontWeight:600, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.02em', marginBottom:14 }}>Built for precision.</h2>
            <p style={{ fontSize:16, color:'#6b7280', maxWidth:460, margin:'0 auto' }}>Everything engineered to make anti-doping management faster, fairer, more accurate.</p>
          </div>

          <div ref={featRef} className={`feat-g stg${featInView ? ' in' : ''}`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {FEATURES.map(({ icon:Icon, title, desc }) => (
              <div key={title} className="feat-card">
                <div style={{ width:46, height:46, borderRadius:14, background:'linear-gradient(135deg,rgba(22,163,74,0.14),rgba(22,163,74,0.05))', border:'1px solid rgba(22,163,74,0.22)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                  <Icon size={21} color="#16a34a" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize:16, fontWeight:600, color:'#111827', marginBottom:10, letterSpacing:'-0.01em' }}>{title}</h3>
                <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.68 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║          IMAGE QUOTE BAND            ║
          ╚══════════════════════════════════════╝ */}
      <section style={{ position:'relative', height:440, overflow:'hidden' }}>
        <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&q=80"
          alt="Laboratory research" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(10,24,10,0.68)' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 52px', textAlign:'center' }}>
          <p style={{ fontSize:'clamp(22px,3vw,38px)', fontWeight:400, color:'#fff', fontFamily:'"Playfair Display",serif', lineHeight:1.32, maxWidth:680, marginBottom:36, fontStyle:'italic' }}>
            "Science meets sport. Every report tells a story — we make sure the right story is heard."
          </p>
          <button onClick={() => navigate('/register')} className="btn-g" style={{ padding:'13px 34px' }}>
            Start Today <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║          TESTIMONIALS                ║
          ╚══════════════════════════════════════╝ */}
      <section id="about" style={{ padding:'100px 52px', background:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="spill">Testimonials</div>
            <h2 style={{ fontSize:'clamp(26px,3.8vw,42px)', fontWeight:600, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.02em' }}>Trusted by professionals.</h2>
          </div>
          <div ref={testRef} className={`test-g stg${testInView ? ' in' : ''}`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
            {TESTIMONIALS.map(({ name, role, quote, stars }) => (
              <div key={name} className="test-card">
                <div style={{ display:'flex', gap:3, marginBottom:18 }}>
                  {Array(stars).fill(0).map((_,i) => <Star key={i} size={14} color="#16a34a" fill="#16a34a" />)}
                </div>
                <p style={{ fontSize:15, color:'#374151', lineHeight:1.74, marginBottom:24, fontStyle:'italic' }}>"{quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{name[0]}</span>
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{name}</p>
                    <p style={{ fontSize:12.5, color:'#9ca3af' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║               CTA                    ║
          ╚══════════════════════════════════════╝ */}
      <section style={{ padding:'80px 52px 100px', background:'#f0fdf4' }}>
        <div style={{ maxWidth:660, margin:'0 auto', textAlign:'center' }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg,#16a34a,#15803d)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', boxShadow:'0 8px 28px rgba(22,163,74,0.30)' }}>
            <Shield size={28} color="#fff" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize:'clamp(26px,3.8vw,42px)', fontWeight:600, color:'#0d1f0d', fontFamily:'"Playfair Display",serif', letterSpacing:'-0.02em', marginBottom:16 }}>Ready to get started?</h2>
          <p style={{ fontSize:16, color:'#6b7280', lineHeight:1.72, marginBottom:36 }}>
            Create your account and start managing anti-doping reports today. Free setup, immediate access.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn-g" style={{ padding:'14px 36px', fontSize:16 }}>Create Account <ArrowUpRight size={16} /></button>
            <button onClick={() => navigate('/login')} className="btn-o" style={{ padding:'13px 36px', fontSize:16 }}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║             FOOTER                   ║
          ╚══════════════════════════════════════╝ */}
      <footer style={{ borderTop:'1px solid #e8f5e9', padding:'30px 52px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, background:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, background:'#16a34a', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}><Shield size={13} color="#fff" /></div>
          <span style={{ fontSize:15, fontWeight:700, color:'#111', fontFamily:'"Playfair Display",serif' }}>DrugShield</span>
        </div>
        <p style={{ fontSize:13, color:'#9ca3af' }}>© 2026 DrugShield — AI Powered Medical Drug Detection</p>
        <div style={{ display:'flex', gap:22 }}>
          {['Privacy','Terms','Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:'#9ca3af', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#16a34a'}
              onMouseLeave={e => e.currentTarget.style.color='#9ca3af'}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}