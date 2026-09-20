const express = require('express');
const router  = express.Router();
const { getVenues, getVenueById } = require('../controllers/venueController');

router.get('/',    getVenues);
router.get('/:id', getVenueById);

module.exports = router;
