import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { RowDataPacket } from "mysql2";
import { registerUser } from '../controllers/userController.js';
import pool from '../db.js';

const router = express.Router();

// Define TypeScript interfaces for database rows
interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
}

interface PostRow extends RowDataPacket {
  id: number;
  user_Id: number;
  category: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: Date;
}

interface CategoryRow extends RowDataPacket {
  category: string;
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/users/login'); 
}};

// Show login page
router.get('/login', (req: Request, res: Response) => {
  res.render('login'); 
});

// Render register page
router.get('/register', (req: Request, res: Response) => {
  res.render('register'); 
});

// Logout
router.get('/logout', (req: Request, res: Response) => {
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
    const [rows] = await pool.query<UserRow[]>('SELECT * FROM Users WHERE email = ?', [email]);

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
    if (err instanceof Error) {
      console.error("Login error:", err.message);
    } else {
      console.error("Login error:", err);
    }
    res.status(500).send("Something went wrong during login.");
  }
});

// Show home page
router.get('/home', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const [posts] = await pool.query<PostRow[]>('SELECT * FROM Posts ORDER BY created_at DESC');
    res.render('home', { posts });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error loading posts for /users/home:", err.message);
    } else {
      console.error("Error loading posts for /users/home:", err);
    }
    res.status(500).send("Error loading home page");
  }
});

// Show dashboard
router.get('/dashboard', isAuthenticated, async (req: Request, res: Response) => {
  const userId  = req.session.userId

  if (!userId) {
    res.redirect("/users/login");
    return;
  }

  try {
    const [categories] = await pool.query<CategoryRow[]>('SELECT DISTINCT category FROM Posts WHERE user_Id = ?',
      [ userId ]
    );
    const categoryPosts: { [key: string]: PostRow[] } = {};

    // For each category, get the 3 latest posts
    for (const row of categories) {
      const category = row.category;
      const [posts] = await pool.query<PostRow[]>(
        'SELECT * FROM Posts WHERE user_id = ? AND category = ? ORDER BY created_at DESC LIMIT 3',
        [userId, category]
      );
      categoryPosts[category] = posts;
    }
    res.render('dashboard', { categoryPosts });
    } catch (err) {
    if (err instanceof Error) {
      console.error("Error loading dashboard:", err.message);
    } else {
      console.error("Error loading dashboard:", err);
    }
    res.status(500).send("Error loading dashboard");
  }
});

export default router;
