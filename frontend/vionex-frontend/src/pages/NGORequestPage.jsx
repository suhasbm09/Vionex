import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NGORequestPage() {
  const [params] = useSearchParams();
  const donationId = params.get('id');
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState('');
  const [phase, setPhase] = useState('requested');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (!donationId) return navigate('/ngo-dashboard', { replace: true });

    const uniqueText = `QR-${donationId.slice(-4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setQrCode(uniqueText);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    axios
      .patch(`http://localhost:5000/donor/${donationId}/donations/confirm`, {
        qrCode: uniqueText,
        ngoId: user.id,
      })
      .then(() => setPhase('requested'))
      .catch(() => {
        alert('Failed to register request.');
        navigate('/ngo-dashboard', { replace: true });
      });
  }, [donationId, navigate]);

  const handleDelivered = async () => {
    try {
      await axios.post(`http://localhost:5000/ngo/request/${donationId}/confirm`);
      setPhase('delivered');
      setShowFeedbackModal(true);
    } catch {
      alert('Failed to confirm delivery.');
    }
  };

  const sendFeedback = async (thumb) => {
    try {
      await axios.post(`http://localhost:5000/ngo/request/${donationId}/feedback`, { thumb });
      navigate('/ngo-dashboard', { replace: true });
    } catch {
      alert('Failed to submit feedback.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass container-75 p-10 rounded-3xl shadow-xl space-y-10 text-white text-center animate-slide-up">

        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-400">
          📦 Delivery Confirmation
        </h2>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4">
          {['Requested', 'Delivered', 'Feedback'].map((label, i) => {
            const active = ['requested', 'delivered', 'feedback'][i] === phase;
            return (
              <React.Fragment key={label}>
                <div className={`flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full ${active ? 'bg-cyan-500 shadow-md' : 'bg-gray-700'} flex items-center justify-center`}>
                    <span className="text-sm font-semibold">{i + 1}</span>
                  </div>
                  <span className="text-sm mt-1">{label}</span>
                </div>
                {i < 2 && <div className="w-10 h-1 bg-white/20 rounded-full" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* QR Code Display */}
        <div className="space-y-2">
          <p className="text-gray-300">Present this QR code to the donor:</p>
          <div className="bg-gray-800 px-6 py-4 rounded-xl font-mono text-xl text-cyan-400 border border-white/10 shadow-inner tracking-wider">
            {qrCode}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-left text-gray-300">
          <h4 className="text-lg font-semibold text-white mb-2">🛠 Delivery Steps</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Note down the QR above or print it.</li>
            <li>Stick it on the medicine package.</li>
            <li>Hand it over to the donor physically.</li>
          </ol>
        </div>

        {phase === 'requested' && (
          <button
            onClick={handleDelivered}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition"
          >
            ✅ Mark as Delivered
          </button>
        )}
      </div>

      {/* 🌟 Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-8 max-w-md w-full rounded-3xl text-center border border-white/10 shadow-2xl animate-slide-up space-y-6">
            <h3 className="text-2xl font-bold text-white">How was the delivery?</h3>
            <p className="text-gray-300">Your feedback helps maintain quality across the platform.</p>
            <div className="flex justify-center gap-10 mt-6">
              <button
                onClick={() => sendFeedback('up')}
                className="w-24 h-24 bg-green-600 hover:bg-green-500 rounded-xl flex flex-col items-center justify-center text-4xl transition-transform hover:scale-105 shadow-lg"
              >
                👍
                <span className="text-sm font-semibold mt-1">Thumbs Up</span>
              </button>
              <button
                onClick={() => sendFeedback('down')}
                className="w-24 h-24 bg-red-600 hover:bg-red-500 rounded-xl flex flex-col items-center justify-center text-4xl transition-transform hover:scale-105 shadow-lg"
              >
                👎
                <span className="text-sm font-semibold mt-1">Thumbs Down</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
