import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DonorProfileSetup() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  if (!email) {
    navigate('/', { replace: true });
    return null;
  }

  const [form, setForm] = useState({
    name: '',
    contact: '',
    location: '',
    description: '',
    licenceFileName: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, licenceFileName: files[0].name }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { email, ...form };
      const { data } = await axios.post('http://localhost:5000/donor/profile', payload);
      localStorage.setItem('user', JSON.stringify({
        role: 'donor',
        id: data.id,
        displayName: data.name,
        email
      }));
      navigate('/donor-dashboard', { state: { id: data.id } });
    } catch (err) {
      console.error(err);
      alert('Unable to save profile right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="w-full max-w-2xl glass rounded-3xl shadow-2xl border border-white/10 backdrop-blur-lg px-10 py-12 animate-slide-up relative">
        
        {/* Close button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-5 text-white/60 hover:text-white text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl font-extrabold text-white text-center mb-8 tracking-wide">
          Complete Your Donor Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 bg-gray-900 text-gray-400 rounded-xl border border-white/10"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Contact Number</label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
              placeholder="+91 9876543210"
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-600 transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="City, Country"
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 transition"
            />
          </div>

          {/* Licence */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Retail Drug Licence</label>
            <label className="w-full flex items-center justify-between px-4 py-2 bg-gray-900 text-white/70 rounded-xl border border-white/10 cursor-pointer hover:border-white transition">
              <span>{form.licenceFileName || 'Upload file (PDF, JPG, PNG)'}</span>
              <input
                type="file"
                name="licenceFile"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Additional Info (Optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Any extra details..."
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
