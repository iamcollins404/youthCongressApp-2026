import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, AlertTriangle, User, ShieldAlert, Package,
  FileText, Upload, CheckCircle, Loader
} from 'lucide-react'
import { API_URL } from '../utils/api'
import Footer from '../components/landing/footer'
import ylogo from '../assets/images/ylogo.png'

const CAPE_TOWN_BG = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1920&q=80'
const UPLOAD_URL = `${API_URL.replace(/\/api\/?$/, '')}/api/uploads/file`

function Register() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState({ passportPhoto: false, paymentProof: false })

  const [form, setForm] = useState({
    firstName: '', surname: '', email: '', contactNumber: '',
    conference: '', churchOrOrganization: '', gender: '', age: '',
    delegateType: '', emergencyContactName: '', emergencyContactNumber: '',
    package: 'basicPack', hoodieSize: '', churchInsured: 'true',
  })

  const [uploadedFiles, setUploadedFiles] = useState({ passportPhoto: null, paymentProof: null })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleFileUpload = async (file, type) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File must be 5 MB or less.'); return }
    if (type === 'passportPhoto' && !file.type.startsWith('image/')) { setError('Passport photo must be an image.'); return }
    if (type === 'paymentProof') {
      const ok = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!ok.some((t) => file.type.startsWith(t) || file.type.includes(t))) { setError('Payment proof must be image, PDF or Word.'); return }
    }
    setUploading((p) => ({ ...p, [type]: true }))
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(UPLOAD_URL, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data?.success && res.data?.file?.url) {
        setUploadedFiles((p) => ({ ...p, [type]: { url: res.data.file.url, name: file.name } }))
      } else { setError('Upload failed.') }
    } catch (err) { setError(err.response?.data?.message || 'Upload failed.') }
    finally { setUploading((p) => ({ ...p, [type]: false })) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const required = ['firstName', 'surname', 'email', 'contactNumber', 'conference', 'gender', 'package']
    const missing = required.filter((f) => !form[f]?.trim())
    if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return }
    const packagesNeedingSize = ['basicPack', 'halfPack', 'fullPack', 'withPack']
    if (packagesNeedingSize.includes(form.package) && !form.hoodieSize) { setError('Please select a jacket size.'); return }
    if (!uploadedFiles.passportPhoto?.url) { setError('Please upload a passport photo.'); return }
    if (!uploadedFiles.paymentProof?.url) { setError('Please upload payment proof.'); return }

    setSubmitting(true)
    try {
      const payload = {
        ...form, age: form.age ? Number(form.age) : undefined,
        churchOrOrganization: form.churchOrOrganization || undefined,
        delegateType: form.delegateType || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactNumber: form.emergencyContactNumber || undefined,
        passportPhotoUrl: uploadedFiles.passportPhoto.url,
        paymentProofUrl: uploadedFiles.paymentProof.url,
      }
      const res = await axios.post(`${API_URL}/tickets/new`, payload)
      if (res.data?.success && res.data?.ticketId) { navigate(`/ticket/${res.data.ticketId}`); return }
      setError(res.data?.message || 'Registration failed.')
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setSubmitting(false) }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }
  const requiredStar = { color: '#f87171' }

  return (
    <div style={{ minHeight: '100vh', background: '#0c0f2e', position: 'relative' }}>
      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src={CAPE_TOWN_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,15,46,0.85), rgba(12,15,46,0.95))' }} />
      </div>

      {/* Orbs */}
      <div className="glow-orb glow-orb-purple" style={{ position: 'fixed', width: 300, height: 300, top: '-5%', left: '-8%' }} />
      <div className="glow-orb glow-orb-cyan" style={{ position: 'fixed', width: 200, height: 200, bottom: '10%', right: '-5%' }} />

      {/* Top bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,15,46,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="nav-inner" style={{ height: 60 }}>
          <Link to="/">
            <img src={ylogo} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
          </Link>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            <span className="hidden-xs">Back to Home</span>
            <span className="show-xs">Home</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: 'clamp(24px, 4vw, 40px) clamp(12px, 3vw, 16px) clamp(40px, 6vw, 64px)', maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 32px)', animationDelay: '0.1s' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 700, marginBottom: 8 }}>Register</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(13px, 2.5vw, 16px)' }}>Senior Youth Congress 2026 · White City MPC, Saldanha Bay</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: 16, borderRadius: 12,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-strong animate-fade-in-up" style={{ padding: 'clamp(16px, 4vw, 32px)', borderRadius: 20, animationDelay: '0.25s' }}>

          {/* Section: Personal */}
          <SectionHeader icon={<User size={16} color="#00c8ff" />} title="Personal Information" />

          <div className="form-2col" style={{ marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>First name <span style={requiredStar}>*</span></label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First name" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>Surname <span style={requiredStar}>*</span></label>
              <input type="text" name="surname" value={form.surname} onChange={handleChange} required placeholder="Surname" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email <span style={requiredStar}>*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Contact number <span style={requiredStar}>*</span></label>
            <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} required placeholder="e.g. 082 123 4567" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>

          <div className="form-2col" style={{ marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Gender <span style={requiredStar}>*</span></label>
              <select name="gender" value={form.gender} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <input type="number" name="age" min="1" max="120" value={form.age} onChange={handleChange} placeholder="Age" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Church or Organization</label>
            <input type="text" name="churchOrOrganization" value={form.churchOrOrganization} onChange={handleChange} placeholder="e.g. Seventh-day Adventist Church, Saldanha" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Conference or Region <span style={requiredStar}>*</span></label>
            <select name="conference" value={form.conference} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select conference / region</option>
              <option value="cc-western">Cape Conference - Western Region</option>
              <option value="cc-northern">Cape Conference - Northern Region</option>
              <option value="cc-eastern">Cape Conference - Eastern Region</option>
              <option value="cape">The Cape Conference</option>
              <option value="ncsa">Northern Conference of South Africa</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0 24px' }} />

          {/* Section: Emergency Contact */}
          <SectionHeader icon={<ShieldAlert size={16} color="#00c8ff" />} title="Emergency Contact" />

          <div className="form-2col" style={{ marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Emergency contact name</label>
              <input type="text" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Full name" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>Emergency contact number</label>
              <input type="tel" name="emergencyContactNumber" value={form.emergencyContactNumber} onChange={handleChange} placeholder="e.g. 082 123 4567" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0 24px' }} />

          {/* Section: Package */}
          <SectionHeader icon={<Package size={16} color="#00c8ff" />} title="Package & Details" />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Delegate type</label>
            <select name="delegateType" value={form.delegateType} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select type</option>
              <option value="ambassador">Ambassador</option>
              <option value="youthAdult">Youth Adult</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Package <span style={requiredStar}>*</span></label>
            <select name="package" value={form.package} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="basic">Basic — No pack (R450)</option>
              <option value="basicPack">Basic Pack — Jacket (R750)</option>
              <option value="halfPack">Half Pack — Jacket & Bag (R900)</option>
              <option value="fullPack">Full Pack — Jacket, Bag, Cup & Socks (R1 200)</option>
            </select>
          </div>

          {['basicPack', 'halfPack', 'fullPack', 'withPack'].includes(form.package) && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Jacket size <span style={requiredStar}>*</span></label>
              <select name="hoodieSize" value={form.hoodieSize} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select size</option>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Is your church insured?</label>
            <select name="churchInsured" value={form.churchInsured} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0 24px' }} />

          {/* Section: Documents */}
          <SectionHeader icon={<FileText size={16} color="#00c8ff" />} title="Documents" />

          <div className="form-2col" style={{ marginBottom: 32 }}>
            <FileUploadBox
              label="Passport photo"
              accept="image/*"
              uploaded={uploadedFiles.passportPhoto}
              isUploading={uploading.passportPhoto}
              onChange={(file) => handleFileUpload(file, 'passportPhoto')}
              hint="JPG, PNG up to 5 MB"
            />
            <FileUploadBox
              label="Payment proof"
              accept="image/*,.pdf,.doc,.docx"
              uploaded={uploadedFiles.paymentProof}
              isUploading={uploading.paymentProof}
              onChange={(file) => handleFileUpload(file, 'paymentProof')}
              hint="Image, PDF, Word up to 5 MB"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: submitting ? 'rgba(0,200,255,0.3)' : 'linear-gradient(135deg, #00c8ff, #0066ee)',
              color: 'white', fontWeight: 700, fontSize: 17,
              padding: '16px 24px', borderRadius: 50, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 8px 24px rgba(0,200,255,0.2)',
              transition: 'all 0.2s', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? <><Loader size={18} style={{ display: 'inline', marginRight: 8, animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 }}>
          By registering you agree to the event terms and conditions.
        </p>
      </div>

      <Footer />
    </div>
  )
}

/* ─── Section header with icon ─── */
function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(0,200,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </span>
      <h2 style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>{title}</h2>
    </div>
  )
}

/* ─── File upload box ─── */
function FileUploadBox({ label, accept, uploaded, isUploading, onChange, hint }) {
  const borderColor = uploaded ? 'rgba(0,200,255,0.3)' : 'rgba(255,255,255,0.1)'
  const bg = uploaded ? 'rgba(0,200,255,0.04)' : 'transparent'

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
        {label} <span style={{ color: '#f87171' }}>*</span>
      </label>
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', borderRadius: 12,
        border: `2px dashed ${borderColor}`, background: bg,
        cursor: isUploading ? 'wait' : 'pointer', transition: 'all 0.2s', minHeight: 120,
      }}>
        <input type="file" accept={accept} style={{ display: 'none' }}
          onChange={(e) => onChange(e.target.files?.[0])} disabled={isUploading} />
        {isUploading ? (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</span>
        ) : uploaded ? (
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><CheckCircle size={24} color="#00c8ff" /></span>
            <p style={{ color: '#00c8ff', fontSize: 13, fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {uploaded.name}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4 }}>Click to replace</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Upload size={28} color="rgba(255,255,255,0.2)" /></span>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Upload file</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4 }}>{hint}</p>
          </div>
        )}
      </label>
    </div>
  )
}

export default Register
