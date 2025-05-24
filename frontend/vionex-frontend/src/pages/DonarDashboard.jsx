// src/pages/DonorDashboard.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { useLocation, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, LogOut, User } from 'lucide-react'

const DonorDashboard = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  const donorId = state?.id || stored?.id
  if (!donorId) return <Navigate to="/" replace />

  const [donations, setDonations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    medicineName: '',
    quantity: '',
    expiryDate: ''
  })

  // fetch donations
  useEffect(() => {
    axios
      .get(`http://localhost:5000/donor/${donorId}/donations`)
      .then(res => setDonations(res.data.donations || []))
      .catch(() => alert('Unable to load donations.'))
  }, [donorId])

  // form handlers
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  const handleSubmit = e => {
    e.preventDefault()
    axios
      .post(`http://localhost:5000/donor/${donorId}/donations`, form)
      .then(res => {
        setDonations(d => [res.data, ...d])
        setForm({ medicineName: '', quantity: '', expiryDate: '' })
        setShowForm(false)
      })
      .catch(() => alert('Could not save donation.'))
  }

  // status tag logic
  const getTag = expiry => {
    const diff = dayjs(expiry).diff(dayjs(), 'day')
    if (diff < 0) return 'Expired'
    if (diff <= 7) return 'Expiring Soon'
    return 'Active'
  }
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.quantity), 0)

  // logout
  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#00121F] to-[#002F34] text-white"
    >
      {/* Animated background blobs */}
      <div className="absolute top-[-120px] left-[-100px] w-96 h-96 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-[-140px] right-[-120px] w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />

      {/* Top Nav */}
      <div className="relative z-10 flex justify-end p-6 space-x-4 items-center">
        <User size={20} className="text-gray-300" />
        <span className="font-medium">{stored.displayName}</span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div className="relative z-10 px-6 pb-12">
        {/* Page Title */}
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-6 text-center"
        >
          📦 Donor Dashboard
        </motion.h1>

        {/* Summary Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-3xl shadow-2xl mb-8 flex justify-between items-center"
        >
          <div>
            <p className="text-gray-300">Total Donated</p>
            <p className="text-3xl font-semibold">{totalDonations}</p>
          </div>
          <PlusCircle size={48} className="text-teal-400" />
        </motion.div>

        {/* New Donation Section */}
        <div className="max-w-md mx-auto mb-8">
          <button
            onClick={() => setShowForm(s => !s)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold transition"
          >
            {showForm ? '✕ Cancel' : <><PlusCircle /> New Donation</>}
          </button>

          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 space-y-4 bg-gray-800 p-6 rounded-2xl"
            >
              <input
                name="medicineName"
                value={form.medicineName}
                onChange={handleChange}
                placeholder="Medicine Name"
                required
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-400 transition"
              />
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-400 transition"
              />
              <input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-400 transition"
              />
              <button
                type="submit"
                className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition"
              >
                Submit
              </button>
            </motion.form>
          )}
        </div>

        {/* Donations List */}
        <div className="max-w-2xl mx-auto space-y-4">
          {donations.length === 0 ? (
            <p className="text-center text-gray-400">
              You haven’t created any donations yet.
            </p>
          ) : (
            donations.map(d => (
              <motion.div
                key={d.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg"
              >

                {/* Medicine Info */}
                <div>
                  <h2 className="text-xl font-semibold">{d.medicineName}</h2>
                  <p className="text-gray-300">Qty: {d.quantity}</p>
                  <p className="text-gray-300">
                    Expiry: {dayjs(d.expiryDate).format('MMM D, YYYY')}
                  </p>
                </div>

                {/* Status & QR */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getTag(d.expiryDate) === 'Expired'
                        ? 'bg-red-600'
                        : getTag(d.expiryDate) === 'Expiring Soon'
                        ? 'bg-yellow-500'
                        : 'bg-green-600'
                    }`}
                  >
                    {getTag(d.expiryDate)}
                  </span>
                  {d.qrCode && (
                    <code className="font-mono text-sm break-all text-gray-200">
                      {d.qrCode}
                    </code>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DonorDashboard
