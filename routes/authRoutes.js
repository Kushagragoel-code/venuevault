const express = require('express');
const router  = express.Router();
const { getRegister, postRegister, getLogin, postLogin, logout } = require('../controllers/authController');
const { isAuth } = require('../middleware/authMiddleware');
const { getOrgDashboard } = require('../controllers/bookingController');

/* Landing page */
router.get('/', (req, res) => {
  res.render('index', { title: 'VenueVault – Find & Book Premium Event Venues' });
});

router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/login',    getLogin);
router.post('/login',   postLogin);
router.get('/logout',   logout);

/* Organiser dashboard – lives at /dashboard so all nav links and redirects work */
router.get('/dashboard', isAuth, getOrgDashboard);

module.exports = router;
