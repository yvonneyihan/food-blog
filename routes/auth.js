// routes/auth.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Start Google OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/users/login'
  }),
  (req, res) => {
    req.session.userId = req.user.id;
    req.session.username = req.user.username;
    // Successful login, redirect to home
    res.redirect('/users/home');
  }
);

// Log out route
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
