// backend/app.js
const express = require('express');
const cors    = require('cors');

const donorRoutes = require('./routes/donorRoutes');
const ngoRoutes   = require('./routes/ngoRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/donor', donorRoutes);
app.use('/ngo',   ngoRoutes);

app.get('/', (_,res) => res.json({ status:'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
