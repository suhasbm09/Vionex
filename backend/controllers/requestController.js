const db = require("../config/firebase");
const { logImpact } = require("../solanaService");

// GET /ngo/request/:id
exports.getRequest = async (req, res) => {
  try {
    const snap = await db.collection("donations").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Donation not found" });

    const d = snap.data();
    res.json({
      id: snap.id,
      medicineName: d.medicineName,
      quantity: d.quantity,
      expiryDate: d.expiryDate,
      qrCode: d.qrCode,
      status: d.status,
    });
  } catch (e) {
    console.error("Error in getRequest:", e);
    res.status(500).json({ error: "Failed to load request" });
  }
};

// POST /ngo/request/:id/confirm
exports.confirmRequest = async (req, res) => {
  try {
    await db.collection("donations").doc(req.params.id).update({
      confirmed: true,
      status: "Delivered",
      confirmedAt: new Date().toISOString(),
    });
    res.json({ success: true });
  } catch (e) {
    console.error("Error in confirmRequest:", e);
    res.status(500).json({ error: "Failed to confirm delivery" });
  }
};

// POST /ngo/request/:id/feedback
exports.sendFeedback = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { thumb } = req.body; // 'up' or 'down'

    // 1. Save feedback in donation doc
    await db.collection("donations").doc(donationId).update({
      feedback: thumb,
      feedbackAt: new Date().toISOString(),
    });

    // 2. Load donation to extract info
    const donationSnap = await db.collection("donations").doc(donationId).get();
    if (!donationSnap.exists) return res.status(404).json({ error: "Donation not found" });
    const donationData = donationSnap.data();

    const donorId = donationData.donorId;
    const ngoId = donationData.ngoId;
    const medicineName = donationData.medicineName;
    const quantity = parseInt(donationData.quantity, 10);

    if (!donorId || !ngoId) {
      return res.status(400).json({ error: "Missing donorId or ngoId in donation data" });
    }

    // 3. Load donor and NGO profile
    const donorSnap = await db.collection("donors").doc(donorId).get();
    const ngoSnap = await db.collection("ngos").doc(ngoId).get();
    if (!donorSnap.exists || !ngoSnap.exists) {
      return res.status(404).json({ error: "Donor or NGO not found" });
    }

    const donorData = donorSnap.data();
    const ngoData = ngoSnap.data();

    const donorName = donorData.name || "Anonymous Donor";
    const ngoName = ngoData.ngoName || "Unknown NGO";

    // 4. Record impact on-chain
    const timestamp = Math.floor(Date.now() / 1000);
    const result = await logImpact({
      donor: donorName,
      ngo: ngoName,
      medicine: medicineName,
      quantity,
      timestamp,
    });

    // 5. Save into Firestore (solanaLogs)
    await db.collection("solanaLogs").add({
      donorName,
      ngoName,
      medicineName,
      quantity,
      timestamp,
      txSignature: result.signature,
      impactPDA: result.impactPDA,
      counterPDA: result.counterPDA,
      loggedAt: new Date().toISOString(),
    });

    // 6. If feedback is 👍 → Add 10 points to donor
    if (thumb === 'up') {
      await db.collection("donors").doc(donorId).set({
        points: (donorData.points || 0) + 10,
      }, { merge: true });
    }

    // 7. Send response back
    return res.json({
      success: true,
      txSignature: result.signature,
    });

  } catch (err) {
    console.error("Error in sendFeedback:", err);
    return res.status(500).json({ error: "Failed to submit feedback and log impact." });
  }
};
