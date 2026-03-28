import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email?: string | null;
      username?: string;
    }
  }
}