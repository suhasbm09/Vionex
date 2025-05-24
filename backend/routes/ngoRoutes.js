// backend/routes/ngoRoutes.js
const express = require('express');
const c       = require('../controllers/ngoController');
const router  = express.Router();

router.post('/profile',                   c.createNgoProfile);
router.get('/email/:email',               c.getNgoByEmail);
router.get('/:id/matches',                c.getNgoMatches);
router.get('/request/:requestId',         c.getNgoRequest);
router.post('/request/:requestId/confirm',c.confirmNgoRequest);
router.post('/request/:requestId/feedback',c.sendNgoFeedback);

module.exports = router;
