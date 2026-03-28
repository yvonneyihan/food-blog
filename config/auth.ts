// config/auth.js
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string | null;
  google_id: string | null;
  password: string | null;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("Google OAuth environment variables are missing");
}


passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: '/auth/google/callback'
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: Express.User | false) => void
  ) => {
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT * FROM Users WHERE google_id = ?', [profile.id]);
      if (rows.length > 0) {
        return done(null, rows[0]);
      }

      const email = profile.emails?.[0]?.value ?? null;
      const username = profile.displayName;

      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO Users (google_id, username, email) VALUES (?, ?, ?)",
        [profile.id, username, email]
      );

      const [newUserRows] = await pool.query<UserRow[]>(
        "SELECT * FROM Users WHERE id = ?",
        [result.insertId]
      );

      done(null, newUserRows[0]);
      } catch (err) {
        if (err instanceof Error) {
          done(err);
        } else {
          done(new Error("Unknown authentication error"));
        }
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id: number, done: (error: Error | null, user?: Express.User | false) => void) => {
    try {
      const [rows] = await pool.query<UserRow[]>(
        "SELECT * FROM Users WHERE id = ?",
        [id]
      );
      done(null, rows[0] || false);
    } catch (err) {
      if (err instanceof Error) {
        done(err);
      } else {
        done(new Error("Unknown deserialization error"));
      }
    }
  }
);