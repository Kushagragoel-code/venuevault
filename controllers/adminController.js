const Venue   = require('../models/Venue');
const Booking = require('../models/Booking');
const User    = require('../models/User');

/* ── Helpers ──────────────────────────────────────────────────── */
const getMonthlyRevenue = (bookings = []) => {
  const labels = [];
  const data   = [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    const rev = safeBookings
      .filter(b => {
        if (!b || !b.createdAt) return false;
        const bd = new Date(b.createdAt);
        return bd.getFullYear() === d.getFullYear() &&
               bd.getMonth()    === d.getMonth()    &&
               b.paymentStatus  === 'Paid';
      })
      .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    data.push(parseFloat(rev.toFixed(2)));
  }
  return { labels, data };
};

/* ─── GET /admin ──────────────────────────────────────────────── */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [venues, bookings, users] = await Promise.all([
      Venue.find().sort({ createdAt: -1 }),
      Booking.find()
        .populate('venueId', 'name')
        .populate('organiserId', 'name email')
        .sort({ createdAt: -1 }),
      User.find().select('-password')
    ]);

    const pendingBookings  = bookings.filter(b => b.bookingStatus === 'Pending');
    const approvedBookings = bookings.filter(b => b.bookingStatus === 'Approved');
    const totalRevenue     = bookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((s, b) => s + b.totalAmount, 0);

    const monthlyRevenue = getMonthlyRevenue(bookings);

    res.render('dashboard/admin', {
      title          : 'Admin Dashboard',
      venues         : venues || [],
      bookings       : bookings || [],
      pendingBookings: pendingBookings || [],
      approvedBookings: approvedBookings || [],
      users          : users || [],
      totalRevenue   : parseFloat((totalRevenue || 0).toFixed(2)),
      monthlyRevenue : monthlyRevenue || { labels: [], data: [] }
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /admin/venues ───────────────────────────────────────── */
const getAdminVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.render('admin/venues', { title: 'Manage Venues', venues });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /admin/venues/new ───────────────────────────────────── */
const getNewVenueForm = (req, res) => {
  res.render('admin/venue-form', {
    title  : 'Add New Venue',
    venue  : null,
    action : '/admin/venues',
    method : 'POST'
  });
};

/* ─── POST /admin/venues ──────────────────────────────────────── */
const createVenue = async (req, res, next) => {
  try {
    const { name, description, location, capacity, pricePerHour, amenities, images, status } = req.body;
    const amenityList = amenities
      ? amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];
    const imageList = images
      ? images.split('\n').map(i => i.trim()).filter(Boolean)
      : [];

    await Venue.create({
      name, description, location,
      capacity    : parseInt(capacity),
      pricePerHour: parseFloat(pricePerHour),
      amenities   : amenityList,
      images      : imageList,
      status      : status || 'Active'
    });

    req.flash('success_msg', `Venue "${name}" created successfully!`);
    res.redirect('/admin/venues');
  } catch (err) {
    next(err);
  }
};

/* ─── GET /admin/venues/:id/edit ──────────────────────────────── */
const getEditVenueForm = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).render('error', { statusCode: 404, message: 'Venue not found.' });
    res.render('admin/venue-form', {
      title  : `Edit – ${venue.name}`,
      venue,
      action : `/admin/venues/${venue._id}?_method=PUT`,
      method : 'POST'
    });
  } catch (err) {
    next(err);
  }
};

/* ─── PUT /admin/venues/:id ───────────────────────────────────── */
const updateVenue = async (req, res, next) => {
  try {
    const { name, description, location, capacity, pricePerHour, amenities, images, status } = req.body;
    const amenityList = amenities
      ? amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];
    const imageList = images
      ? images.split('\n').map(i => i.trim()).filter(Boolean)
      : [];

    await Venue.findByIdAndUpdate(
      req.params.id,
      { name, description, location,
        capacity    : parseInt(capacity),
        pricePerHour: parseFloat(pricePerHour),
        amenities   : amenityList,
        images      : imageList,
        status },
      { new: true, runValidators: true }
    );

    req.flash('success_msg', 'Venue updated successfully!');
    res.redirect('/admin/venues');
  } catch (err) {
    next(err);
  }
};

/* ─── DELETE /admin/venues/:id ────────────────────────────────── */
const deleteVenue = async (req, res, next) => {
  try {
    await Venue.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Venue deleted.');
    res.redirect('/admin/venues');
  } catch (err) {
    next(err);
  }
};

/* ─── GET /admin/bookings ─────────────────────────────────────── */
const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('venueId', 'name')
      .populate('organiserId', 'name email')
      .sort({ createdAt: -1 });
    res.render('admin/bookings', { title: 'Manage Bookings', bookings });
  } catch (err) {
    next(err);
  }
};

/* ─── PUT /admin/bookings/:id/approve ────────────────────────── */
const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.flash('error_msg', 'Booking not found.');
      return res.redirect('/admin/bookings');
    }

    /* Race-condition check: confirm no other approved booking overlaps */
    const conflict = await Booking.findOne({
      _id          : { $ne: booking._id },
      venueId      : booking.venueId,
      bookingStatus: 'Approved',
      $or          : [{ startTime: { $lt: booking.endTime }, endTime: { $gt: booking.startTime } }]
    });

    if (conflict) {
      req.flash('error_msg',
        'Cannot approve: this slot conflicts with an already-approved booking.');
      return res.redirect('/admin/bookings');
    }

    booking.bookingStatus = 'Approved';
    await booking.save();

    req.flash('success_msg', 'Booking approved ✅');
    res.redirect('/admin/bookings');
  } catch (err) {
    next(err);
  }
};

/* ─── PUT /admin/bookings/:id/reject ─────────────────────────── */
const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'Rejected' },
      { new: true }
    );
    if (!booking) {
      req.flash('error_msg', 'Booking not found.');
      return res.redirect('/admin/bookings');
    }
    req.flash('success_msg', 'Booking rejected.');
    res.redirect('/admin/bookings');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getAdminVenues, getNewVenueForm, createVenue,
  getEditVenueForm, updateVenue, deleteVenue,
  getAdminBookings, approveBooking, rejectBooking
};
