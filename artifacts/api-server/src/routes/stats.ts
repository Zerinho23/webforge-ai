import { Router } from "express";
import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

function planLimit(plan: string): number | null {
  if (plan === "free") return 3;
  return null;
}

router.get("/dashboard", async (req, res) => {
  const userId = (req as any).userId as number;
  try {
    const [allProjects, users] = await Promise.all([
      db.select().from(projectsTable).where(eq(projectsTable.userId, userId)),
      db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1),
    ]);

    const user = users[0];
    const totalProjects = allProjects.length;
    const publishedProjects = allProjects.filter((p) => p.status === "published").length;
    const readyProjects = allProjects.filter((p) => p.status === "ready").length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const generationsThisMonth = allProjects.filter(
      (p) => p.createdAt.toISOString().slice(0, 7) === currentMonth
    ).length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentGenerations = allProjects.filter(
      (p) => p.updatedAt > sevenDaysAgo && (p.status === "ready" || p.status === "published")
    ).length;

    const typeMap: Record<string, number> = {};
    for (const p of allProjects) {
      typeMap[p.type] = (typeMap[p.type] || 0) + 1;
    }
    const projectsByType = Object.entries(typeMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const limit = planLimit(user?.plan || "free");

    res.json({
      totalProjects,
      publishedProjects,
      readyProjects,
      generationsThisMonth,
      planLimit: limit,
      planName: user?.plan ? (user.plan.charAt(0).toUpperCase() + user.plan.slice(1)) : "Free",
      projectsByType,
      recentGenerations,
      projectsRemaining: limit !== null ? Math.max(0, limit - (user?.projectsThisMonth || 0)) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent-activity", async (req, res) => {
  const userId = (req as any).userId as number;
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(projectsTable.updatedAt))
      .limit(15);

    const actionMap: Record<string, string> = {
      ready: "Generated successfully",
      published: "Published live",
      error: "Generation failed",
      generating: "Generation in progress",
      draft: "Project created",
    };

    const activity = projects.map((p, i) => ({
      id: i + 1,
      projectId: p.id,
      projectName: p.name,
      action: actionMap[p.status] || "Updated",
      timestamp: p.updatedAt.toISOString(),
      type: p.type,
      status: p.status,
    }));

    res.json(activity);
  } catch (err) {
    req.log.error({ err }, "Error getting recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/plans", async (_req, res) => {
  res.json([
    {
      id: "free",
      name: "Free",
      price: 0,
      currency: "USD",
      interval: "month",
      projectLimit: 3,
      features: [
        "3 projects per month",
        "GPT-4o powered generation",
        "HTML/CSS/JS export",
        "Live in-browser preview",
        "All 7 project types",
        "Community support",
      ],
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 19,
      currency: "USD",
      interval: "month",
      projectLimit: null,
      features: [
        "Unlimited projects",
        "Priority AI generation",
        "Full code export (ZIP)",
        "One-click publishing",
        "Custom domains",
        "Remove WebForge branding",
        "Priority support",
        "Early access to new features",
      ],
      highlighted: true,
    },
    {
      id: "business",
      name: "Business",
      price: 49,
      currency: "USD",
      interval: "month",
      projectLimit: null,
      features: [
        "Everything in Pro",
        "Team collaboration (up to 10)",
        "Private projects",
        "Priority processing queue",
        "Advanced analytics",
        "API access",
        "Dedicated Slack support",
        "SLA guarantee (99.9%)",
        "Custom AI model fine-tuning",
      ],
      highlighted: false,
    },
  ]);
});

export default router;
