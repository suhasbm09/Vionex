// src/pages/DonorProfileSetup.jsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { User, Phone, MapPin, File, Info, X } from 'lucide-react'

const DonorProfileSetup = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  if (!email) navigate('/', { replace: true })

  const [form, setForm] = useState({
    name: '',
    contact: '',
    location: '',
    description: '',
    licenceFileName: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = e => {
    const { name, value, files } = e.target
    if (files) {
      setForm(f => ({ ...f, licenceFileName: files[0].name }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { email, ...form }
      const { data } = await axios.post(
        'http://localhost:5000/donor/profile',
        payload
      )
      const { id, name } = data
      localStorage.setItem(
        'user',
        JSON.stringify({ role: 'donor', id, displayName: name, email })
      )
      navigate('/donor-dashboard', { state: { id } })
    } catch (err) {
      console.error(err)
      alert('Unable to save profile right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-[#00121F] to-[#002F34]"
    >
      {/* Blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-96 h-96 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-[-120px] right-[-100px] w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />

      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <X size={20} />
      </button>

      {/* Profile Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Complete Your Donor Profile
        </h2>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <User className="text-gray-400" />
            <input
              type="email"
              value={email}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg"
            />
          </div>

          {/* Name */}
          <div className="flex items-center gap-3">
            <User className="text-gray-400" />
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3">
            <Phone className="text-gray-400" />
            <input
              name="contact"
              placeholder="Contact Number"
              value={form.contact}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <MapPin className="text-gray-400" />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          {/* Licence File */}
          <div className="flex items-center gap-3">
            <File className="text-gray-400" />
            <label className="flex-1 flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 rounded-lg cursor-pointer hover:bg-gray-700 transition">
              <span>
                {form.licenceFileName || 'Upload Retail Drug Licence'}
              </span>
              <input
                type="file"
                name="licenceFile"
                accept=".pdf,.png,.jpg"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <Info className="text-gray-400 mt-2" />
            <textarea
              name="description"
              placeholder="Additional Info (optional)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save Profile'}
        </button>
      </motion.form>
    </motion.div>
  )
}

export default DonorProfileSetup
