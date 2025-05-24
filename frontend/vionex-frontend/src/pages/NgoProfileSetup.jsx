// src/pages/NGOProfileSetup.jsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { X, Home, Phone, MapPin, ClipboardList, Info } from 'lucide-react'

const NGOProfileSetup = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  if (!email) navigate('/', { replace: true })

  const [form, setForm] = useState({
    ngoName: '',
    contact: '',
    location: '',
    medicineName: '',
    quantity: '',
    neededBy: '',
    aboutUs: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      email,
      ngoName: form.ngoName,
      contact: form.contact,
      location: form.location,
      aboutUs: form.aboutUs,
      description: form.description,
      medicineRequest: {
        name: form.medicineName,
        quantity: form.quantity,
        neededBy: form.neededBy
      }
    }
    try {
      const { data } = await axios.post('http://localhost:5000/ngo/profile', payload)
      localStorage.setItem(
        'user',
        JSON.stringify({ role: 'ngo', id: data.id, displayName: data.ngoName, email })
      )
      navigate('/ngo-dashboard', { state: { id: data.id } })
    } catch (err) {
      console.error(err)
      alert('Could not save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#00121F] to-[#002F34] p-4"
    >
      {/* Blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-96 h-96 bg-teal-600 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-[-120px] right-[-100px] w-96 h-96 bg-orange-500 opacity-15 rounded-full animate-pulse-slow" />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
      >
        <X size={20} />
      </button>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          NGO Profile Setup
        </h2>

        {/* Email */}
        <div className="flex items-center gap-3">
          <Home className="text-gray-400" />
          <input
            type="email"
            value={email}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg"
          />
        </div>

        {/* NGO Name */}
        <div className="flex items-center gap-3">
          <ClipboardList className="text-gray-400" />
          <input
            name="ngoName"
            placeholder="NGO Name *"
            value={form.ngoName}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>

        {/* Contact & Location */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="text-gray-400" />
            <input
              name="contact"
              placeholder="Contact *"
              value={form.contact}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-gray-400" />
            <input
              name="location"
              placeholder="Location *"
              value={form.location}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
        </div>

        {/* Medicine Request */}
        <div className="space-y-2">
          <label className="text-gray-300">Medicine Request *</label>
          <div className="grid sm:grid-cols-3 gap-4">
            <input
              name="medicineName"
              placeholder="Name"
              value={form.medicineName}
              onChange={handleChange}
              required
              className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
            <input
              name="neededBy"
              type="date"
              value={form.neededBy}
              onChange={handleChange}
              required
              className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
        </div>

        {/* About & Additional */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Info className="text-gray-400 mt-1" />
            <textarea
              name="aboutUs"
              placeholder="About Us *"
              value={form.aboutUs}
              onChange={handleChange}
              rows={2}
              required
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
          <textarea
            name="description"
            placeholder="Additional Details"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </motion.form>
    </motion.div>
  )
}

export default NGOProfileSetup
