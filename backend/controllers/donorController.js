// backend/controllers/donorController.js
const db = require('../config/firebase');

// 1. Create donor profile
exports.createDonorProfile = async (req, res) => {
  try {
    const doc = db.collection('donors').doc();
    await doc.set({ ...req.body, createdAt: new Date().toISOString() });
    return res.status(201).json({ id: doc.id, ...req.body });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create donor profile' });
  }
};

// 2. Lookup donor by email
exports.getDonorByEmail = async (req, res) => {
  try {
    const snaps = await db.collection('donors').where('email','==',req.params.email).limit(1).get();
    if (snaps.empty) return res.status(404).end();
    const d = snaps.docs[0];
    return res.json({ id: d.id, ...d.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Lookup failed' });
  }
};

// 3. Fetch donor profile
exports.getDonorProfile = async (req, res) => {
  try {
    const snap = await db.collection('donors').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Donor not found' });
    return res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Fetch failed' });
  }
};

// 4. List donations
exports.getDonorDonations = async (req, res) => {
  try {
    const snaps = await db.collection('donations').where('donorId','==',req.params.id).get();
    const donations = snaps.docs.map(d=>({ id: d.id, ...d.data() }));
    return res.json({ donations });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Fetch donations failed' });
  }
};

// 5. Add donation
exports.addDonation = async (req, res) => {
  try {
    const donorId = req.params.id;
    const { medicineName, quantity, expiryDate } = req.body;
    const doc = await db.collection('donations').add({
      donorId, medicineName, quantity, expiryDate,
      status: 'Pending', createdAt: new Date().toISOString()
    });
    return res.status(201).json({ id: doc.id, medicineName, quantity, expiryDate });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Add failed' });
  }
};

// 6. Confirm donation
exports.confirmDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    // assume qrCode & ngoId passed in body
    await db.collection('donations').doc(donationId).update({
      ...req.body,
      confirmed: true,
      confirmedAt: new Date().toISOString()
    });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Confirm failed' });
  }
};
