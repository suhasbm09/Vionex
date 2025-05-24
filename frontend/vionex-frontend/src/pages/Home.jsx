// src/pages/Home.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { UserPlus, Users } from 'lucide-react'
import LoginModal from '../components/LoginModal'

const Home = () => {
  const [showModal, setShowModal] = useState(false)
  const [role, setRole] = useState(null)
  const navigate = useNavigate()

  const openModal = (r) => {
    setRole(r)
    setShowModal(true)
  }

  const handleLogin = async (email) => {
    setShowModal(false)
    try {
      const res = await axios.get(`http://localhost:5000/${role}/email/${encodeURIComponent(email)}`)
      const profile = res.data
      const displayName = profile.name || profile.ngoName || email
      localStorage.setItem(
        'user',
        JSON.stringify({ id: profile.id, role, displayName, email })
      )
      navigate(role === 'donor' ? '/donor-dashboard' : '/ngo-dashboard', {
        state: { id: profile.id }
      })
    } catch (err) {
      if (err.response?.status === 404) {
        navigate(role === 'donor' ? '/donor-profile' : '/ngo-profile', {
          state: { email }
        })
      } else {
        console.error('Login lookup failed:', err)
        alert('Unable to log in right now.')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002F34] to-[#00121F]">
        <div className="absolute top-10 left-[-80px] w-96 h-96 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />
      </div>

      {/* Main card */}
      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl font-extrabold text-white mb-4"
        >
          Welcome to{' '}
          <span className="text-teal-300 hover:text-teal-200 transition">
            Vionex
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-8"
        >
          A decentralized, AI-powered platform bridging surplus and scarcity in healthcare.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('donor')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg transition"
          >
            <UserPlus size={20} /> I’m a Donor
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('ngo')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl shadow-lg transition"
          >
            <Users size={20} /> I’m an NGO
          </motion.button>
        </motion.div>
      </div>

      {showModal && (
        <LoginModal
          role={role}
          onClose={() => setShowModal(false)}
          onSubmit={handleLogin}
        />
      )}
    </motion.div>
  )
}

export default Home
