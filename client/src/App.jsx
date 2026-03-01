import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import Index from './pages/index'
import Ticket from './pages/ticket'
import Register from './pages/register'
import AdminSignin from './pages/admin/signin'
import AdminHome from './pages/admin/home'
import AdminTickets from './pages/admin/tickets'
import AdminDuplicates from './pages/admin/duplicates'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 999,
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(0,200,255,0.35)',
        background: 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,102,238,0.2))',
        backdropFilter: 'blur(16px)',
        color: '#00c8ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,200,255,0.25), 0 0 20px rgba(0,200,255,0.1)',
        transition: 'opacity 0.35s, transform 0.35s, box-shadow 0.25s, border-color 0.25s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.8)',
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.3), rgba(0,102,238,0.35))'
        e.currentTarget.style.borderColor = 'rgba(0,200,255,0.6)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,200,255,0.35), 0 0 30px rgba(0,200,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,102,238,0.2))'
        e.currentTarget.style.borderColor = 'rgba(0,200,255,0.35)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,200,255,0.25), 0 0 20px rgba(0,200,255,0.1)'
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
      }}
    >
      <ArrowUp size={28} strokeWidth={2.5} />
    </button>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#0c0f2e' }}>
        <ScrollToTop />
        <BackToTopButton />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/ticket/:ticketId" element={<Ticket />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminSignin />} />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/duplicates" element={<AdminDuplicates />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App