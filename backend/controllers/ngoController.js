// backend/controllers/ngoController.js
const db    = require('../config/firebase');
const axios = require('axios');

// 1) Create NGO profile
exports.createNgoProfile = async (req, res) => {
  try {
    const data   = req.body;
    const docRef = db.collection('ngos').doc();
    await docRef.set({ ...data, createdAt: new Date().toISOString() });
    res.status(201).json({ id: docRef.id, ...data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Failed to create NGO profile' });
  }
};

// 2) Lookup by email
exports.getNgoByEmail = async (req, res) => {
  try {
    const snaps = await db
      .collection('ngos')
      .where('email','==', req.params.email)
      .limit(1)
      .get();
    if (snaps.empty) return res.status(404).end();
    const doc = snaps.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Lookup failed' });
  }
};

// 3) Fetch AI matches
exports.getNgoMatches = async (req, res) => {
  try {
    const ngoId   = req.params.id;
    const ngoSnap = await db.collection('ngos').doc(ngoId).get();
    if (!ngoSnap.exists) return res.status(404).json({ error:'NGO not found' });

    const ngoProfile = { id: ngoSnap.id, ...ngoSnap.data() };
    const donsSnap   = await db.collection('donations').get();
    const donations  = donsSnap.docs.map(d => ({ id:d.id, ...d.data() }));

    // your AI matcher service
    const { data } = await axios.post('http://localhost:5001/match', {
      ngoProfile, donations
    });

    res.json({ matches: data.matches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Fetch matches failed' });
  }
};
