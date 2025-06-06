// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const openModal = (r) => {
    setRole(r);
    setShowModal(true);
  };

  const handleLogin = async (email) => {
    setShowModal(false);
    try {
      const res = await axios.get(
        `http://localhost:5000/${role}/email/${encodeURIComponent(email)}`
      );
      const profile = res.data;
      const name = profile.name || profile.ngoName || email;
      localStorage.setItem(
        'user',
        JSON.stringify({ id: profile.id, role, displayName: name, email })
      );
      navigate(role === 'donor' ? '/donor-dashboard' : '/ngo-dashboard', {
        state: { id: profile.id },
      });
    } catch (err) {
      if (err.response?.status === 404) {
        navigate(role === 'donor' ? '/donor-profile' : '/ngo-profile', {
          state: { email },
        });
      } else {
        console.error('Login lookup failed:', err);
        alert('Unable to log in right now.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden px-4">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:20px_20px] opacity-20 animate-pulse" />
      </div>

      {/* Foreground Glass Content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 glass bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl z-10 border border-white/10 py-12 space-y-12 text-center animate-slide-up">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-500 tracking-wide animate-slide-down">
          Welcome to Vionex
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
          A futuristic, decentralized bridge for healthcare impact. Powered by AI. Verified by Solana.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => openModal('donor')}
            className="px-8 py-3 rounded-xl text-white font-semibold bg-cyan-700 hover:bg-cyan-600 transition duration-300 hover:scale-105 shadow-md cursor-pointer"
          >
            🎁 I’m a Donor
          </button>
          <button
            onClick={() => openModal('ngo')}
            className="px-8 py-3 rounded-xl text-white font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 transition duration-300 hover:scale-105 shadow-md cursor-pointer"
          >
            🏥 I’m an NGO
          </button>
        </div>

        {/* How It Works Section */}
        <div className="mt-10 space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            🚀 How Vionex Works
          </h3>

          <div className="grid sm:grid-cols-3 gap-8 text-white/90">
            {/* Step 1 */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-cyan-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
              <div className="text-5xl mb-4">🎁</div>
              <h4 className="text-xl font-semibold mb-2">Step 1: Donate Medicine</h4>
              <p className="text-sm">
                Donors upload surplus medicine securely to Vionex with QR-code tracking. Everything is logged transparently.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-fuchsia-500 transition-all duration-300 shadow-lg hover:shadow-fuchsia-500/20">
              <div className="text-5xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold mb-2">Step 2: NGOs Request & Verify</h4>
              <p className="text-sm">
                Verified NGOs request donations. Feedback is logged on-chain to ensure trust, quality, and traceability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20">
              <div className="text-5xl mb-4">🧾</div>
              <h4 className="text-xl font-semibold mb-2">Step 3: Earn Impact Points</h4>
              <p className="text-sm">
                Donors receive gamified “Impact Points” and leaderboard status when their donation is successfully used.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && (
        <LoginModal
          role={role}
          onClose={() => setShowModal(false)}
          onSubmit={handleLogin}
        />
      )}
    </div>
  );
}
