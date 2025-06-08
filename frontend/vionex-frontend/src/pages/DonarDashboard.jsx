import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Navigate, useNavigate } from 'react-router-dom';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const donorId = user.id;
  if (!donorId) return <Navigate to="/" replace />;

  const [donations, setDonations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    medicineName: '',
    quantity: '',
    expiryDate: '',
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/donor/${donorId}/donations`)
      .then((res) => {
        setDonations(res.data.donations.filter((d) => d.status !== 'Delivered'));
      })
      .catch(() => alert('Could not load donations.'));
  }, [donorId]);

  const getTag = (expiry) => {
    const diff = dayjs(expiry).diff(dayjs(), 'day');
    if (diff < 0) return 'Expired';
    if (diff <= 7) return 'Expiring Soon';
    return 'Active';
  };

  const total = donations.reduce((sum, d) => sum + Number(d.quantity), 0);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`http://localhost:5000/donor/${donorId}/donations`, form)
      .then((r) => {
        setDonations((arr) => [r.data, ...arr]);
        setForm({ medicineName: '', quantity: '', expiryDate: '' });
        setDrawerOpen(false);
      })
      .catch(() => alert('Save failed.'))
      .finally(() => setLoading(false));
  };

  const confirmHandover = async (donationId) => {
    try {
      await axios.patch(`http://localhost:5000/donor/${donationId}/donations/confirm`);
      setDonations((arr) => arr.filter((d) => d.id !== donationId));
    } catch {
      alert('Confirm failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen text-white px-6 py-10 relative">
      <div className=" container-75 mx-full space-y-12 animate-slide-up">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-wide">
            📦 Donor Dashboard
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:scale-105 transition-all shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Summary Badge */}
        <div className="glass flex items-center justify-between px-8 py-6 rounded-2xl shadow-lg">
          <div>
            <p className="text-gray-400">Total Quantity Donated</p>
            <p className="text-4xl font-semibold text-cyan-400">{total}</p>
          </div>
          <div className="text-6xl animate-bounce-slow">🎁</div>
        </div>

        {/* Add Donation Button */}
        <div className="text-right">
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-full font-semibold shadow-lg transition-transform hover:scale-105"
          >
            {drawerOpen ? '✕ Cancel' : '+ Add Donation'}
          </button>
        </div>

        {/* Add Donation Form */}
        {drawerOpen && (
          <div className="glass p-8 rounded-2xl max-w-xl mx-auto shadow-xl border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                name="medicineName"
                placeholder="Medicine Name"
                value={form.medicineName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-900 rounded-xl border border-white/10 text-white"
              />
              <input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-900 rounded-xl border border-white/10 text-white"
              />
              <input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-900 rounded-xl border border-white/10 text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save Donation'}
              </button>
            </form>
          </div>
        )}

        {/* Donation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {donations.length === 0 && (
            <p className="text-center text-gray-400 col-span-full">No pending donations.</p>
          )}

          {donations.map((d) => (
            <div
              key={d.id}
              className="glass p-6 rounded-2xl shadow-md border border-white/10 flex flex-col justify-between hover:shadow-cyan-500/20 transition-all"
            >
              <div>
                <h2 className="text-xl font-bold mb-1 text-white">{d.medicineName}</h2>
                <p className="text-sm text-gray-300">Qty: {d.quantity}</p>
                <p className="text-sm text-gray-400">Expiry: {dayjs(d.expiryDate).format('MMM D, YYYY')}</p>
              </div>

              {/* Status Section */}
              {d.qrCode ? (
                <div className="mt-4 space-y-3">
                  <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold text-center">
                    Requested
                  </span>
                  <p className="bg-gray-800 text-white text-xs p-2 rounded-xl break-words font-mono">
                    {d.qrCode}
                  </p>
                  <button
                    onClick={() => confirmHandover(d.id)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-center text-white rounded-xl transition"
                  >
                    Confirm Handover
                  </button>
                </div>
              ) : (
                <span
                  className={`inline-block mt-4 px-3 py-1 rounded-full text-xs text-center font-semibold ${
                    getTag(d.expiryDate) === 'Expired'
                      ? 'bg-red-600'
                      : getTag(d.expiryDate) === 'Expiring Soon'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-emerald-500'
                  }`}
                >
                  {getTag(d.expiryDate)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
