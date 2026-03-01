import React, { useRef, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import html2pdf from 'html2pdf.js'
import axios from 'axios'
import { ArrowLeft, Download, Loader, Frown } from 'lucide-react'
import { API_URL } from '../utils/api'
import Footer from '../components/landing/footer'
import ylogo from '../assets/images/ylogo.png'

const CAPE_TOWN_BG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1920&q=80'

function Ticket() {
  const { ticketId } = useParams()
  const ticketRef = useRef(null)
  const qrCanvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const [ticketData, setTicketData] = useState({
    ticketId: '', status: '', firstName: '', surname: '',
    email: '', contactNumber: '', conference: '', package: '',
    hoodieSize: '', registrationDate: '',
    eventName: 'Senior Youth Congress 2026',
    eventDate: '12 – 16 JUNE 2026',
    eventLocation: 'WHITE CITY MPC, SALDANHA BAY, WEST COAST'
  })

  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/tickets/${ticketId}`)
        const ticket = response.data
        let conferenceName = ticket.conference
        const confMap = {
          'ncsa': 'Northern Conference of South Africa',
          'cape-eastern': 'Cape Conference - Eastern Region',
          'cape-northern': 'Cape Conference - Northern Region',
          'cape-western': 'Cape Conference - Western Region',
          'cc-western': 'Cape Conference - Western Region',
          'cc-northern': 'Cape Conference - Northern Region',
          'cc-eastern': 'Cape Conference - Eastern Region',
          'cape': 'The Cape Conference',
        }
        conferenceName = confMap[ticket.conference] || ticket.conference
        const pkgMap = {
          'basic': 'Basic — No Pack (R450)',
          'basicPack': 'Basic Pack — Jacket (R750)',
          'halfPack': 'Half Pack — Jacket & Bag (R900)',
          'fullPack': 'Full Pack — Jacket, Bag, Cup & Socks (R1 200)',
          'withPack': 'Including Congress Pack (R750)',
          'withoutPack': 'Without Congress Pack (R450)',
        }
        const packageName = pkgMap[ticket.package] || ticket.package
        setTicketData({
          ticketId: ticket.ticketId,
          status: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
          firstName: ticket.firstName, surname: ticket.surname,
          email: ticket.email, contactNumber: ticket.contactNumber,
          conference: conferenceName, package: packageName,
          hoodieSize: ticket.hoodieSize,
          registrationDate: new Date(ticket.createdAt).toLocaleDateString(),
          eventName: 'Senior Youth Congress 2026',
          eventDate: '12 – 16 JUNE 2026',
          eventLocation: 'WHITE CITY MPC, SALDANHA BAY, WEST COAST'
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching ticket data:', err)
        setError('Failed to load ticket information. Please try again later.')
        setLoading(false)
      }
    }
    if (ticketId) fetchTicketData()
  }, [ticketId])

  useEffect(() => {
    if (qrCanvasRef.current && ticketData.ticketId) {
      const qrData = `SYC2026:${ticketData.ticketId}:${ticketData.firstName}:${ticketData.surname}:${ticketData.email}`
      QRCode.toCanvas(qrCanvasRef.current, qrData, { width: 150, margin: 2, errorCorrectionLevel: 'H' }, (err) => {
        if (err) console.error('QR Code error:', err)
      })
    }
  }, [ticketData, qrCanvasRef])

  const handleDownload = () => {
    if (!ticketData.ticketId || !qrCanvasRef.current) return
    setDownloadingPdf(true)
    const qrCodeImg = qrCanvasRef.current.toDataURL('image/png')
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = `
      <div style="background-color: #0c0f2e; color: white; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 650px; margin: 0 auto; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,200,255,0.1);">
          <div style="background: linear-gradient(135deg, #111540, #0c0f2e); padding: 20px; border-bottom: 1px solid rgba(0,200,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h1 style="font-size: 22px; font-weight: bold; margin: 0; color: white;">${ticketData.eventName}</h1>
              <div style="${statusBgStyle(ticketData.status)} padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">${ticketData.status}</div>
            </div>
            <p style="font-size: 14px; opacity: 0.6; margin-top: 8px; color: white;">${ticketData.eventDate} &bull; ${ticketData.eventLocation}</p>
          </div>
          <div style="padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #00c8ff;">Attendee Information</h2>
                ${infoRow('Full Name', `${ticketData.firstName} ${ticketData.surname}`)}
                ${infoRow('Email', ticketData.email)}
                ${infoRow('Contact', ticketData.contactNumber)}
                ${infoRow('Conference', ticketData.conference)}
              </div>
              <div>
                <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #00c8ff;">Ticket Details</h2>
                ${infoRow('Ticket ID', ticketData.ticketId)}
                ${infoRow('Package', ticketData.package)}
                ${ticketData.hoodieSize ? infoRow('Hoodie Size', ticketData.hoodieSize) : ''}
                ${infoRow('Registered', ticketData.registrationDate)}
              </div>
            </div>
            <div style="border-top: 1px solid rgba(0,200,255,0.1); padding: 20px; text-align: center;">
              <p style="opacity: 0.6; margin-bottom: 12px; color: white; font-size: 13px;">Scan this QR code at the registration desk</p>
              <div style="background: white; padding: 8px; border-radius: 8px; display: inline-block; margin-bottom: 8px;">
                <img src="${qrCodeImg}" alt="QR Code" width="150" height="150" />
              </div>
              <p style="font-family: monospace; color: #00c8ff; font-size: 14px;">${ticketData.ticketId}</p>
            </div>
          </div>
          <div style="background: linear-gradient(135deg, #0c0f2e, #111540); padding: 12px; text-align: center; border-top: 1px solid rgba(0,200,255,0.1); font-size: 12px; opacity: 0.5; color: white;">
            This ticket must be presented at the entrance. Please arrive 30 minutes before the event.
          </div>
        </div>
      </div>`
    html2pdf().from(tempDiv).set({
      margin: 10, filename: `SYC2026_Ticket_${ticketData.ticketId}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0c0f2e' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save().then(() => setDownloadingPdf(false)).catch(() => setDownloadingPdf(false))
  }

  const statusColor = (s) =>
    s === 'Pending' ? '#eab308' : s === 'Approved' ? '#10b981' : s === 'Declined' ? '#ef4444' : '#6b7280'

  return (
    <div style={{ minHeight: '100vh', background: '#0c0f2e', position: 'relative' }}>
      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src={CAPE_TOWN_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,15,46,0.9), rgba(12,15,46,0.97))' }} />
      </div>
      <div className="glow-orb glow-orb-purple" style={{ position: 'fixed', width: 300, height: 300, top: '-5%', right: '-8%' }} />
      <div className="glow-orb glow-orb-cyan" style={{ position: 'fixed', width: 200, height: 200, bottom: '5%', left: '-5%' }} />

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,15,46,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="nav-inner" style={{ height: 60 }}>
          <Link to="/"><img src={ylogo} alt="Logo" style={{ height: 48, objectFit: 'contain' }} /></Link>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px, 4vw, 32px) clamp(12px, 3vw, 16px) clamp(40px, 6vw, 64px)', maxWidth: 720, margin: '0 auto' }}>

        {/* Top bar */}
        <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, animationDelay: '0.1s', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700 }}>Your Ticket</h1>
          <button onClick={handleDownload} disabled={loading || error || downloadingPdf}
            className="btn-primary" style={{ padding: 'clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 24px)', fontSize: 'clamp(13px, 2vw, 14px)', opacity: (loading || error || downloadingPdf) ? 0.5 : 1, cursor: (loading || error || downloadingPdf) ? 'not-allowed' : 'pointer' }}>
            {downloadingPdf ? <><Loader size={14} style={{ display: 'inline', marginRight: 6, animation: 'spin 1s linear infinite' }} /> Downloading...</> : <><Download size={14} style={{ display: 'inline', marginRight: 6 }} /> Download PDF</>}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass animate-scale-in" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', animation: 'float 2s ease-in-out infinite' }}><Loader size={32} color="#00c8ff" style={{ animation: 'spin 1s linear infinite' }} /></div>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading your ticket...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass animate-scale-in" style={{ padding: 64, textAlign: 'center', borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Frown size={40} color="rgba(255,255,255,0.4)" /></div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ticket Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{error}</p>
            <Link to="/" className="btn-primary" style={{ padding: '12px 32px', fontSize: 15, textDecoration: 'none' }}>
              Return Home
            </Link>
          </div>
        )}

        {/* Ticket Card */}
        {!loading && !error && (
          <div ref={ticketRef} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-strong" style={{ overflow: 'hidden', borderRadius: 20 }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #111540, #0c0f2e)', padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)', borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <h2 style={{ color: 'white', fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, margin: 0 }}>{ticketData.eventName}</h2>
                  <span style={{
                    background: `${statusColor(ticketData.status)}22`,
                    color: statusColor(ticketData.status),
                    padding: '4px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>{ticketData.status}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(12px, 2vw, 14px)', margin: 0 }}>
                  {ticketData.eventDate} &bull; {ticketData.eventLocation}
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: 'clamp(16px, 3vw, 28px)' }}>
                <div className="ticket-body-grid" style={{ marginBottom: 28 }}>
                  <div>
                    <h3 style={{ color: '#00c8ff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Attendee</h3>
                    <InfoField label="Full Name" value={`${ticketData.firstName} ${ticketData.surname}`} />
                    <InfoField label="Email" value={ticketData.email} />
                    <InfoField label="Contact" value={ticketData.contactNumber} />
                    <InfoField label="Conference" value={ticketData.conference} />
                  </div>
                  <div>
                    <h3 style={{ color: '#00c8ff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Details</h3>
                    <InfoField label="Ticket ID" value={ticketData.ticketId} mono />
                    <InfoField label="Package" value={ticketData.package} />
                    {ticketData.hoodieSize && <InfoField label="Jacket Size" value={ticketData.hoodieSize} />}
                    <InfoField label="Registered" value={ticketData.registrationDate} />
                    <InfoField label="Status" value={ticketData.status} color={statusColor(ticketData.status)} />
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ borderTop: '1px solid rgba(0,200,255,0.1)', paddingTop: 24, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>Scan this QR code at the registration desk</p>
                  <div style={{ display: 'inline-block', background: 'white', padding: 8, borderRadius: 12, marginBottom: 8 }}>
                    <canvas ref={qrCanvasRef} width="150" height="150" />
                  </div>
                  <p style={{ color: '#00c8ff', fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>{ticketData.ticketId}</p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(135deg, #0c0f2e, #111540)', padding: '14px 28px', borderTop: '1px solid rgba(0,200,255,0.1)', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
                  This ticket must be presented at the entrance. Please arrive 30 minutes before the event.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        {!loading && !error && (
          <div className="glass animate-fade-in-up" style={{ padding: 'clamp(16px, 3vw, 28px)', marginTop: 24, animationDelay: '0.4s' }}>
            <h3 style={{ color: 'white', fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, marginBottom: 12 }}>Important Information</h3>
            <ul style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, paddingLeft: 20, margin: 0, fontSize: 'clamp(13px, 2.2vw, 15px)' }}>
              <li>Download and save your ticket as PDF for easier access during the event.</li>
              <li>Your status is <span style={{ color: statusColor(ticketData.status), fontWeight: 600 }}>{ticketData.status}</span>
                {ticketData.status === 'Pending' && ' — it will update once payment is verified.'}
              </li>
              <li>Queries? Contact <span style={{ color: '#00c8ff' }}>youthwr@cc.adventist.org</span></li>
              <li>Bring a physical or digital copy of this ticket to the registration desk.</li>
            </ul>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function InfoField({ label, value, mono, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 2 }}>{label}</p>
      <p style={{ color: color || 'white', fontSize: 15, fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit', margin: 0 }}>{value}</p>
    </div>
  )
}

function statusBgStyle(status) {
  if (status === 'Pending') return 'background-color: #eab308; color: black;'
  if (status === 'Approved') return 'background-color: #10b981; color: white;'
  if (status === 'Declined') return 'background-color: #ef4444; color: white;'
  return 'background-color: #6b7280; color: white;'
}

function infoRow(label, value) {
  return `<div style="margin-bottom: 10px;"><div style="color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 2px;">${label}</div><div style="font-size: 14px; color: white;">${value}</div></div>`
}

export default Ticket
