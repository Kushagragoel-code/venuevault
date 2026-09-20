const User = require('../models/User');

/**
 * isAuth – protects any route that requires a logged-in user.
 * Stores the originally requested URL so we can redirect back after login.
 */
const isAuth = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Please log in to access this page.');
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      req.session.destroy();
      req.flash('error_msg', 'Session expired. Please log in again.');
      return res.redirect('/login');
    }
    req.user              = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * isAdmin – must be chained AFTER isAuth.
 * Returns 403 if the logged-in user is not an Admin.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).render('error', {
      statusCode: 403,
      message   : 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = { isAuth, isAdmin };
