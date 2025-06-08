// backend/controllers/donorController.js
const db = require('../config/firebase');

// 1) create profile
exports.createDonorProfile = async (req, res) => {
  try {
    const docRef = db.collection('donors').doc();
    await docRef.set({ ...req.body, createdAt: new Date().toISOString() });
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Failed to create donor' });
  }
};

// 2) lookup by email
exports.getDonorByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const snaps = await db
      .collection('donors')
      .where('email','==', email)
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

// 3) get full profile by id
exports.getDonorProfile = async (req, res) => {
  try {
    const snap = await db.collection('donors').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error:'Donor not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Fetch failed' });
  }
};

// 4) list donations
exports.getDonorDonations = async (req, res) => {
  try {
    const snaps = await db
      .collection('donations')
      .where('donorId','==', req.params.id)
      .get();
    const donations = snaps.docs.map(d => ({ id:d.id, ...d.data() }));
    res.json({ donations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Fetch donations failed' });
  }
};

// 5) add donation
exports.addDonation = async (req, res) => {
  try {
    const docRef = await db.collection('donations').add({
      ...req.body,
      donorId: req.params.id,
      status: 'Available',
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Add donation failed' });
  }
};

// 6) confirmDonation: handles both 'request' (NGO grabs) & 'delivery' (donor hands over)
exports.confirmDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    const updates = {};

    if (req.body.qrCode && req.body.ngoId) {
      // NGO has requested it
      updates.qrCode = req.body.qrCode;
      updates.ngoId   = req.body.ngoId;
      updates.status  = 'Requested';
      updates.requestedAt = new Date().toISOString();
    } else {
      // Donor confirms physical handoff
      updates.confirmed     = true;
      updates.status        = 'Delivered';
      updates.confirmedAt   = new Date().toISOString();
    }

    await db.collection('donations').doc(donationId).update(updates);
    res.json({ success:true, updates });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'Confirm failed' });
  }
};
