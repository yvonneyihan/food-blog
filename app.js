import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import postsRouter from './routes/posts.js';
import passport from 'passport';
import './config/auth.js'; 
import authRoutes from './routes/auth.js';
import usersRouter from './routes/users.js';
import pool from './db.js';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.currentRoute = '';
  res.locals.isCategory = false;
  next();
});
app.use('/auth', authRoutes);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

// Home route
app.get("/", async(req, res) => {
    try {
        const [posts] = await pool.query('SELECT * FROM Posts ORDER BY created_at DESC');
        res.render('home', { posts, currentRoute: 'home' });
    } catch (err) {
        res.status(500).send('Error loading posts');
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});