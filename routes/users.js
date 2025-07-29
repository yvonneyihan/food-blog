import express from 'express';
import bcrypt from 'bcrypt';
import { registerUser } from '../controllers/userController.js';
import pool from '../db.js';
const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/users/login'); 
}};

// Show login page
router.get('/login', (req, res) => {
  res.render('login'); 
});

// Render register page
router.get('/register', (req, res) => {
  res.render('register'); 
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('❌ Logout error:', err);
        return res.send('Logout failed.');
      }
      res.redirect('/');
    });
  });

// Handle registration logic
router.post('/register', registerUser);

// Handle login logic
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).send('Invalid email or password.');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid email or password.');
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    // Redirect to home
    res.redirect('/posts');
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Something went wrong during login.');
  }
});

// Show home page
router.get('/home', isAuthenticated, async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM Posts ORDER BY created_at DESC');
    res.render('home', { posts });
  } catch (err) {
    console.error('Error loading posts for /users/home:', err.message);
    res.status(500).send('Error loading home page');
  }
});

// Show dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  const userId  = req.session.userId
  try {
    const [categories] = await pool.query('SELECT DISTINCT category FROM Posts WHERE user_Id = ?',
      [ userId ]
    );
    const categoryPosts = {};
    // For each category, get the 3 latest posts
    for (const row of categories) {
      const category = row.category;
      const [posts] = await pool.query(
        'SELECT * FROM Posts WHERE user_id = ? AND category = ? ORDER BY created_at DESC LIMIT 3',
        [userId, category]
      );
      categoryPosts[category] = posts;
    }
    res.render('dashboard', { categoryPosts });
    } catch (err) {
    console.error('Error loading dashboard:', err.message);
    res.status(500).send('Error loading dashboard');
  }
});

export default router;
