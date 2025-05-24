// backend/controllers/ngoController.js
const db                       = require('../config/firebase');
const axios                    = require('axios');
const { logConfirmationOnChain } = require('../solanaLogger');

// 1) Create NGO
async function createNgoProfile(req,res){
  try{
    const doc = db.collection('ngos').doc();
    await doc.set({...req.body,createdAt:new Date().toISOString()});
    res.status(201).json({id:doc.id,...req.body});
  }catch(e){
    console.error('createNgoProfile',e);
    res.status(500).json({error:'NGO create failed'});
  }
}

// 2) Lookup by email
async function getNgoByEmail(req,res){
  try{
    const snaps=await db.collection('ngos')
      .where('email','==',req.params.email)
      .limit(1).get();
    if(snaps.empty) return res.status(404).end();
    const d=snaps.docs[0];
    res.json({id:d.id,...d.data()});
  }catch(e){
    console.error('getNgoByEmail',e);
    res.status(500).json({error:'NGO lookup failed'});
  }
}

// 3) AI matches
async function getNgoMatches(req,res){
  try{
    const ngoId=req.params.id;
    const ngoSnap=await db.collection('ngos').doc(ngoId).get();
    if(!ngoSnap.exists) return res.status(404).json({error:'NGO not found'});
    const ngoProfile={id:ngoSnap.id,...ngoSnap.data()};
    const donations=(await db.collection('donations').get())
      .docs.map(d=>({id:d.id,...d.data()}));
    const {data}=await axios.post('http://localhost:5001/match',{ngoProfile,donations});
    res.json({ngoId,matches:data.matches});
  }catch(e){
    console.error('getNgoMatches',e);
    res.status(500).json({error:'Match fetch failed'});
  }
}

// 4) Single request
async function getNgoRequest(req,res){
  try{
    const snap=await db.collection('donations').doc(req.params.requestId).get();
    if(!snap.exists) return res.status(404).json({error:'Request not found'});
    res.json({id:snap.id,...snap.data()});
  }catch(e){
    console.error('getNgoRequest',e);
    res.status(500).json({error:'Request fetch failed'});
  }
}

// 5) Confirm delivery
async function confirmNgoRequest(req,res){
  try{
    const id=req.params.requestId;
    await db.collection('donations').doc(id).update({
      confirmed:true,confirmedAt:new Date().toISOString()
    });
    res.json({success:true});
  }catch(e){
    console.error('confirmNgoRequest',e);
    res.status(500).json({error:'Confirm failed'});
  }
}

// 6) Feedback + on-chain log
async function sendNgoFeedback(req,res){
  const id=req.params.requestId;
  const {thumb} = req.body;
  console.log('Feedback:',id,thumb);
  if(!thumb) return res.status(400).json({error:'Missing thumb'});
  // Firestore
  try{
    await db.collection('donations').doc(id).update({
      feedback:thumb,feedbackAt:new Date().toISOString()
    });
  }catch(e){
    console.error('Firestore feedback error',e);
    return res.status(500).json({error:'Write feedback failed'});
  }
  // Solana
  try{
    const tx=await logConfirmationOnChain({donationId:id,verificationCode:thumb});
    return res.json({success:true,txSignature:tx});
  }catch(e){
    console.error('Solana log error',e);
    return res.status(500).json({error:'Solana log failed',details:e.message});
  }
}

module.exports = {
  createNgoProfile,
  getNgoByEmail,
  getNgoMatches,
  getNgoRequest,
  confirmNgoRequest,
  sendNgoFeedback
};
