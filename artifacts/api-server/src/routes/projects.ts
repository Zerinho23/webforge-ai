import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, sessionsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = (req as any).userId as number;
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(projectsTable.updatedAt));
    res.json(
      projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const userId = (req as any).userId as number;
  const { name, description, type, prompt } = req.body;
  if (!name || !type || !prompt) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const [project] = await db
      .insert(projectsTable)
      .values({ userId, name, description, type, prompt, status: "draft" })
      .returning();
    res.status(201).json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const userId = (req as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .limit(1);
    if (!projects.length) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const p = projects[0];
    res.json({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const userId = (req as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { name, description, prompt, status } = req.body;
  try {
    const existing = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .limit(1);
    if (!existing.length) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (prompt !== undefined) updates.prompt = prompt;
    if (status !== undefined) updates.status = status;
    const [updated] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, id))
      .returning();
    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const existing = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .limit(1);
    if (!existing.length) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting project");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { sessionsTable, usersTable };
export default router;
