import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "@db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { pool } from "@db";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string;
      role: string;
      phoneNumber?: string;
      address?: string;
      profilePicture?: string;
      isActive: boolean;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new PostgresStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.username, username)
        });

        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }

        if (!user.isActive) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id)
      });
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName, role = "student" } = req.body;

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      
      const [newUser] = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        fullName,
        role,
      }).returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          isActive: newUser.isActive,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      res.status(200).json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        isActive: req.user.isActive,
        emailVerified: req.user.emailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      isActive: req.user.isActive,
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    });
  });
}

export { hashPassword, comparePasswords };
