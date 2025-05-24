// src/pages/NGODashboard.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { useLocation, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, User, RefreshCw } from 'lucide-react'

const NGODashboard = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  const ngoId = state?.id || stored?.id
  if (!ngoId) return <Navigate to="/" replace />

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = () => {
    setLoading(true)
    axios
      .get(`http://localhost:5000/ngo/${ngoId}/matches`)
      .then(res => setMatches(res.data.matches || []))
      .catch(() => alert('Could not load matches.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchMatches, [ngoId])

  const getTag = expiry => {
    const diff = dayjs(expiry).diff(dayjs(), 'day')
    if (diff < 0) return ['Expired', 'bg-red-600']
    if (diff <= 7) return ['Expiring Soon', 'bg-yellow-400 text-black']
    return ['Active', 'bg-green-600']
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#00121F] to-[#002F34] text-white p-6"
    >
      {/* Blobs */}
      <div className="absolute top-[-120px] left-[-100px] w-96 h-96 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-[-140px] right-[-120px] w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />

      {/* Top Nav */}
      <div className="relative z-10 flex justify-end items-center p-6 space-x-4">
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

      <div className="relative z-10 px-6">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold"
          >
            🧠 AI-Recommended Matches
          </motion.h1>
          <button
            onClick={fetchMatches}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-gray-400">No matches right now.</p>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {matches.map(d => {
              const [tagText, tagColor] = getTag(d.expiryDate)
              return (
                <motion.div
                  key={d.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{d.medicineName}</h2>
                    <p className="text-gray-300">Qty: {d.quantity}</p>
                    <p className="text-gray-300">
                      Expiry: {dayjs(d.expiryDate).format('MMM D, YYYY')}
                    </p>
                    {d.fraudScore > 0 && (
                      <p className="mt-1 text-red-400">⚠️ {d.fraudIssues?.[0]}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tagColor}`}>
                      {tagText}
                    </span>
                    <button
                      onClick={() => navigate(`/ngo-request?id=${d.id}`)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition"
                    >
                      Request
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default NGODashboard
