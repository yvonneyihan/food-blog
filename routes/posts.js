import express from "express";
import pool from '../db.js';
import multer from "multer";
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Route to get all posts
router.get('/', async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM Posts ORDER BY created_at DESC');
        res.render('home', { posts, currentRoute:'home' });
    } catch (err) {
        res.status(500).send('Error loading posts');
    }
});

// Show compose form
router.get('/compose', (req, res) => {
  res.render('compose', { currentRoute: 'compose' });
});

// Handle new post submission
router.post("/compose", upload.single('image'), async (req, res) => {
  const { title, content, category } = req.body;
  let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.session.userId
  console.log(userId)

  try {
    await pool.query(
    'INSERT INTO Posts (user_Id, title, content, category, image_url) VALUES (?, ?, ?, ?, ?)',
    [userId, title, content, category, imageUrl]
    );
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create post");
  }
});

// Read a post
router.get("/read/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE Posts SET click_count = click_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT * FROM Posts WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Post not found');
    }

    res.render('read-post', { post: rows[0] });
  } catch (err) {
    console.error('Error reading post:', err.message);
    res.status(500).send('Error loading post');
  }
});

// Edit form
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [[post]] = await pool.query('SELECT * FROM Posts WHERE id = ?', [id]);
    if (!post) return res.status(404).send("Post not found");
    res.render("edit-post", { post, currentRoute: 'edit' });
  } catch (err) {
    res.status(500).send("Error fetching post");
  }
});

// Handle post update
router.post("/edit/:id", upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
        let query = 'UPDATE Posts SET title = ?, content = ?, category = ?';
        let params = [title, content, category];
        if (imageUrl) {
            query += ', image_url = ?';
            params.push(imageUrl);
        }
        query += ' WHERE id = ?';
        params.push(id);
        await pool.query(query, params);
        res.redirect("/posts");
  } catch (err) {
    res.status(500).send("Error updating post");
  }
});

// Delete post
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Posts WHERE id = ?', [id]);
    res.redirect("/users/dashboard");
  } catch (err) {
    res.status(500).send("Error deleting post");
  }
});

// View posts by category
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const [posts] = await pool.query(
      'SELECT * FROM Posts WHERE category = ? ORDER BY created_at DESC',
      [category]
    );
    res.render("category", {
      category,
      posts,
      currentRoute: category,
      isCategory: true
    });
  } catch (err) {
    res.status(500).send("Error filtering posts");
  }
});

export default router;