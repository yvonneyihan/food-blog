import express, { Request, Response} from "express";
import pool from '../db.js';
import multer from "multer";
import path from 'path';
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = express.Router();

interface Post extends RowDataPacket {
  id: number;
  user_Id: number;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: Date;
  click_count: number;
}

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => cb(null, 'public/uploads/'),
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Route to get all posts
router.get('/', async (req: Request, res: Response) => {
    try {
      const [posts] = await pool.query<Post[]>('SELECT * FROM Posts ORDER BY created_at DESC');
      res.render('home', { posts, currentRoute:'home' });
    } catch (err) {
      console.error("Error loading posts:", err);
      res.status(500).send('Error loading posts');
    }
});

// Show compose form
router.get('/compose', (req: Request, res: Response) => {
  res.render('compose', { currentRoute: 'compose' });
});

// Handle new post submission
router.post("/compose", upload.single('image'), async (req: Request, res: Response) => {
  const { title, content, category } = req.body;
  let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.session.userId
  // console.log(userId)

  try {
    await pool.query<ResultSetHeader>(
    'INSERT INTO Posts (user_Id, title, content, category, image_url) VALUES (?, ?, ?, ?, ?)',
    [userId, title, content, category, imageUrl]
    );
    res.redirect("/posts");
  } catch (err) {
    console.error("Failed to create post:", err);
    res.status(500).send("Failed to create post");
  }
});

// Read a post
router.get("/read/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query<ResultSetHeader>('UPDATE Posts SET click_count = click_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query<Post[]>('SELECT * FROM Posts WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Post not found');
    }

    res.render('read-post', { post: rows[0] });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error reading post:", err.message);
    } else {
      console.error("Error reading post:", err);
    }
    res.status(500).send("Error loading post");
  }
});

// Edit form
router.get("/edit/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<Post[]>('SELECT * FROM Posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) return res.status(404).send("Post not found");
    res.render("edit-post", { post, currentRoute: 'edit' });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error fetching post");
  }
});

// Handle post update
router.post("/edit/:id", upload.single('image'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, content, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
        let query = 'UPDATE Posts SET title = ?, content = ?, category = ?';
        const params: (string | number | null)[] = [title, content, category];
        if (imageUrl) {
            query += ', image_url = ?';
            params.push(imageUrl);
        }
        query += ' WHERE id = ?';
        params.push(id);
        await pool.query<ResultSetHeader>(query, params);
        res.redirect("/posts");
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Error updating post");
  }
});

// Delete post
router.post("/delete/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query<ResultSetHeader>('DELETE FROM Posts WHERE id = ?', [id]);
    res.redirect("/users/dashboard");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting post");
  }
});

// View posts by category
router.get("/category/:category", async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const [posts] = await pool.query<Post[]>(
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
    console.error("Error filtering posts:", err);
    res.status(500).send("Error filtering posts");
  }
});

export default router;