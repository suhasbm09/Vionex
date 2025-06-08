import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NGOProfileSetup() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  if (!email) {
    navigate('/', { replace: true });
    return null;
  }

  const [form, setForm] = useState({
    ngoName: '',
    contact: '',
    location: '',
    medicineName: '',
    quantity: '',
    neededBy: '',
    aboutUs: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
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
    };
    try {
      const { data } = await axios.post('http://localhost:5000/ngo/profile', payload);
      localStorage.setItem(
        'user',
        JSON.stringify({ role: 'ngo', id: data.id, displayName: data.ngoName, email })
      );
      navigate('/ngo-dashboard', { state: { id: data.id } });
    } catch (err) {
      console.error(err);
      alert('Could not save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="container-75 glass bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-2xl relative border border-white/10 animate-slide-up">

        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl transition"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-8 tracking-wide">
          🏥 NGO Profile Setup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 text-white">
          {/* Email (read-only) */}
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 bg-gray-800 text-gray-400 rounded-xl border border-white/10"
            />
          </div>

          {/* NGO Name */}
          <div>
            <label className="block text-gray-400 mb-1">NGO Name *</label>
            <input
              name="ngoName"
              value={form.ngoName}
              onChange={handleChange}
              required
              placeholder="Your NGO Name"
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Contact & Location */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-1">Contact *</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                placeholder="Phone / Email"
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </div>

          {/* Medicine Request */}
          <div>
            <label className="block text-gray-400 mb-1">Medicine Request *</label>
            <div className="grid sm:grid-cols-3 gap-4">
              <input
                name="medicineName"
                value={form.medicineName}
                onChange={handleChange}
                required
                placeholder="Name"
                className="px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10"
              />
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="Qty"
                className="px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10"
              />
              <input
                name="neededBy"
                type="date"
                value={form.neededBy}
                onChange={handleChange}
                required
                className="px-4 py-2 bg-gray-900 text-white rounded-xl border border-white/10"
              />
            </div>
          </div>

          {/* About Us */}
          <div>
            <label className="block text-gray-400 mb-1">About Us *</label>
            <textarea
              name="aboutUs"
              rows="2"
              value={form.aboutUs}
              onChange={handleChange}
              required
              placeholder="Brief description"
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Additional Description */}
          <div>
            <label className="block text-gray-400 mb-1">Additional Info</label>
            <textarea
              name="description"
              rows="2"
              value={form.description}
              onChange={handleChange}
              placeholder="Any extra info..."
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-white/10 focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
