import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/admin/home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/tickets', label: 'Tickets', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { to: '/admin/duplicates', label: 'Duplicates', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

export default function AdminNavbar({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  const linkClass = (path) => {
    const isActive = location.pathname === path
    return `px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
      isActive ? 'text-white bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'
    }`
  }

  const NavLinks = () => (
    <>
      {navLinks.map(({ to, label, icon }) => (
        <Link key={to} to={to} className={linkClass(to)} onClick={() => setDrawerOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
          {label}
        </Link>
      ))}
    </>
  )

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0c0f2e]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/home" className="text-white text-xl font-bold tracking-tight hover:text-[#00c8ff] transition-colors">
                SYC2026 <span className="text-[#00c8ff]">Admin</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                <NavLinks />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile menu button - matches landing page */}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="sm:hidden flex items-center justify-center"
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#00c8ff', cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,200,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              >
                {drawerOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              {/* Sign out - hidden on mobile (in drawer) */}
              <div className="hidden sm:block border-l border-white/10 pl-4">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 border border-red-600 transition-colors"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-72 max-w-[85vw] bg-[#0c0f2e] border-l border-white/10 shadow-2xl sm:hidden transform transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-white font-bold">Menu</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col p-4 gap-1">
            <NavLinks />
          </div>
          <div className="mt-auto p-4 border-t border-white/10">
            <button
              onClick={() => { setDrawerOpen(false); onLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 border border-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
