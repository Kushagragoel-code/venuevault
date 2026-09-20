const Booking = require('../models/Booking');
const Venue   = require('../models/Venue');

/* ─── GET /dashboard ──────────────────────────────────────────── */
const getOrgDashboard = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ organiserId: req.user._id })
      .populate('venueId', 'name location images pricePerHour')
      .sort({ startTime: -1 });

    const now = new Date();

    const upcoming = bookings.filter(b =>
      ['Pending', 'Approved'].includes(b.bookingStatus) && new Date(b.startTime) > now
    );
    const past = bookings.filter(b =>
      b.bookingStatus === 'Completed' ||
      b.bookingStatus === 'Rejected'  ||
      (b.bookingStatus === 'Approved' && new Date(b.endTime) < now)
    );

    const totalSpent = bookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.render('dashboard/organiser', {
      title     : 'My Dashboard',
      bookings,
      upcoming,
      past,
      totalSpent
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /bookings ──────────────────────────────────────────── */
const createBooking = async (req, res, next) => {
  try {
    const { venueId, eventName, startTime, endTime, notes } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      req.flash('error_msg', 'Venue not found.');
      return res.redirect('/venues');
    }

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      req.flash('error_msg', 'Invalid date format.');
      return res.redirect(`/venues/${venueId}`);
    }
    if (end <= start) {
      req.flash('error_msg', 'End time must be after start time.');
      return res.redirect(`/venues/${venueId}`);
    }
    if (start < new Date()) {
      req.flash('error_msg', 'You cannot book a slot in the past.');
      return res.redirect(`/venues/${venueId}`);
    }

    /* ── Overlap check (DB-level, race-condition safe) ── */
    const overlapping = await Booking.findOne({
      venueId,
      bookingStatus: { $in: ['Pending', 'Approved'] },
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    });

    if (overlapping) {
      req.flash('error_msg',
        'This time slot overlaps with an existing booking. Please choose a different time.');
      return res.status(400).redirect(`/venues/${venueId}`);
    }

    /* ── Calculate total ── */
    const hours       = (end - start) / (1000 * 60 * 60);
    const totalAmount = parseFloat((hours * venue.pricePerHour).toFixed(2));

    const booking = await Booking.create({
      venueId,
      organiserId : req.user._id,
      eventName,
      startTime   : start,
      endTime     : end,
      totalAmount,
      notes       : notes || ''
    });

    req.flash('success_msg',
      `Booking submitted! ID: ${booking._id} — Awaiting admin approval.`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

/* ─── POST /bookings/:id/pay ──────────────────────────────────── */
const processPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id        : req.params.id,
      organiserId: req.user._id
    });

    if (!booking) {
      req.flash('error_msg', 'Booking not found.');
      return res.redirect('/dashboard');
    }
    if (booking.bookingStatus !== 'Approved') {
      req.flash('error_msg', 'Payment can only be processed for Approved bookings.');
      return res.redirect('/dashboard');
    }
    if (booking.paymentStatus === 'Paid') {
      req.flash('error_msg', 'This booking is already paid.');
      return res.redirect('/dashboard');
    }

    /* Mock Razorpay – mark as Paid */
    booking.paymentStatus = 'Paid';
    await booking.save();

    req.flash('success_msg', '💳 Payment successful! Your booking is confirmed.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrgDashboard, createBooking, processPayment };
