import bcrypt from 'bcrypt';
import pool from '../db.js';

export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    // Check if email is already in use
    const [existing] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).send('Email already registered. Please log in or use a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Set session (auto-login after registration)
    req.session.userId = result.insertId;
    req.session.username = username;

    res.redirect('/users/home');
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Something went wrong during registration.');
  }
}