// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function LeaderboardPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const colRef = collection(db, 'donors'); // ✅ Correct collection
        const q = query(colRef, orderBy('points', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDonors(list);
      } catch (e) {
        console.error('Leaderboard load failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getMedal = (index) => {
    return index === 0
      ? '🥇'
      : index === 1
      ? '🥈'
      : index === 2
      ? '🥉'
      : '🔹';
  };

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="glass p-10 rounded-3xl max-w-4xl mx-auto space-y-8 shadow-xl animate-slide-up">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
          🏆 Top Donors Leaderboard
        </h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading leaderboard…</p>
        ) : donors.length === 0 ? (
          <p className="text-center text-gray-400">No donors yet. Be the first to earn points!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-center border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 border-b border-white/10">Rank</th>
                  <th className="px-4 py-3 border-b border-white/10">Name</th>
                  <th className="px-4 py-3 border-b border-white/10">Points</th>
                </tr>
              </thead>
              <tbody>
                {donors.slice(0, 5).map((d, i) => (
                  <tr
                    key={d.id}
                    className={`${
                      i === 0
                        ? 'bg-yellow-900/30'
                        : i === 1
                        ? 'bg-slate-700/30'
                        : i === 2
                        ? 'bg-amber-800/20'
                        : i % 2 === 0
                        ? 'bg-gray-800'
                        : 'bg-gray-700'
                    }`}
                  >
                    <td className="px-4 py-3 border-b border-white/10 font-bold text-lg">
                      {getMedal(i)}
                    </td>
                    <td className="px-4 py-3 border-b border-white/10 font-medium">
                      {d.name}
                    </td>
                    <td className="px-4 py-3 border-b border-white/10 text-cyan-400 font-semibold">
                      {d.points || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-center text-gray-400 pt-4">
          💡 Earn 10 points for each thumbs-up feedback from NGOs.
        </p>
      </div>
    </div>
  );
}
