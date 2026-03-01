import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, X, Calendar, MapPin, Users, Mic, Flame, Music,
  Lightbulb, Handshake, ChevronDown, Hotel, Package, Check
} from 'lucide-react'
import useReveal from '../utils/useReveal'
import Footer from '../components/landing/footer'
import ylogo from '../assets/images/ylogo.png'

import brin from '../assets/images/brin.jpg'

const CAPE_TOWN_BG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1920&q=80'

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'speakers', label: 'Speakers' },
  { id: 'contact', label: 'Contact' },
]

function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [navSolid, setNavSolid] = useState(false)
  const navRef = useRef(null)

  useReveal()

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      setNavSolid(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <div style={{ background: '#0c0f2e', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ─── */}
      <nav
        ref={navRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'all 0.4s',
          background: navSolid ? 'rgba(12,15,46,0.95)' : 'transparent',
          backdropFilter: navSolid ? 'blur(16px)' : 'none',
          borderBottom: navSolid ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div className="nav-inner">
          <Link to="/">
            <img src={ylogo} alt="Logo" style={{ height: 52, objectFit: 'contain' }} />
          </Link>

          {/* Desktop nav links */}
          <div className="nav-desktop">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#00c8ff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >
                {l.label}
              </button>
            ))}
            <Link
              to="/register"
              className="btn-primary"
              style={{ fontSize: 14, padding: '10px 24px' }}
            >
              Register Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="nav-mobile-btn"
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#00c8ff', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,200,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className="nav-mobile-dropdown"
          style={{
            maxHeight: isMenuOpen ? 400 : 0,
            overflow: 'hidden', transition: 'max-height 0.35s ease',
            background: 'rgba(12,15,46,0.97)',
            borderTop: isMenuOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}
        >
          <div style={{ padding: '16px 24px' }}>
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.8)', padding: '12px 0', fontSize: 16,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {l.label}
              </button>
            ))}
            <Link
              to="/register"
              style={{
                display: 'block', textAlign: 'center', marginTop: 16,
                background: 'linear-gradient(135deg, #00c8ff, #0066ee)',
                color: 'white', fontWeight: 700, padding: '14px 24px',
                borderRadius: 50, textDecoration: 'none',
              }}
            >
              Register Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* BG image */}
        <img src={CAPE_TOWN_BG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(12,15,46,0.75) 0%, rgba(20,22,68,0.55) 40%, rgba(12,15,46,0.85) 100%)',
        }} />

        {/* Orbs */}
        <div className="glow-orb glow-orb-purple" style={{ width: 350, height: 350, top: '-5%', left: '-5%' }} />
        <div className="glow-orb glow-orb-cyan" style={{ width: 250, height: 250, top: '10%', right: '5%' }} />
        <div className="glow-orb glow-orb-blue" style={{ width: 200, height: 200, bottom: '15%', left: '10%' }} />

        {/* Content */}
        <div className="hero-content" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
          <p className="animate-fade-in" style={{ color: '#00c8ff', fontSize: 'clamp(10px, 2vw, 12px)', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16, opacity: 0.9, animationDelay: '0.2s' }}>
            Western &amp; Northern Region of the Cape Conference presents
          </p>

          <h1 className="animate-fade-in-up" style={{ margin: '0 0 16px', animationDelay: '0.4s' }}>
            <span className="font-display" style={{ display: 'block', fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 900, color: 'white', lineHeight: 0.85, letterSpacing: '-0.02em' }}>
              SENIOR YOUTH
            </span>
            <span className="font-display" style={{ display: 'block', fontSize: 'clamp(40px, 8vw, 80px)', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              Congress
            </span>
          </h1>

          {/* CONNECTED */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24, animationDelay: '0.6s' }}>
            <div style={{ height: 2, width: 48, background: 'linear-gradient(to right, transparent, #00c8ff)' }} />
            <span style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 900, letterSpacing: '0.25em', color: 'white', textTransform: 'uppercase' }}>
              Connected
            </span>
            <div style={{ height: 2, width: 48, background: 'linear-gradient(to left, transparent, #00c8ff)' }} />
          </div>

          {/* Date + location */}
          <div className="animate-fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 24, animationDelay: '0.8s' }}>
            <span className="glass-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 20px)', borderRadius: 50, fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
              <Calendar size={16} color="#00c8ff" style={{ flexShrink: 0 }} />
              <strong style={{ color: 'white' }}>12 – 16 June 2026</strong>
            </span>
            <span className="glass-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 20px)', borderRadius: 50, fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
              <MapPin size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>Saldanha, West Coast, Cape Town</span>
            </span>
          </div>

          <p className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: 'clamp(24px, 5vw, 40px)', animationDelay: '1s' }}>
            With <span style={{ color: 'white', fontWeight: 600 }}>Pastor Sebastian Braxton</span>{' '}
            <span style={{ color: 'rgba(0,200,255,0.6)' }}>(USA)</span>
          </p>

          <div className="animate-fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, animationDelay: '1.1s' }}>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                fontSize: 'clamp(15px, 2.5vw, 18px)',
                padding: 'clamp(12px, 2vw, 16px) clamp(28px, 5vw, 40px)',
              }}
            >
              Register Now
            </Link>
            <button
              onClick={() => scrollTo('about')}
              className="btn-ghost"
              style={{
                fontSize: 'clamp(15px, 2.5vw, 18px)',
                padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
              }}
            >
              Learn More <ChevronDown size={18} style={{ display: 'inline' }} />
            </button>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #0c0f2e, transparent)', zIndex: 5 }} />
      </section>

      {/* ═══════════════ ABOUT ═══════════════ */}
      <Section id="about">
        <div className="reveal">
          <SectionTitle>About the Congress</SectionTitle>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.8, maxWidth: 720, margin: '0 auto 48px', textAlign: 'center' }}>
            The Senior Youth Congress 2026 is a transformative gathering that brings youth together through a
            collaboration between the Western &amp; Northern Region of the Cape Conference of the Seventh-day Adventist
            Church in South Africa. This five-day event in beautiful Saldanha on the West Coast will inspire, equip and
            empower the youthful generation for Youth Ministries in preparation for the 2nd coming of our Lord Jesus Christ.
          </p>
        </div>
        <div className="reveal-stagger stats-grid">
          {[
            { num: '1200+', label: 'Expected Attendees', Icon: Users },
            { num: '6+', label: 'Speakers', Icon: Mic },
            { num: '5', label: 'Days of Impact', Icon: Flame },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><s.Icon size={28} color="#00c8ff" /></div>
              <div className="text-gradient-cyan" style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ WHAT TO EXPECT ═══════════════ */}
      <Section bg="#111540">
        <div className="reveal"><SectionTitle>What to Expect</SectionTitle></div>
        <div className="reveal-stagger expect-grid">
          {[
            { Icon: Music, title: 'Dynamic Worship', desc: 'Experience powerful worship sessions led by talented musicians and international speakers.' },
            { Icon: Lightbulb, title: 'Entrepreneurial Worship', desc: 'Explore the intersection of faith and business through our entrepreneurial worship workshops.' },
            { Icon: Handshake, title: 'Networking', desc: 'Connect with like-minded youth leaders from across conferences and regions.' },
          ].map((f, i) => (
            <div key={i} className="glass" style={{ padding: 32, textAlign: 'left' }}>
              <div style={{ marginBottom: 12 }}><f.Icon size={36} color="#00c8ff" /></div>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ SCHEDULE ═══════════════ */}
      <Section id="schedule">
        <div className="reveal"><SectionTitle>Event Schedule</SectionTitle></div>
        <div className="reveal-stagger" style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { day: 'Fri 12 June', title: 'Opening Ceremony', time: '18:00 – 21:00' },
            { day: 'Sat 13 June', title: 'Sabbath Worship & Workshops', time: '09:00 – 17:00' },
            { day: 'Sun 14 June', title: 'Workshops & Training', time: '09:00 – 17:00' },
            { day: 'Mon 15 June', title: 'Community Service & Social', time: '10:00 – 20:00' },
            { day: 'Tue 16 June', title: 'Closing Ceremony', time: '09:00 – 13:00' },
          ].map((item, i) => (
            <div key={i} className="glass" style={{ padding: 'clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ color: '#00c8ff', fontSize: 'clamp(11px, 2vw, 12px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.day}</span>
                <h3 style={{ color: 'white', fontSize: 'clamp(15px, 2.5vw, 17px)', fontWeight: 600, marginTop: 2 }}>{item.title}</h3>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 'clamp(12px, 2vw, 13px)', whiteSpace: 'nowrap' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ SPEAKERS ═══════════════ */}
      <Section id="speakers" bg="#111540">
        <div className="reveal"><SectionTitle>Featured Speakers</SectionTitle></div>
        <div className="reveal-stagger speakers-grid">
          {[
            { name: 'Ps Sebastian Braxton', role: 'Main Speaker (USA)', highlight: true },
            { name: 'Ps Benjamin McKenzie', role: 'Speaker' },
            { name: 'Ps Nhlahla Buthelezi', role: 'Speaker' },
            { name: 'Ps Reece Anderson', role: 'Speaker' },
            { name: 'Dr Platts', role: 'Speaker' },
            { name: 'Mr Obey Chimuka', role: 'Speaker' },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: 28, textAlign: 'center', border: s.highlight ? '1px solid rgba(0,200,255,0.3)' : undefined }}>
              <div style={{
                width: 80, height: 80, margin: '0 auto 16px', borderRadius: '50%',
                background: s.highlight ? 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,102,238,0.2))' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(0,200,255,0.15)',
              }}>
                <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)' }}>{s.name.split(' ').map(w => w[0]).join('')}</span>
              </div>
              <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.name}</h3>
              <p style={{ color: s.highlight ? '#00c8ff' : 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: 13 }}>{s.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ HOST DIRECTORS ═══════════════ */}
      <Section>
        <div className="reveal"><SectionTitle>Event Leadership</SectionTitle></div>
        <div className="reveal-stagger leaders-grid">
          {[
            { name: 'Pastor Brinton Laing', role: 'Event Director', img: brin },
            { name: 'Bro Prince', role: 'Youth Congress Coordinator' },
          ].map((d, i) => (
            <div key={i} className="glass" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden',
                border: '2px solid rgba(0,200,255,0.15)',
                background: d.img ? 'transparent' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {d.img
                  ? <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.35)' }}>{d.name.split(' ').map(w => w[0]).join('')}</span>
                }
              </div>
              <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{d.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{d.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ SINGING GROUPS ═══════════════ */}
      <Section bg="#111540">
        <div className="reveal"><SectionTitle>Featured Singing Groups</SectionTitle></div>
        <div className="reveal-stagger singing-grid">
          {['Chosen SG', 'Heavenly Strings', 'Five Stones', 'As One', 'Celestial Chord'].map((name, i) => (
            <div key={i} className="glass" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
                background: 'rgba(0,200,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(0,200,255,0.12)',
              }}>
                <Music size={24} color="#00c8ff" />
              </div>
              <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{name}</h3>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ LOCATION ═══════════════ */}
      {/* ═══════════════ PACKAGES ═══════════════ */}
      <Section>
        <div className="reveal"><SectionTitle>Registration Packages</SectionTitle></div>
        <div className="reveal-stagger packages-grid">
          {[
            { name: 'Basic', price: 'R450', desc: 'Registration without a pack', items: ['Congress access', 'All sessions', 'Meals on premises'] },
            { name: 'Basic Pack', price: 'R750', desc: 'Registration with Jacket', items: ['Everything in Basic', 'Congress Jacket'], highlight: false },
            { name: 'Half Pack', price: 'R900', desc: 'Jacket & Bag', items: ['Everything in Basic', 'Congress Jacket', 'Congress Bag'], highlight: false },
            { name: 'Full Pack', price: 'R1200', desc: 'Jacket, Bag, Cup & Socks', items: ['Everything in Basic', 'Congress Jacket', 'Congress Bag', 'Stately Cup', 'Congress Socks'], highlight: true },
          ].map((pkg, i) => (
            <div
              key={i}
              className={`pricing-card glass ${pkg.highlight ? 'pricing-card-highlight' : ''}`}
              style={{
                padding: 'clamp(24px, 3vw, 32px)',
                textAlign: 'center',
                position: 'relative',
                borderRadius: 16,
                border: pkg.highlight ? '1px solid rgba(0,200,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: pkg.highlight ? '0 0 32px rgba(0,200,255,0.1)' : '0 4px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              }}
            >
              {pkg.highlight && (
                <span style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #00c8ff, #0066ee)', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '6px 18px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  boxShadow: '0 4px 16px rgba(0,200,255,0.3)',
                }}>Best Value</span>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <Package size={28} color={pkg.highlight ? '#00c8ff' : 'rgba(255,255,255,0.5)'} strokeWidth={1.5} />
              </div>
              <h3 style={{ color: 'white', fontSize: 'clamp(18px, 2.5vw, 20px)', fontWeight: 700, marginBottom: 6, marginTop: pkg.highlight ? 4 : 0 }}>{pkg.name}</h3>
              <div className="text-gradient-cyan" style={{ fontSize: 'clamp(32px, 4vw, 40px)', fontWeight: 900, marginBottom: 6, letterSpacing: '-0.02em' }}>{pkg.price}</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 20, lineHeight: 1.4 }}>{pkg.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                {pkg.items.map((item, j) => (
                  <li key={j} style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 14,
                    padding: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderTop: j ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <Check size={16} color="#00c8ff" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ LOCATION ═══════════════ */}
      <Section bg="#111540">
        <div className="glass reveal-scale" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 3vw, 32px)', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
            <MapPin size={40} color="#f87171" strokeWidth={1.5} />
          </div>
          <h2 style={{ color: 'white', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, marginBottom: 8 }}>White City Multi Purpose Center</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: 4 }}>41 Trichardt Road, Saldanha Bay</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(13px, 2.3vw, 15px)', marginBottom: 16 }}>West Coast, Cape Town, South Africa</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,200,255,0.1)', color: '#00c8ff', fontWeight: 700,
              padding: '8px 20px', borderRadius: 50, fontSize: 14,
            }}>
              <Calendar size={14} style={{ flexShrink: 0 }} /> 12 – 16 June 2026
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,200,255,0.06)', color: 'rgba(255,255,255,0.5)', fontWeight: 500,
              padding: '8px 20px', borderRadius: 50, fontSize: 14,
            }}>
              <Hotel size={14} style={{ flexShrink: 0 }} /> Accommodation at Saldanha Holiday Resort
            </span>
          </div>
        </div>
      </Section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <Section id="contact">
        <div className="reveal"><SectionTitle>Get in Touch</SectionTitle></div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, textAlign: 'center', marginBottom: 32 }}>
          Have questions about the Congress? We're here to help!
        </p>
        <div className="reveal-stagger contact-grid">
          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 8 }}>Pastor Brinton Laing</h4>
            <p style={{ color: '#00c8ff', fontWeight: 600, marginBottom: 4 }}>+27 76 652 8105</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>youthwr@cc.adventist.org</p>
          </div>
          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 8 }}>Gloria Yako</h4>
            <p style={{ color: '#00c8ff', fontWeight: 600, marginBottom: 4 }}>+27 79 575 6977</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>youthwr@cc.adventist.org</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <a href="mailto:youthwr@cc.adventist.org" className="btn-primary" style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)',
          }}>
            Email Us
          </a>
          <Link to="/register" className="btn-ghost" style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)',
          }}>
            Register Now
          </Link>
        </div>
      </Section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="section-responsive" style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={CAPE_TOWN_BG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.3)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,15,46,0.7)' }} />
        <div className="glow-orb glow-orb-cyan" style={{ width: 200, height: 200, top: '-10%', left: '30%', opacity: 0.3 }} />
        <div className="reveal" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 700, marginBottom: 16 }}>Ready to be Connected?</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(15px, 2.5vw, 18px)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Secure your spot at the Senior Youth Congress 2026 in beautiful Saldanha, Cape Town.
          </p>
          <Link to="/register" className="btn-primary" style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            padding: 'clamp(14px, 2vw, 18px) clamp(32px, 5vw, 48px)',
            fontWeight: 900,
          }}>
            Register Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ─── Reusable section wrapper ─── */
function Section({ id, bg, children }) {
  return (
    <section id={id} className="section-responsive" style={{ position: 'relative', background: bg || '#0c0f2e', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </section>
  )
}

/* ─── Reusable section title ─── */
function SectionTitle({ children }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h2 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, marginBottom: 12 }}>{children}</h2>
      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #00c8ff, #0066ee)', margin: '0 auto', borderRadius: 4 }} />
    </div>
  )
}

export default Index
