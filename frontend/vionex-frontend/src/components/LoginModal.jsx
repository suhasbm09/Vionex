// src/components/LoginModal.jsx
import React, { useState } from 'react'
import { X, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const LoginModal = ({ role, onClose, onSubmit }) => {
  const [email, setEmail] = useState('')

  const submit = e => {
    e.preventDefault()
    if (!email) return
    onSubmit(email.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition"
        >
          <X size={20} className="text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {role === 'donor' ? 'Donor' : 'NGO'} Login
        </h2>

        <form onSubmit={submit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
            <label className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all">
              Enter your email
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition"
            >
              Continue
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal
