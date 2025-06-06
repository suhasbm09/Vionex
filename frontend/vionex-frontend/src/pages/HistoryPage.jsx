import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

// Firebase config
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

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logsRef = collection(db, "solanaLogs");
        const q = query(logsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const logList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(logList);
      } catch (err) {
        console.error("Error fetching solanaLogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Loading on‐chain history…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-500 mb-10">
          🕑 On‐Chain Donation History
        </h1>

        {records.length === 0 ? (
          <p className="text-center text-gray-400">No on‐chain records found.</p>
        ) : (
          <div className="overflow-x-auto glass border border-white/10 rounded-xl shadow-xl">
            <table className="min-w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-cyan-300 bg-white/10 border-b border-white/10">
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">NGO</th>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-center">Solscan</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/5 transition duration-300 even:bg-gray-800 odd:bg-gray-700"
                  >
                    <td className="px-4 py-2">{r.donorName}</td>
                    <td className="px-4 py-2">{r.ngoName}</td>
                    <td className="px-4 py-2">{r.medicineName}</td>
                    <td className="px-4 py-2">{r.quantity}</td>
                    <td className="px-4 py-2">
                      {new Date(r.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <a
                        href={`https://solscan.io/tx/${r.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        View ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
