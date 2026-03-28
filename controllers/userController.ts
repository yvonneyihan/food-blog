import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import pool from '../db.js';

// Define TypeScript interfaces for database rows
interface ExistingUserRow extends RowDataPacket {
  id: number;
}

export async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body;

  try {
    // Check if email is already in use
    const [existing] = await pool.query<ExistingUserRow[]>('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      res
        .status(400)
        .send('Email already registered. Please log in or use a different email.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Set session (auto-login after registration)
    req.session.userId = result.insertId;
    req.session.username = username;

    res.redirect('/users/home');
  } catch (err) {
    if (err instanceof Error) {
      console.error("Registration error:", err.message);
    } else {
      console.error("Registration error:", err);
    }
    res.status(500).send("Something went wrong during registration.");
  }
}