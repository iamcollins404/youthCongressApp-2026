import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Footer from '../../components/landing/footer'

const PKG_LABELS = {
  basic: 'Basic — No Pack (R450)',
  basicPack: 'Basic Pack — Jacket (R750)',
  halfPack: 'Half Pack — Jacket & Bag (R900)',
  fullPack: 'Full Pack — Jacket, Bag, Cup & Socks (R1 200)',
  withPack: 'Including Congress Pack (R750)',
  withoutPack: 'Without Congress Pack (R450)',
}
const CONF_LABELS = {
  'ncsa': 'Northern Conference of South Africa',
  'cape-eastern': 'Cape Conference - Eastern Region',
  'cape-northern': 'Cape Conference - Northern Region',
  'cape-western': 'Cape Conference - Western Region',
  'cc-western': 'Cape Conference - Western Region',
  'cc-northern': 'Cape Conference - Northern Region',
  'cc-eastern': 'Cape Conference - Eastern Region',
  'cape': 'The Cape Conference',
}

function AdminDuplicates() {
  const [adminEmail, setAdminEmail] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [duplicates, setDuplicates] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [statusComment, setStatusComment] = useState('')
  const [statusUpdateError, setStatusUpdateError] = useState(null)
  const [pendingStatus, setPendingStatus] = useState(null)
  const navigate = useNavigate()

  // Fetch duplicates from API
  useEffect(() => {
    const fetchDuplicates = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/tickets`)
        if (response.data) {
          // Find duplicate records
          const duplicates = findDuplicateRecords(response.data)
          // Map API response to our ticket format and sort by attendee name
          const formattedDuplicates = duplicates
            .map(ticket => ({
              id: ticket.ticketId,
              firstName: ticket.firstName,
              surname: ticket.surname,
              email: ticket.email,
              conference: CONF_LABELS[ticket.conference] || ticket.conference,
              package: PKG_LABELS[ticket.package] || ticket.package,
              rawPackage: ticket.package,
              hoodieSize: ticket.hoodieSize,
              registrationDate: new Date(ticket.createdAt).toISOString().split('T')[0],
              status: ticket.status === 'declined' ? 'Declined' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
              age: ticket.age,
              gender: ticket.gender,
              contactNumber: ticket.contactNumber,
              churchInsured: ticket.churchInsured,
              passportPhoto: ticket.passportPhoto,
              paymentProof: ticket.paymentProof,
              _id: ticket._id,
              statusComments: ticket.statusComments || [],
              createdAt: new Date(ticket.createdAt).getTime(), // Store timestamp for secondary sorting
              sortKey: `${ticket.firstName.toLowerCase()} ${ticket.surname.toLowerCase()} ${ticket.email.toLowerCase()}` // Add sort key for grouping
            }))
            .sort((a, b) => {
              // First sort by the composite key to group duplicates
              const keyCompare = a.sortKey.localeCompare(b.sortKey)
              if (keyCompare !== 0) return keyCompare
              // If same attendee, sort by creation date (most recent first)
              return b.createdAt - a.createdAt
            })
          setDuplicates(formattedDuplicates)
        }
      } catch (err) {
        console.error('Error fetching duplicates:', err)
        setError('Failed to load duplicates')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDuplicates()
  }, [])

  // Function to find duplicate records
  const findDuplicateRecords = (tickets) => {
    const duplicates = []
    const seen = new Map()

    tickets.forEach(ticket => {
      const key = `${ticket.email.toLowerCase()}-${ticket.firstName.toLowerCase()}-${ticket.surname.toLowerCase()}`
      if (seen.has(key)) {
        // If we've seen this combination before, add both records to duplicates
        const existingTicket = seen.get(key)
        if (!duplicates.some(d => d.id === existingTicket.id)) {
          duplicates.push(existingTicket)
        }
        duplicates.push(ticket)
      } else {
        seen.set(key, ticket)
      }
    })

    return duplicates
  }

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Check if admin is logged in
  useEffect(() => {
    const email = sessionStorage.getItem('adminEmail')
    if (!email) {
      navigate('/admin')
      return
    }
    setAdminEmail(email)
  }, [navigate])

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminEmail')
    navigate('/admin')
  }

  // Handle status change
  const handleStatusChange = (ticketId, newStatus) => {
    setPendingStatus(newStatus)
  }

  // Handle save update
  const handleSaveUpdate = async () => {
    if (!selectedTicket || !pendingStatus) return
    
    setIsSaving(true)
    setStatusUpdateError(null)
    
    try {
      // Convert status to match backend expectations
      const backendStatus = pendingStatus.toLowerCase()
      
      const response = await axios.patch(`${API_URL}/tickets/${selectedTicket.id}/status`, {
        status: backendStatus,
        comment: statusComment || `Status updated to ${backendStatus} by ${adminEmail}`
      })
      
      if (response.data.success) {
        // Update local state with new status and comments
        setDuplicates(duplicates.map(t => 
          t.id === selectedTicket.id 
            ? { 
                ...t, 
                status: pendingStatus,
                statusComments: response.data.data.comments 
              } 
            : t
        ))
        setStatusComment('') // Clear comment after successful update
        setPendingStatus(null) // Reset pending status
        setIsModalOpen(false) // Close modal after success
        setSelectedTicket(null)
      } else {
        setStatusUpdateError('Failed to update ticket status')
      }
    } catch (err) {
      console.error('Error updating ticket status:', err)
      setStatusUpdateError(err.response?.data?.message || 'Error updating ticket status')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle opening the ticket modal
  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  // Filter duplicates based on search term and status filter
  const filteredDuplicates = duplicates.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const renderStatusBadge = (status) => {
    const styles = {
      Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      Pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      Declined: "bg-red-500/15 text-red-400 border-red-500/20",
    }
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${styles[status] || styles.Declined}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0f2e] flex flex-col">
      <nav className="sticky top-0 z-50 bg-[#0c0f2e]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/home" className="text-white text-xl font-bold tracking-tight hover:text-[#00c8ff] transition-colors">SYC2026 <span className="text-[#00c8ff]">Admin</span></Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                <Link to="/admin/home" className="px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Dashboard
                </Link>
                <Link to="/admin/tickets" className="px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  Tickets
                </Link>
                <Link to="/admin/duplicates" className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Duplicates
                </Link>
              </div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 border border-red-600 transition-colors" title="Sign out">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-white">Duplicate Records</h1>
          </div>

          {/* Filters */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  <input type="search" placeholder="Search by name, email, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff] transition-colors" />
                </div>
              </div>
              {/* Status Filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff] min-w-[140px]">
                <option value="all">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
              {/* Count badge */}
              <div className="flex items-center px-4 py-2 rounded-lg bg-[#00c8ff]/10 border border-[#00c8ff]/20 whitespace-nowrap">
                <span className="text-sm font-medium text-[#00c8ff]">{filteredDuplicates.length} duplicates</span>
              </div>
            </div>
          </div>

          {/* Duplicates List */}
          <div className="mt-4">
            {loading ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse flex-1" />
                      <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4">
                <p className="font-medium">Error loading duplicates</p>
                <p className="text-sm mt-1 text-red-300/70">{error}</p>
              </div>
            ) : isSmallScreen ? (
              <div className="space-y-3">
                {filteredDuplicates.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <span className="text-sm font-mono font-medium text-[#00c8ff]">{ticket.id}</span>
                      {renderStatusBadge(ticket.status)}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-white font-medium text-sm">{ticket.firstName} {ticket.surname}</p>
                        <p className="text-white/40 text-xs mt-0.5">{ticket.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Conference</p><p className="text-xs text-white/70">{ticket.conference}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Package</p><p className="text-xs text-white/70">{ticket.package}</p></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Registered</p><p className="text-xs text-white/70">{new Date(ticket.registrationDate).toLocaleDateString()}</p></div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Status</p>
                          <select
                            className="text-xs text-white bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff]"
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          >
                            <option value="Approved">Set Approved</option>
                            <option value="Pending">Set Pending</option>
                            <option value="Declined">Set Declined</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => openTicketModal(ticket)} className="flex-1 text-center py-2 text-xs font-medium rounded-lg bg-[#00c8ff] text-[#0c0f2e] hover:bg-[#00b4e6] transition-colors">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10">
                      <th className="py-3 pl-5 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Ticket ID</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Attendee</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 hidden lg:table-cell">Conference</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 hidden xl:table-cell">Package</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 hidden xl:table-cell">Registered</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Status</th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/40 pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDuplicates.map((ticket, idx) => (
                      <tr key={ticket.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${idx % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                        <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-[#00c8ff]">{ticket.id}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-medium text-white">{ticket.firstName} {ticket.surname}</p>
                          <p className="text-xs text-white/35 mt-0.5">{ticket.email}</p>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap hidden lg:table-cell">
                          <span className="text-sm text-white/60">{ticket.conference}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap hidden xl:table-cell">
                          <span className="text-xs text-white/50">{ticket.package}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap hidden xl:table-cell">
                          <span className="text-xs text-white/50">{new Date(ticket.registrationDate).toLocaleString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">{renderStatusBadge(ticket.status)}</td>
                        <td className="px-3 py-3.5 pr-5 whitespace-nowrap text-right">
                          <button onClick={() => openTicketModal(ticket)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#00c8ff] text-[#0c0f2e] hover:bg-[#00b4e6] transition-colors">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-800/60 transition-opacity" 
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all align-middle max-w-5xl w-full relative">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <h3 className="text-xl leading-6 font-medium text-gray-900" id="modal-title">
                        Duplicate Record Details: {selectedTicket.id}
                      </h3>
                      {renderStatusBadge(selectedTicket.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Attendee Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Attendee Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Full Name</p>
                              <p className="text-sm font-medium">{selectedTicket.firstName} {selectedTicket.surname}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm">{selectedTicket.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Contact Number</p>
                              <p className="text-sm">{selectedTicket.contactNumber || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Gender</p>
                              <p className="text-sm">{selectedTicket.gender?.charAt(0).toUpperCase() + selectedTicket.gender?.slice(1) || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Ticket Details</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Conference</p>
                              <p className="text-sm">{selectedTicket.conference}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Package</p>
                              <p className="text-sm">{selectedTicket.package}</p>
                            </div>
                            {selectedTicket.hoodieSize && (
                              <div>
                                <p className="text-xs text-gray-500">Jacket Size</p>
                                <p className="text-sm">{selectedTicket.hoodieSize}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500">Registration Date</p>
                              <p className="text-sm">{new Date(selectedTicket.registrationDate).toLocaleString('en-ZA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Passport Photo</p>
                              {selectedTicket.passportPhoto ? (
                                <a 
                                  href={selectedTicket.passportPhoto.replace('api/', '')}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00c8ff] hover:bg-[#00b4e6] text-[#0c0f2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Photo
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">Not available</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Payment Proof</p>
                              {selectedTicket.paymentProof ? (
                                <a 
                                  href={selectedTicket.paymentProof.replace('api/', '')}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00c8ff] hover:bg-[#00b4e6] text-[#0c0f2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  View Payment
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">Not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Status Update */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
                          <div className="space-y-4">
                            <div className="relative">
                              <select
                                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c8ff] focus:border-[#00c8ff] sm:text-sm appearance-none bg-white shadow-sm"
                                value={pendingStatus || selectedTicket.status}
                                onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                              >
                                <option value="Approved" className="py-2">Approved</option>
                                <option value="Pending" className="py-2">Pending</option>
                                <option value="Declined" className="py-2">Declined</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>

                            <div>
                              <label htmlFor="statusComment" className="block text-sm font-medium text-gray-700 mb-1">
                                Status Change Comment
                              </label>
                              <textarea
                                id="statusComment"
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c8ff] focus:border-[#00c8ff]"
                                rows="2"
                                placeholder="Enter a comment for this status change..."
                                value={statusComment}
                                onChange={(e) => setStatusComment(e.target.value)}
                              ></textarea>
                            </div>

                            {statusUpdateError && (
                              <div className="text-sm text-red-600">
                                {statusUpdateError}
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedTicket.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                selectedTicket.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Current Status: {selectedTicket.status}
                              </span>
                              {pendingStatus && pendingStatus !== selectedTicket.status && (
                                <span className="text-xs text-gray-500">
                                  → New Status: {pendingStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status History */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Status History</h4>
                          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                            {selectedTicket.statusComments && selectedTicket.statusComments.length > 0 ? (
                              <div className="space-y-2">
                                {selectedTicket.statusComments.map((statusComment, index) => (
                                  <div key={index} className="bg-white p-2 rounded border">
                                    <div className="flex justify-between items-center">
                                      <span className={`text-xs font-medium ${
                                        statusComment.status === 'approved' ? 'text-green-600' :
                                        statusComment.status === 'pending' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {statusComment.status.charAt(0).toUpperCase() + statusComment.status.slice(1)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(statusComment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{statusComment.comment}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No status history available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c8ff] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveUpdate}
                  disabled={isSaving || (!pendingStatus && !statusComment)}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Update'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedTicket(null)
                    setPendingStatus(null)
                    setStatusComment('')
                    setStatusUpdateError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminDuplicates 