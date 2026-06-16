import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
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
      res.status(401).json({ error: "Session expired" });
      return;
    }
    (req as any).userId = sessions[0].userId;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
