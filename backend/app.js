// backend/app.js
const express    = require('express');
const cors       = require('cors');
const donorRt    = require('./routes/donorRoutes');
const ngoRt      = require('./routes/ngoRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/donor', donorRt);
app.use('/ngo',   ngoRt);

app.get('/', (_,res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend up on http://localhost:${PORT}`));
