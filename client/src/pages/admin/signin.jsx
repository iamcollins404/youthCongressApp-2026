import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AtSign, Lock, Loader, ArrowLeft, LogIn } from 'lucide-react'
import ylogo from '../../assets/images/ylogo.png'

const CAPE_TOWN_BG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1920&q=80'

function AdminSignin() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }
    setTimeout(() => {
      sessionStorage.setItem('adminEmail', formData.email)
      setIsLoading(false)
      navigate('/admin/home')
    }, 1000)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0c0f2e', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={CAPE_TOWN_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,15,46,0.9), rgba(12,15,46,0.97))' }} />
      </div>

      {/* Orbs */}
      <div className="glow-orb glow-orb-purple" style={{ width: 300, height: 300, top: '-10%', left: '-10%' }} />
      <div className="glow-orb glow-orb-cyan" style={{ width: 250, height: 250, bottom: '-10%', right: '-10%' }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 200, height: 200, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.15 }} />

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-strong animate-scale-in" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: 'clamp(24px, 5vw, 40px)', margin: 'clamp(12px, 3vw, 16px)', borderRadius: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={ylogo} alt="Logo" style={{ height: 60, margin: '0 auto 16px', objectFit: 'contain' }} />
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>SYC2026 Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Sign in to access the dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: 12, borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#00c8ff', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <AtSign size={18} color="rgba(0,200,255,0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="admin@example.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#00c8ff', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="rgba(0,200,255,0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                placeholder="••••••••" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="btn-primary"
            style={{ width: '100%', padding: '14px 24px', fontSize: 15, opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? <><Loader size={16} style={{ display: 'inline', marginRight: 8, animation: 'spin 1s linear infinite' }} /> Signing in...</> : <><LogIn size={16} style={{ display: 'inline', marginRight: 8 }} /> Sign in</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#00c8ff'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>
            <ArrowLeft size={14} style={{ display: 'inline', marginRight: 4 }} /> Back to main site
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}

export default AdminSignin
