import React, { useState } from 'react';

const LoginModal = ({ role, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSubmit(email.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl font-bold transition duration-200"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-6 tracking-wide">
          {role === 'donor' ? '🎁 Donor Login' : '🏥 NGO Login'}
        </h2>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white/70 mb-2 text-sm tracking-wide">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-white/30 transition duration-300"
            />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white/80 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition duration-200"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
