const express = require('express');
const router  = express.Router();
const { createBooking, processPayment } = require('../controllers/bookingController');
const { isAuth } = require('../middleware/authMiddleware');

/* Dashboard was moved to authRoutes (/dashboard) – see authRoutes.js */
router.post('/',         isAuth, createBooking);
router.post('/:id/pay', isAuth, processPayment);

module.exports = router;
