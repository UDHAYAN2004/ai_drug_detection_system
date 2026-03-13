import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, X, Shield, Clock, ArrowRight } from 'lucide-react'
import axiosInstance from '../../api/axios'

export default function UploadReport() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  const handleFile = (f) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowed.includes(f.type)) { 
      setError('Only JPG, PNG, PDF files allowed'); 
      return 
    }
    if (f.size > 10 * 1024 * 1024) { 
      setError('File size must be under 10MB'); 
      return 
    }
    setFile(f); 
    setError(''); 
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault(); 
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); 
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)

      const { data } = await axiosInstance.post('/reports/upload', fd)

      setResult(data)
      setFile(null)
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.message || 'Upload failed. Please try again.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: 680, 
      margin: '0 auto', 
      animation: 'fadeUp 0.6s ease' 
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .upload-zone {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .upload-zone.dragover {
          transform: scale(1.02);
          border-color: #16a34a;
          background: rgba(22,163,74,0.05);
        }
        .result-card {
          animation: slideUp 0.5s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.15)',
          borderRadius: 40,
          fontSize: 12,
          fontWeight: 600,
          color: '#16a34a',
          marginBottom: 16,
        }}>
          <Shield size={14} />
          SECURE UPLOAD
        </span>
        <h1 style={{
          fontSize: 36,
          fontWeight: 600,
          color: '#0d1f0d',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>
          Upload Medical Report
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
          Upload your medical report for AI-powered drug detection analysis
        </p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <div style={{
          background: '#fff',
          border: '1.5px solid #e8f5e9',
          borderRadius: 32,
          padding: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
        }}>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`upload-zone ${drag ? 'dragover' : ''}`}
            style={{
              border: `2px dashed ${drag ? '#16a34a' : file ? '#22c55e' : '#e8f5e9'}`,
              borderRadius: 24,
              padding: 48,
              textAlign: 'center',
              background: drag ? 'rgba(22,163,74,0.02)' : file ? 'rgba(34,197,94,0.02)' : '#f8faf8',
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            {file ? (
              <div>
                <div style={{
                  width: 64,
                  height: 64,
                  background: 'rgba(34,197,94,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <FileText size={32} color="#22c55e" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                  {file.name}
                </p>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: '#fff',
                    border: '1.5px solid #e8f5e9',
                    borderRadius: 40,
                    fontSize: 13,
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e8f5e9';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <X size={14} />
                  Remove file
                </button>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{
                  width: 72,
                  height: 72,
                  background: 'rgba(22,163,74,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  animation: drag ? 'pulse 1.5s infinite' : 'none',
                }}>
                  <Upload size={36} color="#16a34a" />
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                  Drop your file here
                </p>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                  or <span style={{ color: '#16a34a', fontWeight: 600 }}>click to browse</span>
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>
                  Supports JPG, PNG, PDF • Max 10MB
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              background: '#fef2f2',
              border: '1.5px solid #fee2e2',
              borderRadius: 16,
              marginBottom: 20,
            }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: '#b91c1c' }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '16px 24px',
              background: !file || loading ? '#9ca3af' : '#16a34a',
              border: 'none',
              borderRadius: 40,
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              cursor: !file || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: !file || loading ? 'none' : '0 8px 20px rgba(22,163,74,0.25)',
            }}
            onMouseEnter={e => {
              if (!loading && file) {
                e.currentTarget.style.background = '#15803d';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(22,163,74,0.35)';
              }
            }}
            onMouseLeave={e => {
              if (!loading && file) {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.25)';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Analyzing Report...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload & Analyze
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div style={{
          background: '#fff',
          border: '1.5px solid #e8f5e9',
          borderRadius: 32,
          padding: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
        }}>
          {/* Result Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
            paddingBottom: 28,
            borderBottom: '1.5px solid #e8f5e9',
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: result.detection_status === 'clean' ? 'rgba(34,197,94,0.1)' :
                         result.detection_status === 'detected' ? 'rgba(239,68,68,0.1)' :
                         'rgba(245,158,11,0.1)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {result.detection_status === 'clean' ? (
                <CheckCircle size={32} color="#22c55e" />
              ) : (
                <AlertTriangle size={32} color={result.detection_status === 'detected' ? '#ef4444' : '#f59e0b'} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                Analysis Complete
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Report ID: {result.report_id}
              </p>
            </div>
          </div>

          {/* Status Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              ['Detection Status', 
                <span style={{
                  background: result.detection_status === 'clean' ? 'rgba(34,197,94,0.1)' :
                             result.detection_status === 'detected' ? 'rgba(239,68,68,0.1)' :
                             'rgba(245,158,11,0.1)',
                  color: result.detection_status === 'clean' ? '#22c55e' :
                         result.detection_status === 'detected' ? '#ef4444' :
                         '#f59e0b',
                  padding: '6px 14px',
                  borderRadius: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  {result.detection_status}
                </span>
              ],
              ['Risk Level',
                <span style={{
                  background: result.risk_level === 'critical' ? 'rgba(239,68,68,0.1)' :
                             result.risk_level === 'high' ? 'rgba(249,115,22,0.1)' :
                             result.risk_level === 'medium' ? 'rgba(245,158,11,0.1)' :
                             'rgba(34,197,94,0.1)',
                  color: result.risk_level === 'critical' ? '#ef4444' :
                         result.risk_level === 'high' ? '#f97316' :
                         result.risk_level === 'medium' ? '#f59e0b' :
                         '#22c55e',
                  padding: '6px 14px',
                  borderRadius: 40,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}>
                  {result.risk_level || '—'}
                </span>
              ],
              ['AI Confidence',
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: '#e8f5e9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(result.ai_confidence_score || 0) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                      borderRadius: 3,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {result.ai_confidence_score != null ? `${(result.ai_confidence_score * 100).toFixed(0)}%` : '—'}
                  </span>
                </div>
              ],
              ['OCR Confidence',
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: '#e8f5e9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(result.ocr_confidence || 0) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                      borderRadius: 3,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {result.ocr_confidence != null ? `${(result.ocr_confidence * 100).toFixed(0)}%` : '—'}
                  </span>
                </div>
              ],
            ].map(([label, value]) => (
              <div key={label} style={{
                background: '#f8faf8',
                border: '1.5px solid #e8f5e9',
                borderRadius: 16,
                padding: '16px',
              }}>
                <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </p>
                {value}
              </div>
            ))}
          </div>

          {/* Detected Substances */}
          {result.detected_drugs?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                Detected Substances
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.detected_drugs.map((d, i) => (
                  <span key={i} style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: 40,
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div style={{
            background: '#f8faf8',
            border: '1.5px solid #e8f5e9',
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Clock size={18} color="#16a34a" />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Next Steps</p>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              A doctor will review this report and provide verification. You'll be notified once the review is complete.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setResult(null)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 24px',
                background: '#16a34a',
                border: 'none',
                borderRadius: 40,
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 8px 20px rgba(22,163,74,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#15803d';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(22,163,74,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.2)';
              }}
            >
              <Upload size={16} />
              Upload Another
            </button>
            <button
              onClick={() => window.location.href = '/athlete/reports'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 24px',
                background: 'transparent',
                border: '1.5px solid #16a34a',
                borderRadius: 40,
                fontSize: 15,
                fontWeight: 600,
                color: '#16a34a',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#16a34a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All Reports
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div style={{
        marginTop: 24,
        padding: 24,
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
      }}>
        {[
          { step: '01', title: 'Upload', desc: 'Upload your medical report (JPG, PNG, PDF)' },
          { step: '02', title: 'Analyze', desc: 'AI scans for 50+ WADA banned substances' },
          { step: '03', title: 'Review', desc: 'Doctor verifies results within 24 hours' },
        ].map((item) => (
          <div key={item.step}>
            <span style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#e8f5e9',
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1,
              marginBottom: 8,
              display: 'block',
            }}>
              {item.step}
            </span>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}