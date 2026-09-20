const User = require('../models/User');

/* ─── GET /register ───────────────────────────────────────────── */
const getRegister = (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Create Account' });
};

/* ─── POST /register ──────────────────────────────────────────── */
const postRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password) {
      req.flash('error_msg', 'All fields are required.');
      return res.redirect('/register');
    }
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash('error_msg', 'An account with that email already exists.');
      return res.redirect('/register');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'Admin' ? 'Admin' : 'Organiser'
    });

    req.session.userId = user._id.toString();
    req.session.user   = { _id: user._id, name: user.name, email: user.email, role: user.role };

    req.flash('success_msg', `Welcome to VenueVault, ${user.name}! 🎉`);
    return res.redirect(user.role === 'Admin' ? '/admin' : '/dashboard');
  } catch (err) {
    next(err);
  }
};

/* ─── GET /login ──────────────────────────────────────────────── */
const getLogin = (req, res) => {
  if (req.session.userId) {
    // Already logged in – redirect appropriately
    const dest = req.session.user && req.session.user.role === 'Admin' ? '/admin' : '/dashboard';
    return res.redirect(dest);
  }
  // Persist an explicit ?redirect param (e.g. from "Sign In to Book" on venue page)
  if (req.query.redirect && !req.session.returnTo) {
    req.session.returnTo = req.query.redirect;
  }
  res.render('auth/login', { title: 'Sign In' });
};

/* ─── POST /login ─────────────────────────────────────────────── */
const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Email and password are required.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.userId = user._id.toString();
    req.session.user   = { _id: user._id, name: user.name, email: user.email, role: user.role };

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    /* Honour the returnTo path set by isAuth middleware */
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;

    return res.redirect(returnTo || (user.role === 'Admin' ? '/admin' : '/dashboard'));
  } catch (err) {
    next(err);
  }
};

/* ─── GET /logout ─────────────────────────────────────────────── */
const logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout };
