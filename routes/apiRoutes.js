const express = require('express');
const router  = express.Router();
const Venue   = require('../models/Venue');
const Booking = require('../models/Booking');

/* ─────────────────────────────────────────────────────────────────
   GET /api/venues
   Query params: search, capacity, amenities (comma-separated)
   Returns JSON array of matching venues (AJAX, no page reload)
───────────────────────────────────────────────────────────────── */
router.get('/venues', async (req, res) => {
  try {
    const { search, capacity, amenities } = req.query;
    const filter = { status: 'Active' };

    if (search && search.trim()) {
      filter.$or = [
        { name       : { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location   : { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (capacity && parseInt(capacity) > 0) {
      filter.capacity = { $gte: parseInt(capacity) };
    }
    if (amenities && amenities.trim()) {
      const list = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (list.length) filter.amenities = { $all: list };
    }

    const venues = await Venue.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, venues });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/venues/:id/bookings
   Returns FullCalendar-compatible event objects for a venue
───────────────────────────────────────────────────────────────── */
router.get('/venues/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({
      venueId      : req.params.id,
      bookingStatus: { $in: ['Pending', 'Approved'] }
    });

    const events = bookings.map(b => ({
      id             : b._id,
      title          : b.bookingStatus === 'Approved' ? '🔴 Booked' : '🟡 Pending',
      start          : b.startTime,
      end            : b.endTime,
      backgroundColor: b.bookingStatus === 'Approved' ? '#f43f5e' : '#f59e0b',
      borderColor    : b.bookingStatus === 'Approved' ? '#f43f5e' : '#f59e0b',
      textColor      : '#ffffff',
      extendedProps  : { status: b.bookingStatus }
    }));

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
