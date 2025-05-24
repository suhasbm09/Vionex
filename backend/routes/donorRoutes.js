// backend/routes/donorRoutes.js
const express = require('express');
const c       = require('../controllers/donorController');
const router  = express.Router();

// Donor profile
router.post('/profile',             c.createDonorProfile);
router.get('/email/:email',         c.getDonorByEmail);
router.get('/:id/profile',          c.getDonorProfile);

// Donations CRUD
router.get('/:id/donations',        c.getDonorDonations);
router.post('/:id/donations',       c.addDonation);

// Confirm donation (handover)
router.patch('/:id/donations/confirm', c.confirmDonation);

module.exports = router;
