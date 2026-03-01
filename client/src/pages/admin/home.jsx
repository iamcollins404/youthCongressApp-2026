import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Footer from '../../components/landing/footer'
import AdminNavbar from '../../components/admin/AdminNavbar'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function AdminHome() {
  const [adminEmail, setAdminEmail] = useState('')
  const [chartView, setChartView] = useState('daily') // 'daily', 'weekly', 'monthly'
  const [selectedDemographic, setSelectedDemographic] = useState('gender') // 'gender', 'age', 'conference', 'hoodieSizes'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ticketStats, setTicketStats] = useState({
    ticketStats: { approved: 0, pending: 0, rejected: 0, total: 0 },
    congressPacks: { basic: 0, basicPack: 0, halfPack: 0, fullPack: 0, withPack: 0, withoutPack: 0, total: 0 },
    hoodieSizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0, '4XL': 0, total: 0 }
  })
  const navigate = useNavigate()
  
  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/tickets/admin/stats`)
        if (response.data.success) {
          setTicketStats(response.data.data)
        } else {
          setError('Failed to load stats')
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Error connecting to server')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  const ts = ticketStats?.ticketStats || {}
  const stats = [
    { name: 'Approved Tickets', value: ts.approved ?? 0 },
    { name: 'Pending Approval', value: ts.pending ?? 0 },
    { name: 'Rejected', value: ts.rejected ?? 0 },
    { name: 'Total Registered', value: ts.total ?? 0 }
  ]
  
  // Registration Statistics - Replacing Recent Activity
  const [registrationData, setRegistrationData] = useState({
    daily: {
      labels: [],
      datasets: [{
        label: 'Daily Registrations',
        data: [],
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
      }]
    },
    weekly: {
      labels: [],
      datasets: [{
        label: 'Weekly Registrations',
        data: [],
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
      }]
    },
    monthly: {
      labels: [],
      datasets: [{
        label: 'Monthly Registrations',
        data: [],
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
      }]
    }
  })

  const [demographicData, setDemographicData] = useState({
    gender: {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Gender Distribution',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)', 
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1
      }]
    },
    age: {
      labels: ['18-24', '25-30', '31-35', '36-40', '41+'],
      datasets: [{
        label: 'Age Distribution',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }]
    },
    conference: {
      labels: ['CC Western', 'CC Northern', 'CC Eastern', 'Cape', 'NCSA', 'Other'],
      datasets: [{
        label: 'Conference Distribution',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    }
  })

  // Hoodie sizes data
  const [hoodieSizesData, setHoodieSizesData] = useState({
    labels: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    datasets: [{
      label: 'Hoodie Size Distribution',
      data: [0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(201, 203, 207, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(201, 203, 207)',
        'rgb(255, 99, 132)'
      ],
      borderWidth: 1
    }]
  })

  // Fetch registration data and demographics
  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await axios.get(`${API_URL}/tickets`)
        if (response.data && response.data.length > 0) {
          processRegistrationData(response.data)
          processDemographicData(response.data)
        }
      } catch (err) {
        console.error('Error fetching registration data:', err)
      }
    }

    fetchRegistrationData()
  }, [])

  const processRegistrationData = (tickets) => {
    const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const toWeekKey = (d) => {
      const start = new Date(d); start.setDate(start.getDate() - start.getDay())
      return toDateKey(start)
    }
    const toMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d
    })
    const dailyCounts = {}
    last7Days.forEach(d => { dailyCounts[toDateKey(d)] = 0 })
    tickets.forEach(t => {
      const d = new Date(t.createdAt)
      const key = toDateKey(d)
      if (key in dailyCounts) dailyCounts[key]++
    })
    const dailyData = {
      labels: last7Days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Registrations',
        data: last7Days.map(d => dailyCounts[toDateKey(d)] || 0),
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1
      }]
    }

    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (7 * (3 - i))); return d
    })
    const weekKeys = last4Weeks.map(d => toWeekKey(d))
    const weeklyCounts = {}
    weekKeys.forEach(k => { weeklyCounts[k] = 0 })
    tickets.forEach(t => {
      const k = toWeekKey(new Date(t.createdAt))
      if (k in weeklyCounts) weeklyCounts[k]++
    })
    const weeklyData = {
      labels: last4Weeks.map((d, i) => {
        const start = new Date(d); start.setDate(start.getDate() - start.getDay())
        return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [{
        label: 'Weekly Registrations',
        data: weekKeys.map(k => weeklyCounts[k] || 0),
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1
      }]
    }

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); return d
    })
    const monthKeys = last6Months.map(d => toMonthKey(d))
    const monthlyCounts = {}
    monthKeys.forEach(k => { monthlyCounts[k] = 0 })
    tickets.forEach(t => {
      const k = toMonthKey(new Date(t.createdAt))
      if (k in monthlyCounts) monthlyCounts[k]++
    })
    const monthlyData = {
      labels: last6Months.map(d => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
      datasets: [{
        label: 'Monthly Registrations',
        data: monthKeys.map(k => monthlyCounts[k] || 0),
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1
      }]
    }

    setRegistrationData({ daily: dailyData, weekly: weeklyData, monthly: monthlyData })
  }

  // Process demographic data for charts
  const processDemographicData = (tickets) => {
    // Gender distribution
    const genderCount = {
      male: tickets.filter(ticket => ticket.gender === 'male').length,
      female: tickets.filter(ticket => ticket.gender === 'female').length,
      other: tickets.filter(ticket => ticket.gender !== 'male' && ticket.gender !== 'female').length
    }

    const genderData = {
      ...demographicData.gender,
      datasets: [{
        ...demographicData.gender.datasets[0],
        data: [genderCount.male, genderCount.female, genderCount.other]
      }]
    }

    // Age distribution
    const ageCount = {
      '18-24': tickets.filter(ticket => ticket.age >= 18 && ticket.age <= 24).length,
      '25-30': tickets.filter(ticket => ticket.age >= 25 && ticket.age <= 30).length,
      '31-35': tickets.filter(ticket => ticket.age >= 31 && ticket.age <= 35).length,
      '36-40': tickets.filter(ticket => ticket.age >= 36 && ticket.age <= 40).length,
      '41+': tickets.filter(ticket => ticket.age >= 41).length
    }

    const ageData = {
      ...demographicData.age,
      datasets: [{
        ...demographicData.age.datasets[0],
        data: [ageCount['18-24'], ageCount['25-30'], ageCount['31-35'], ageCount['36-40'], ageCount['41+']]
      }]
    }

    const confMap = { 'cc-western': 0, 'cc-northern': 1, 'cc-eastern': 2, 'cape': 3, 'ncsa': 4, 'other': 5 }
    const confCounts = [0, 0, 0, 0, 0, 0]
    tickets.forEach(t => {
      const idx = confMap[t.conference]
      if (idx !== undefined) confCounts[idx]++
      else confCounts[5]++
    })

    const conferenceData = {
      ...demographicData.conference,
      datasets: [{
        ...demographicData.conference.datasets[0],
        data: confCounts
      }]
    }

    const sizeKeys = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
    const sizeCounts = {}
    sizeKeys.forEach(s => { sizeCounts[s] = 0 })
    tickets.forEach(t => { if (t.hoodieSize && sizeCounts[t.hoodieSize] !== undefined) sizeCounts[t.hoodieSize]++ })

    setHoodieSizesData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: sizeKeys.map(s => sizeCounts[s])
      }]
    }))
    setDemographicData({
      gender: genderData,
      age: ageData,
      conference: conferenceData
    })
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255,255,255,0.7)' } },
      title: {
        display: true,
        text: `${chartView.charAt(0).toUpperCase() + chartView.slice(1)} Registration Trend`,
        font: { size: 16 },
        color: 'rgba(255,255,255,0.85)',
      },
    },
  }
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255,255,255,0.7)' } },
      title: {
        display: true,
        text: `${selectedDemographic.charAt(0).toUpperCase() + selectedDemographic.slice(1)} Distribution`,
        font: { size: 16 },
        color: 'rgba(255,255,255,0.85)',
      },
    },
  }
  
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
  
  const renderHoodieSizes = () => {
    if (!ticketStats?.hoodieSizes) return null;

    const sizes = [
      { size: 'XS', count: ticketStats.hoodieSizes.XS || 0 },
      { size: 'S', count: ticketStats.hoodieSizes.S || 0 },
      { size: 'M', count: ticketStats.hoodieSizes.M || 0 },
      { size: 'L', count: ticketStats.hoodieSizes.L || 0 },
      { size: 'XL', count: ticketStats.hoodieSizes.XL || 0 },
      { size: 'XXL', count: ticketStats.hoodieSizes.XXL || 0 },
      { size: '3XL', count: ticketStats.hoodieSizes['3XL'] || 0 },
      { size: '4XL', count: ticketStats.hoodieSizes['4XL'] || 0 }
    ];

    return (
      <div className="mt-8">
        <h2 className="text-lg font-medium text-white">Jacket Size Distribution</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {sizes.map(({ size, count }) => (
            <div key={size} className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-white/40 truncate">Size {size}</dt>
                <dd className="mt-1 text-3xl font-semibold text-white">{count}</dd>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#0c0f2e] relative flex flex-col">
      {/* Background orbs */}
      <div className="glow-orb glow-orb-purple" style={{ position: 'fixed', width: 400, height: 400, top: '-10%', right: '-10%' }} />
      <div className="glow-orb glow-orb-cyan" style={{ position: 'fixed', width: 300, height: 300, bottom: '10%', left: '-8%' }} />

      <AdminNavbar onLogout={handleLogout} />
      
      {/* Main Content */}
      <main className="relative z-10 py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-white/80">Overview</h2>
            {error ? (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
                <p>{error}</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <div key={stat.name} className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden hover:border-[#00c8ff]/30 transition-colors">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-white/40 truncate">{stat.name}</dt>
                      {loading ? (
                        <dd className="mt-2"><div className="h-8 bg-white/10 rounded animate-pulse"></div></dd>
                      ) : (
                        <dd className="mt-1 text-3xl font-semibold text-white">{stat.value}</dd>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Hoodie Sizes Distribution */}
          {!loading && !error && renderHoodieSizes()}
          
          {/* Registration Statistics */}
          <div className="mt-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-lg font-medium text-white/80">Registration Statistics</h2>
              <div className="inline-flex rounded-lg overflow-hidden border border-white/10">
                {['daily', 'weekly', 'monthly'].map((view) => (
                  <button key={view} type="button" onClick={() => setChartView(view)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                      chartView === view
                        ? 'bg-[#00c8ff] text-[#0c0f2e]'
                        : 'bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white'
                    }`}>
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Registration Trend Graph */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 md:col-span-2">
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="space-y-4 w-full px-8">
                      <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                      <div className="h-64 bg-white/5 rounded animate-pulse flex items-end justify-around px-4 py-8">
                        {[16, 32, 24, 40, 20, 28, 36].map((h, i) => (
                          <div key={i} style={{ height: h * 4 }} className="w-6 bg-white/10 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <Bar data={registrationData[chartView]} options={chartOptions} />
                  </div>
                )}
              </div>
              
              {/* Demographic Filters */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
                <div className="mb-4">
                  <label htmlFor="demographic" className="block text-sm font-medium text-white/50 mb-1">Demographic Filter</label>
                  <select id="demographic" name="demographic"
                    className="block w-full pl-3 pr-10 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#00c8ff] focus:border-[#00c8ff]"
                    value={selectedDemographic} onChange={(e) => setSelectedDemographic(e.target.value)} disabled={loading}>
                    <option value="gender">Gender</option>
                    <option value="age">Age Group</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
                
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full max-w-[200px] aspect-square rounded-full border-8 border-white/10 relative animate-pulse">
                      <div className="absolute inset-0 rounded-full overflow-hidden flex justify-center items-center">
                        <div className="h-1/2 w-1/2 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <Doughnut data={demographicData[selectedDemographic]} options={doughnutOptions} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hoodie Sizes Chart */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-white/80">Jacket Size Chart</h2>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full max-w-[300px] aspect-square rounded-full border-8 border-white/10 relative animate-pulse">
                    <div className="absolute inset-0 rounded-full overflow-hidden flex justify-center items-center">
                      <div className="h-1/2 w-1/2 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <Doughnut 
                    data={hoodieSizesData} 
                    options={{
                      ...doughnutOptions,
                      plugins: {
                        ...doughnutOptions.plugins,
                        title: { display: true, text: 'Jacket Size Distribution', font: { size: 16 }, color: 'rgba(255,255,255,0.85)' },
                      },
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminHome
