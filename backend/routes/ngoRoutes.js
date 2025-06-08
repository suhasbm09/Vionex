// backend/routes/ngoRoutes.js
const express = require('express');
const ngoCtrl = require('../controllers/ngoController');
const reqCtrl = require('../controllers/requestController');
const router  = express.Router();

// NGO profile & matching
router.post('/profile',        ngoCtrl.createNgoProfile);
router.get('/email/:email',    ngoCtrl.getNgoByEmail);
router.get('/:id/matches',     ngoCtrl.getNgoMatches);

// Request flow
router.get('/request/:id',         reqCtrl.getRequest);
router.post('/request/:id/confirm', reqCtrl.confirmRequest);
router.post('/request/:id/feedback',reqCtrl.sendFeedback);

module.exports = router;
