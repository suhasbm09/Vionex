// backend/routes/donorRoutes.js
const express = require('express');
const ctrl    = require('../controllers/donorController');
const router  = express.Router();

router.post('/profile',               ctrl.createDonorProfile);
router.get('/email/:email',           ctrl.getDonorByEmail);
router.get('/:id/profile',            ctrl.getDonorProfile);
router.get('/:id/donations',          ctrl.getDonorDonations);
router.post('/:id/donations',         ctrl.addDonation);
// single endpoint for both NGO request & Donor delivery
router.patch('/:id/donations/confirm', ctrl.confirmDonation);

module.exports = router;
