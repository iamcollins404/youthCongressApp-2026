import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Calendar } from 'lucide-react'
import ylogo from '../../assets/images/ylogo.png'

function Footer() {
  return (
    <footer style={{
      background: '#080b22',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 48px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)',
      }}>
        {/* Top row */}
        <div className="footer-grid" style={{ marginBottom: 'clamp(24px, 4vw, 40px)' }}>
          {/* Brand */}
          <div>
            <img src={ylogo} alt="Logo" style={{ height: 72, objectFit: 'contain', marginBottom: 16, opacity: 0.7 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.7 }}>
              Senior Youth Congress 2026 — a transformative gathering by the Western &amp; Northern Region of the Cape Conference.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Quick Links
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/register', label: 'Register' },
                { to: '/admin', label: 'Admin Portal' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 14,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#00c8ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={14} color="rgba(0,200,255,0.5)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>+27 76 652 8105</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={14} color="rgba(0,200,255,0.5)" style={{ flexShrink: 0 }} />
                <a href="mailto:youthwr@cc.adventist.org" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#00c8ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                  youthwr@cc.adventist.org
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={14} color="rgba(0,200,255,0.5)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5 }}>
                  White City MPC, 41 Trichardt Rd<br />Saldanha Bay, West Coast
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={14} color="rgba(0,200,255,0.5)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>12 – 16 June 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 20 }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>
            &copy; 2026 Western &amp; Northern Region of the Cape Conference &middot; Seventh-day Adventist Church
          </p>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, margin: 0 }}>
            Theme: Connected
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
