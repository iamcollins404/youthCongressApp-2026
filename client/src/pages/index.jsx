import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, X, Calendar, MapPin, Users, Mic, Flame, Music,
  Lightbulb, Handshake, ChevronDown, Hotel, Package, Check
} from 'lucide-react'
import useReveal from '../utils/useReveal'
import Footer from '../components/landing/footer'
import LogoWatermarks from '../components/landing/LogoWatermarks'
import ylogo from '../assets/images/ylogo.png'

import psLaing from '../assets/newImages/pslang.jpeg'
import heavenlyStrings from '../assets/newImages/heavenlystrings.jpeg'
import chosen from '../assets/newImages/choosen.jpeg'
import asOne from '../assets/newImages/oneMusic.jpeg'
import celestialChord from '../assets/newImages/celestialChord.jpeg'
import fiveStones from '../assets/newImages/fiveStones.jpeg'
import gumboFamily from '../assets/newImages/gumboFamily.jpeg'
import pastorSeb from '../assets/newImages/pastorSeb.jpeg'
import pastorNhlanhla from '../assets/newImages/pastorNhlanhla.jpeg'
import pastorReece from '../assets/newImages/pastorReece.jpeg'
import pastorEugene from '../assets/newImages/pastoreugiene.jpeg'
import pastorXanti from '../assets/newImages/pastorXanti.jpeg'
import obeyChimuka from '../assets/newImages/obeyChimuka.jpeg'
import pastorAubrey from '../assets/newImages/pastoraubrey .jpeg'

const CAPE_TOWN_BG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1920&q=80'

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'welcome', label: 'Welcome' },
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
      <LogoWatermarks src={ylogo} />

      {/* ─── NAVBAR ─── */}
      <nav
        ref={navRef}
        className={navSolid ? 'nav-scrolled' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'all 0.4s',
          background: navSolid ? 'rgba(12,15,46,0.95)' : 'transparent',
          backdropFilter: navSolid ? 'blur(16px)' : 'none',
          borderBottom: navSolid ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div className="nav-inner">
          {/* Mobile: Menu button on top of logo */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="nav-mobile-menu-btn"
            style={{
              alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 50,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#00c8ff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.02em',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,200,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="nav-menu-text">Menu</span>
          </button>
          <Link to="/" className="max-sm:flex max-sm:justify-center max-sm:w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={ylogo} alt="Logo" className="logo-mobile-big max-sm:block max-sm:mx-auto max-sm:mt-3" style={{ height: 48, objectFit: 'contain' }} />
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
          <div className="animate-fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 'clamp(24px, 5vw, 40px)', animationDelay: '0.8s' }}>
            <span className="glass-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 20px)', borderRadius: 50, fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
              <Calendar size={16} color="#00c8ff" style={{ flexShrink: 0 }} />
              <strong style={{ color: 'white' }}>12 – 16 June 2026</strong>
            </span>
            <span className="glass-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 20px)', borderRadius: 50, fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
              <MapPin size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>Saldanha, West Coast, Cape Town</span>
            </span>
          </div>

          <div className="animate-fade-in-up flex flex-wrap justify-center gap-3 max-sm:flex-col max-sm:items-center sm:gap-3" style={{ animationDelay: '1.1s' }}>
            <Link
              to="/register"
              className="btn-primary w-full max-sm:max-w-[280px] sm:w-auto text-center"
              style={{
                fontSize: 'clamp(15px, 2.5vw, 18px)',
                padding: 'clamp(12px, 2vw, 16px) clamp(28px, 5vw, 40px)',
              }}
            >
              Register Now
            </Link>
            <button
              onClick={() => scrollTo('about')}
              className="btn-ghost w-full max-sm:max-w-[280px] sm:w-auto"
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

      {/* ═══════════════ WELCOME FROM PS LAING ═══════════════ */}
      <Section id="welcome" bg="#111540">
        <div className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionTitle>Welcome from the Event Director</SectionTitle>
          <div className="glass" style={{ padding: 'clamp(24px, 4vw, 40px)', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ width: 100, height: 100, margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(0,200,255,0.2)' }}>
              <img src={psLaing} alt="Pastor Brinton Laing" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
            <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Pastor Brinton Laing</h3>
            <p style={{ color: '#00c8ff', fontSize: 14, fontWeight: 600, marginBottom: 28 }}>Event Director</p>
            <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(15px, 2.2vw, 17px)', lineHeight: 1.85 }}>
              <p style={{ marginBottom: 20 }}>
                Welcome to Congress 2026 themed &ldquo;Connected.&rdquo; In a world where it is easy to feel distracted, distant, or disconnected, this weekend is an invitation to draw closer — closer to God and closer to one another. We gather here not by accident, but by divine purpose, believing that when we stay connected to Christ, our lives are strengthened, guided, and transformed.
              </p>
              <p style={{ marginBottom: 20 }}>
                Jesus reminds us in John 15:5, &ldquo;I am the vine; you are the branches. If you remain in Me and I in you, you will bear much fruit; apart from Me you can do nothing.&rdquo; This powerful promise assures us that true growth, strength, and purpose come from staying connected to Him. As we worship, learn, and fellowship together, may we experience what it truly means to remain in Christ.
              </p>
              <p style={{ marginBottom: 0 }}>
                May this weekend deepen your connection with God, build meaningful friendships, and remind you that you are part of something bigger than yourself. You belong. You matter. And together, as we stay connected to the True Vine, we will grow, thrive, and shine for His glory. Welcome — this weekend is for you!
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ WELCOME FROM PASTOR MABENGE ═══════════════ */}
      <Section>
        <div className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionTitle>Welcome from Pastor Mabenge</SectionTitle>
          <div className="glass" style={{ padding: 'clamp(24px, 4vw, 40px)', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ width: 100, height: 100, margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(0,200,255,0.2)' }}>
              <img src={pastorXanti} alt="Pastor Xanti Mabenge" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Pastor Xanti Mabenge</h3>
            <p style={{ color: '#00c8ff', fontSize: 14, fontWeight: 600, marginBottom: 28 }}>Event Leadership</p>
            <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(15px, 2.2vw, 17px)', lineHeight: 1.85 }}>
              <p style={{ marginBottom: 20 }}>
                Charles Dickens: &ldquo;It was the best of times, it was the worst of times.&rdquo; What a time to be alive! For a time such as this you are a young person of purpose, you stand enabled by grace!
              </p>
              <p style={{ marginBottom: 20 }}>
                &ldquo;Greater is He that&rsquo;s in you than he who is in the world.&rdquo; &ldquo;For God has not given you a spirit of fear but of power.&rdquo;
              </p>
              <p style={{ marginBottom: 20 }}>
                Remember, the longer you stay on the wrong train, the more expensive the cost to return…. Could this be the time to get off the wrong train young person? Welcome to the youth congress 2026 🥳
              </p>
              <p style={{ marginBottom: 20 }}>
                Join us in an atmosphere that is intentionally curated for your spiritual needs, seamlessly coordinated and impactful through worship and prayer. Our end game is to leave you connected to the source, Jesus!
              </p>
              <p style={{ marginBottom: 0 }}>
                No matter the terrain that you may have traversed to get into 2026 oksalayo you are here and you are within, alive and able to still choose your first love! May grace locate you and enable you to stay connected!
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ WHAT TO EXPECT ═══════════════ */}
      <Section>
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
            { name: 'Pastor Sebastian Braxston', role: 'Speaker', highlight: true, img: pastorSeb, imgPosition: 'center 20%' },
            { name: 'Pastor Nhlanhla Buthelezi', role: 'Speaker', img: pastorNhlanhla, imgPosition: '35% 25%' },
            { name: 'Pastor Reece Anderson', role: 'Speaker', img: pastorReece, imgPosition: 'center' },
            { name: 'Pastor Eugene Carolus', role: 'Speaker', img: pastorEugene, imgPosition: '65% 25%' },
            { name: 'Elder Obey Chimuka', role: 'Speaker', img: obeyChimuka },
            { name: 'Pastor Aubrey John Devilliers', role: 'Speaker', img: pastorAubrey },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: 28, textAlign: 'center', border: s.highlight ? '1px solid rgba(0,200,255,0.3)' : undefined }}>
              <div style={{
                width: 80, height: 80, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden',
                background: s.img ? 'transparent' : (s.highlight ? 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,102,238,0.2))' : 'rgba(255,255,255,0.05)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(0,200,255,0.15)',
              }}>
                {s.img ? <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.imgPosition || 'center' }} /> : <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)' }}>{s.name.split(' ').map(w => w[0]).join('')}</span>}
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
            { name: 'Pastor Brinton Laing', role: 'Event Director', img: psLaing, imgPosition: 'center top' },
            { name: 'Pastor Xanti Mabenge', role: 'Event Leadership', img: pastorXanti },
          ].map((d, i) => (
            <div key={i} className="glass" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden',
                border: '2px solid rgba(0,200,255,0.15)',
                background: d.img ? 'transparent' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {d.img
                  ? <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: d.imgPosition || 'center' }} />
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
          {[
            { name: 'Chosen SG', img: chosen },
            { name: 'Heavenly Strings', img: heavenlyStrings },
            { name: 'Five Stones', img: fiveStones, imgFit: 'contain' },
            { name: 'As one Music Ministry', img: asOne },
            { name: 'Celestial Chord', img: celestialChord },
            { name: 'Gumbo Family', img: gumboFamily },
          ].map((g, i) => (
            <div key={i} className="glass singing-card">
              <div className="singing-card-image-wrap">
                {g.img ? (
                  <img src={g.img} alt={g.name} className="singing-card-img" style={g.imgFit ? { objectFit: g.imgFit } : undefined} />
                ) : (
                  <span className="singing-card-placeholder">
                    <Music size={48} color="#00c8ff" />
                  </span>
                )}
              </div>
              <h3 className="singing-card-title">{g.name}</h3>
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
            { name: 'Half Pack', price: 'R950', desc: 'Jacket & Bag', items: ['Everything in Basic', 'Congress Jacket', 'Congress Bag'], highlight: false },
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
          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 8 }}>Ps Mabenge</h4>
            <p style={{ color: '#00c8ff', fontWeight: 600, marginBottom: 4 }}>+27 73 101 7657</p>
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
