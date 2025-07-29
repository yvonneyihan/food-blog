// config/auth.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const [rows] = await pool.query('SELECT * FROM Users WHERE google_id = ?', [profile.id]);
      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        const [result] = await pool.query(
          'INSERT INTO Users (google_id, username, email) VALUES (?, ?, ?)',
          [profile.id, profile.displayName, profile.emails[0].value]
        );
        const [newUser] = await pool.query('SELECT * FROM Users WHERE id = ?', [result.insertId]);
        return done(null, newUser[0]);
      }
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize
passport.serializeUser((user, done) => {
  done(null, user.id); // Only store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});
