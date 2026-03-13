import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Shield, MessageSquare, Sparkles } from 'lucide-react'
import axiosInstance from '../api/axios'

const SUGGESTIONS = [
  'Is nandrolone banned?',
  'What are the side effects of EPO?',
  'What does WADA stand for?',
  'What substances are prohibited?',
  'Is testosterone allowed in sports?',
]

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: 'Hello! I am the DrugShield AI assistant. I can answer questions about banned substances, WADA rules, anti-doping policies, and health risks. How can I help you?' 
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }))
      const { data } = await axiosInstance.post('/chatbot/chat', { message: msg, history })
      setMessages(prev => [...prev, {
        role: 'assistant', 
        text: data.reply,
        drugs: data.relevant_drugs,
        confidence: data.confidence,
      }])
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div style={{ 
      maxWidth: 800, 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column',
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
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .message-enter {
          animation: slideIn 0.3s ease;
        }
        .suggestion-chip {
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 13px;
          background: #fff;
          border: 1.5px solid #e8f5e9;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .suggestion-chip:hover {
          border-color: #16a34a;
          color: #16a34a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(22,163,74,0.1);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 24,
        padding: '20px 24px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(22,163,74,0.2)',
        }}>
          <Bot size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0d1f0d',
            fontFamily: '"Playfair Display", serif',
            marginBottom: 4,
          }}>
            DrugShield AI Assistant
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            Ask about banned substances, WADA rules, anti-doping policies
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: '#f0fdf4',
          border: '1.5px solid #e8f5e9',
          borderRadius: 40,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Online</span>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          animation: 'fadeUp 0.4s ease',
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="suggestion-chip"
              style={{ animation: `slideIn 0.3s ease ${i * 0.1}s both` }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages Container */}
      <div style={{
        flex: 1,
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 24,
        padding: 24,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="message-enter"
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {m.role === 'assistant' && (
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#f0fdf4',
                border: '1.5px solid #e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={16} color="#16a34a" />
              </div>
            )}
            
            <div style={{ maxWidth: '70%' }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: m.role === 'user' ? '#16a34a' : '#f8faf8',
                border: m.role === 'user' ? 'none' : '1.5px solid #e8f5e9',
                boxShadow: m.role === 'user' ? '0 8px 16px rgba(22,163,74,0.15)' : 'none',
              }}>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: m.role === 'user' ? '#fff' : '#374151',
                }}>
                  {m.text}
                </p>
              </div>

              {/* Drug mentions */}
              {m.drugs?.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 8,
                }}>
                  {m.drugs.map((d, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#ef4444',
                        borderRadius: 40,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {/* Confidence score */}
              {m.confidence && m.role === 'assistant' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                }}>
                  <Sparkles size={12} color="#9ca3af" />
                  <span style={{
                    fontSize: 10,
                    color: '#6b7280',
                    fontFamily: 'monospace',
                  }}>
                    {(m.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#f3f4f6',
                border: '1.5px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={16} color="#6b7280" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#f0fdf4',
              border: '1.5px solid #e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={16} color="#16a34a" />
            </div>
            <div style={{
              padding: '12px 18px',
              background: '#f8faf8',
              border: '1.5px solid #e8f5e9',
              borderRadius: '20px 20px 20px 4px',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#16a34a',
                      animation: 'pulse 1s infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginTop: 16,
        background: '#fff',
        border: '1.5px solid #e8f5e9',
        borderRadius: 60,
        padding: 4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}>
        <input
          placeholder="Ask about banned substances, WADA rules..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          style={{
            flex: 1,
            padding: '14px 20px',
            border: 'none',
            background: 'transparent',
            fontSize: 14,
            color: '#111827',
            outline: 'none',
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 24px',
            background: !input.trim() || loading ? '#9ca3af' : '#16a34a',
            border: 'none',
            borderRadius: 40,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (!loading && input.trim()) {
              e.currentTarget.style.background = '#15803d';
              e.currentTarget.style.transform = 'translateX(2px)';
            }
          }}
          onMouseLeave={e => {
            if (!loading && input.trim()) {
              e.currentTarget.style.background = '#16a34a';
              e.currentTarget.style.transform = 'translateX(0)';
            }
          }}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  )
}