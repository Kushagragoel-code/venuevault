const express = require('express');
const router  = express.Router();
const { isAuth, isAdmin } = require('../middleware/authMiddleware');
const {
  getAdminDashboard,
  getAdminVenues, getNewVenueForm, createVenue,
  getEditVenueForm, updateVenue, deleteVenue,
  getAdminBookings, approveBooking, rejectBooking
} = require('../controllers/adminController');

/* All admin routes require auth + admin role */
router.use(isAuth, isAdmin);

/* Dashboard */
router.get('/', getAdminDashboard);

/* Venue CRUD */
router.get('/venues',          getAdminVenues);
router.get('/venues/new',      getNewVenueForm);
router.post('/venues',         createVenue);
router.get('/venues/:id/edit', getEditVenueForm);
router.put('/venues/:id',      updateVenue);
router.delete('/venues/:id',   deleteVenue);

/* Booking management */
router.get('/bookings',              getAdminBookings);
router.put('/bookings/:id/approve',  approveBooking);
router.put('/bookings/:id/reject',   rejectBooking);

module.exports = router;
