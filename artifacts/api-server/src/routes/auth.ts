import { Router } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + process.env.SESSION_SECRET).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function planLimit(plan: string): number | null {
  if (plan === "free") return 3;
  if (plan === "pro") return null;
  if (plan === "business") return null;
  return 3;
}

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.token, token))
      .limit(1);
    if (!sessions.length || sessions[0].expiresAt < new Date()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, sessions[0].userId))
      .limit(1);
    if (!users.length) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      projectsThisMonth: user.projectsThisMonth,
      projectLimit: planLimit(user.plan),
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
    const [user] = await db
      .insert(usersTable)
      .values({ email, passwordHash, name })
      .returning();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });
    logger.info({ userId: user.id }, "User registered");
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        projectsThisMonth: user.projectsThisMonth,
        projectLimit: planLimit(user.plan),
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Error registering user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!users.length) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const user = users[0];
    if (user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });
    logger.info({ userId: user.id }, "User logged in");
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        projectsThisMonth: user.projectsThisMonth,
        projectLimit: planLimit(user.plan),
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    } catch (err) {
      req.log.error({ err }, "Error logging out");
    }
  }
  res.json({ success: true, message: "Logged out" });
});

export default router;
