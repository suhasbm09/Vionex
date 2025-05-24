import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, CheckCircle, ThumbsUp, ThumbsDown, QrCode, AlertCircle } from 'lucide-react';

export default function NGORequestPage() {
  const [params]     = useSearchParams();
  const id           = params.get('id');
  const nav          = useNavigate();
  const [reqData, setReqData] = useState(null);
  const [mode, setMode]       = useState('confirm');
  const [txSig, setTxSig]     = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return nav('/',{replace:true});
    axios.get(`http://localhost:5000/ngo/request/${id}`)
      .then(r => setReqData(r.data))
      .catch(() => setError('Request not found'));
  },[id]);

  const confirmDelivery = () => {
    axios.post(`http://localhost:5000/ngo/request/${id}/confirm`)
      .then(() => setMode('feedback'))
      .catch(()=>alert('Confirm failed'));
  };

  const sendFeedback = (thumb) => {
    axios.post(`http://localhost:5000/ngo/request/${id}/feedback`,{thumb})
      .then(r=>setTxSig(r.data.txSignature))
      .catch(e=>alert(e.response?.data?.error || 'Feedback failed'));
  };

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white/10 p-8 rounded-xl text-white text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400"/>
        <p>{error}</p>
        <button onClick={()=>nav('/ngo-dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 rounded">Back</button>
      </div>
    </div>
  );
  if (!reqData) return null;

  return (
    <motion.div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00121F] to-[#002F34] p-6">
      <motion.div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl w-full max-w-md text-white space-y-6">
        <button onClick={()=>nav(-1)} className="float-right"><X/></button>
        <h2 className="text-2xl text-center">Request Confirmation</h2>
        <div className="text-center space-y-2">
          <QrCode size={56} className="mx-auto text-teal-400"/>
          <code className="block bg-gray-800 px-4 py-2 rounded">{reqData.qrCode}</code>
        </div>

        {mode==='confirm' ? (
          <button
            onClick={confirmDelivery}
            className="w-full py-3 bg-teal-500 rounded-lg flex items-center justify-center gap-2"
          >
            <CheckCircle/> Confirm Delivery
          </button>
        ):(
          <>
            <p className="text-center">How did it go?</p>
            <div className="flex justify-around">
              <button onClick={()=>sendFeedback('up')} className="p-3 bg-green-600 rounded"><ThumbsUp/></button>
              <button onClick={()=>sendFeedback('down')} className="p-3 bg-red-600 rounded"><ThumbsDown/></button>
            </div>
            {txSig && (
              <a
                href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="block mt-4 text-center text-indigo-400 hover:underline"
              >
                View on Solscan
              </a>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
