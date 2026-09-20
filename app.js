const express        = require('express');
const session        = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const path           = require('path');

const app = express();

/* ─── Trust Render/Heroku proxy (required for secure session cookies) ── */
app.set('trust proxy', 1);

/* ─── View Engine ─────────────────────────────────────────────── */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ─── Static Files ────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Body Parsing ────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Method Override (HTML form PUT / DELETE) ────────────────── */
app.use(methodOverride('_method'));

/* ─── Sessions ────────────────────────────────────────────────── */
app.use(session({
  secret          : process.env.SESSION_SECRET || 'changeme_in_production',
  resave          : false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl   : (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>'))
      ? 'mongodb://127.0.0.1:27017/venuevault'
      : process.env.MONGODB_URI,
    touchAfter : 24 * 3600          // lazy update – only every 24 h
  }),
  cookie: {
    maxAge  : 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure  : process.env.NODE_ENV === 'production'
  }
}));

/* ─── Flash Messages ──────────────────────────────────────────── */
app.use(flash());

/* ─── Global Template Locals ──────────────────────────────────── */
app.use((req, res, next) => {
  res.locals.success_msg  = req.flash('success_msg');
  res.locals.error_msg    = req.flash('error_msg');
  res.locals.currentUser  = req.session.user || null;
  next();
});

/* ─── Routes ──────────────────────────────────────────────────── */
app.use('/',        require('./routes/authRoutes'));
app.use('/venues',  require('./routes/venueRoutes'));
app.use('/bookings',require('./routes/bookingRoutes'));
app.use('/admin',   require('./routes/adminRoutes'));
app.use('/api',     require('./routes/apiRoutes'));

/* ─── 404 ─────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).render('error', { statusCode: 404, message: 'Page not found.' });
});

/* ─── Global Error Handler ────────────────────────────────────── */
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

module.exports = app;
