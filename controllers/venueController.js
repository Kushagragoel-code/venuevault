const Venue = require('../models/Venue');

/* ─── GET /venues ─────────────────────────────────────────────── */
const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.render('venues/index', { title: 'Browse Venues', venues });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /venues/:id ─────────────────────────────────────────── */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).render('error', { statusCode: 404, message: 'Venue not found.' });
    }
    res.render('venues/show', { title: venue.name, venue });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVenues, getVenueById };
