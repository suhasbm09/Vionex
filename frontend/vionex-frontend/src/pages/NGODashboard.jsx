import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate, Navigate } from 'react-router-dom';

export default function NGODashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const ngoId = user.id;
  if (!ngoId) return <Navigate to="/" replace />;

  const [pending, setPending]     = useState([]);
  const [completed, setCompleted] = useState([]);
  const [others, setOthers]       = useState([]);
  const [loading, setLoading]     = useState(true);

  // 🧠 Fetch matches from backend
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/ngo/${ngoId}/matches`);
      let matches = data.matches || [];

      // ✅ Patch missing donorLocation from donor profile
      const uniqueDonorIds = [...new Set(matches.map(d => d.donorId).filter(Boolean))];
      const donorMap = {};

      await Promise.all(
        uniqueDonorIds.map(async (id) => {
          try {
            const res = await axios.get(`http://localhost:5000/donor/${id}`);
            donorMap[id] = res.data?.location || 'Unknown';
          } catch {
            donorMap[id] = 'Unknown';
          }
        })
      );

      matches = matches.map((d) => ({
        ...d,
        donorLocation: d.donorLocation || donorMap[d.donorId] || 'Unknown',
      }));

      // 🧠 Separate matches
      setPending(matches.filter((m) => m.recommended === true && m.status === 'Available'));
      setOthers(matches.filter((m) => m.recommended === false && m.status === 'Available'));
      setCompleted(matches.filter((m) => m.status === 'Delivered'));
    } catch (err) {
      console.error(err);
      alert('Could not load matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [ngoId]);

  const getTag = (expiry) => {
    const diff = dayjs(expiry).diff(dayjs(), 'day');
    if (diff < 0) return ['Expired', 'bg-red-600'];
    if (diff <= 7) return ['Expiring Soon', 'bg-yellow-400 text-black'];
    return ['Active', 'bg-emerald-600'];
  };

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderCard = (d) => {
    const [tagText, tagColor] = getTag(d.expiryDate);
    return (
      <div key={d.id} className="glass p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-cyan-400/20 transition-all duration-300">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{d.medicineName}</h2>
          <p className="text-gray-300">Qty: {d.quantity}</p>
          <p className="text-gray-400">Expiry: {dayjs(d.expiryDate).format('MMM D, YYYY')}</p>
          <p className="text-gray-400">Donor Location: <span className="text-white">{d.donorLocation}</span></p>

          {d.fraudScore > 0 && (
            <p className="text-sm text-red-400 mt-1">⚠️ {d.fraudIssues?.[0]}</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${tagColor}`}>
            {tagText}
          </span>
          <button
            onClick={() => navigate(`/ngo-request?id=${d.id}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition font-semibold"
          >
            Request
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="container-75 mx-auto space-y-12">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">🧠 AI Matches</h1>
          <div className="flex items-center gap-4">
            <button onClick={fetchMatches} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition">🔄</button>
            <button
              onClick={() => navigate('/ngo-profile', { state: { email: user.email } })}
              className="px-4 py-1 bg-blue-600 rounded-full hover:bg-blue-500 transition"
            >
              Edit Profile
            </button>
            <span className="font-medium">{user.displayName}</span>
            <button onClick={logout} className="px-4 py-1 bg-red-600 rounded-full hover:bg-red-500 transition">Logout</button>
          </div>
        </div>

        {/* AI Matches */}
        {loading ? (
          <p className="text-center text-gray-400">Loading matches…</p>
        ) : pending.length === 0 ? (
          <p className="text-center text-gray-400">No AI-matched donations found right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{pending.map(renderCard)}</div>
        )}

        {/* Other Available Donations */}
        {others.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📦 Other Unmatched Donations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{others.map(renderCard)}</div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold">✅ Completed Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completed.map((d) => (
                <div key={d.id} className="glass p-6 rounded-2xl shadow-inner flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{d.medicineName}</h3>
                    <p className="text-gray-400">Delivered on {dayjs(d.confirmedAt).format('MMM D, YYYY')}</p>
                  </div>
                  <span className="text-green-400 text-2xl">✔️</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
