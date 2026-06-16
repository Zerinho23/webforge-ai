import { Router } from "express";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { projectsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();
router.use(requireAuth);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function planLimit(plan: string): number | null {
  if (plan === "free") return 3;
  return null;
}

function detectProjectType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("tienda") || lower.includes("shop") || lower.includes("ecommerce") || lower.includes("store") || lower.includes("vender") || lower.includes("producto") || lower.includes("product") || lower.includes("cart") || lower.includes("carrito")) return "ecommerce";
  if (lower.includes("blog") || lower.includes("artículo") || lower.includes("article") || lower.includes("post") || lower.includes("magazine")) return "blog";
  if (lower.includes("portafolio") || lower.includes("portfolio") || lower.includes("personal") || lower.includes("cv") || lower.includes("resume")) return "portfolio";
  if (lower.includes("dashboard") || lower.includes("panel") || lower.includes("analytics") || lower.includes("analítica") || lower.includes("admin") || lower.includes("metrics")) return "dashboard";
  if (lower.includes("saas") || lower.includes("suscripción") || lower.includes("subscription") || lower.includes("platform") || lower.includes("plataforma")) return "saas";
  if (lower.includes("landing") || lower.includes("agencia") || lower.includes("agency") || lower.includes("empresa") || lower.includes("company") || lower.includes("startup")) return "landing_page";
  if (lower.includes("restaurant") || lower.includes("restaurante") || lower.includes("booking") || lower.includes("reserva") || lower.includes("hotel")) return "web_app";
  return "web_app";
}

const TYPE_SYSTEM_PROMPTS: Record<string, string> = {
  landing_page: `You are an elite frontend engineer and designer at a top-tier agency. Generate a COMPLETE, STUNNING single-page landing website with:
- A bold hero section with a large headline, subheadline, CTA buttons, and a visual element (CSS-drawn illustration or animated gradient)
- A "How it works" / features section with 3–6 cards, each with an icon (use Unicode symbols or SVG), title, and description
- A social proof / stats section (big numbers like "10,000+ customers", "99.9% uptime")
- A pricing section with 3 tiers (Free, Pro, Business) in clean cards
- A testimonials section with 3 quote cards (avatar initial, name, role, company)
- A FAQ section (5 questions, accordion-style with JS toggle)
- A footer with links, copyright, logo
- Use a sophisticated dark color scheme with the brand's primary color as accent
- Every section has generous padding, proper spacing, and smooth CSS transitions
- Mobile responsive with media queries`,

  ecommerce: `You are an elite e-commerce UI engineer. Generate a COMPLETE, PROFESSIONAL online store with:
- A navigation bar with logo, category links, search bar, cart icon with badge counter
- A hero banner with discount badge and CTA
- A featured products grid (6–8 product cards) each with: product image (CSS placeholder with gradient), name, price, rating stars (⭐), "Add to Cart" button with hover effect
- A categories section with clickable tiles
- A promotional banner / newsletter signup section
- A features strip (Free shipping, Secure payment, Easy returns, 24/7 support)
- A footer with links and payment method icons
- JavaScript: cart functionality (add/remove items, update badge counter), hover effects, quick-view modal
- Modern design: clean white cards with subtle shadows, accent color for CTAs`,

  blog: `You are an elite content platform engineer. Generate a COMPLETE, POLISHED blog/magazine site with:
- A header with logo, navigation (Home, Categories, About, Newsletter), search, dark mode toggle
- A hero article card (large featured post with image placeholder, category tag, title, excerpt, author, date)
- A main content grid: 2 columns — main feed (4 article cards) + sidebar
- Sidebar: Popular posts, Categories list with counts, Newsletter subscribe form, Tags cloud
- Article cards: category badge, title, excerpt, author avatar (CSS circle with initials), date, read time, "Read More" link
- Footer with about snippet, social links, recent posts
- Dark mode: full implementation with CSS variables toggle via JS
- Typography: serif font for headings (use Google Fonts link), clean reading layout`,

  portfolio: `You are an award-winning creative developer. Generate a STUNNING developer/designer portfolio with:
- A full-screen hero with animated typing effect (JS), name, title, and scroll indicator
- An "About" section with a two-column layout: text (bio, skills) + visual element
- A skills section with animated progress bars (JS intersection observer triggers animation)
- A projects grid (6 projects) each with: overlay on hover showing title + tech stack + "View" button, colorful gradient background
- A work experience timeline with company, role, dates, description
- A contact section with a styled form (name, email, message) and social links
- Smooth scroll behavior, scroll-triggered animations using CSS @keyframes + JS IntersectionObserver
- Monospace font for code elements, elegant typography overall`,

  dashboard: `You are a senior product engineer specializing in data dashboards. Generate a COMPLETE analytics dashboard with:
- A fixed sidebar with logo, navigation items (with icons using Unicode), user avatar section at bottom
- A top header bar with page title, search, notification bell, user menu
- KPI cards row: 4 cards each with metric name, large number, trend indicator (↑↓ with %, colored green/red), sparkline (CSS mini chart)
- A large chart area: bar chart + line chart drawn with SVG (no libraries, pure SVG paths for data visualization)
- A data table with: sortable columns, status badges, action buttons, pagination
- A recent activity feed in a card
- All built in the sidebar: 4 navigation items that switch content panels via JS
- Dark sidebar, light content area — professional enterprise aesthetic`,

  saas: `You are a senior SaaS product engineer. Generate a COMPLETE SaaS platform marketing + app landing with:
- Navigation: logo, features/pricing/docs links, login + "Start free trial" CTA buttons
- Hero: bold headline, subheadline, email input + CTA, hero illustration (CSS/SVG diagram of the product)
- Integration logos section (show logos of popular tools: Slack, GitHub, Stripe, etc as styled text badges)
- Feature showcase: alternating sections (text left + visual right) for 3 key features
- Customer logos strip (well-known company names in muted text)
- Pricing table: 3 plans with feature checklist, monthly/annual toggle (JS)
- Testimonials: 2x2 grid of quote cards
- CTA banner: "Start your 14-day free trial" with form
- Footer: multi-column with links, social, legal`,

  web_app: `You are a senior full-stack engineer. Generate a COMPLETE, FUNCTIONAL web application UI with:
- A full application shell with sidebar navigation, top bar, and main content area
- Multiple "pages" that show/hide via JavaScript tab system
- Rich, interactive UI components: forms, modals, notifications, data tables, cards
- Realistic data populated throughout (names, dates, statuses, etc)
- Sophisticated state management via vanilla JS (no frameworks)
- Loading states, empty states, error states all handled visually
- Professional design: clean, organized, enterprise-grade
- Keyboard shortcuts hint in the footer
- Context-appropriate features based on the user's description`,
};

const SHARED_STYLE_RULES = `
CRITICAL DESIGN RULES — follow all of these:
1. Use CSS custom properties for the design system: --bg, --surface, --border, --text, --text-muted, --primary, --primary-hover, --success, --danger, --warning
2. Use Inter or another Google Font (include the <link> tag)
3. Box shadows: use layered shadows for depth (e.g. 0 1px 3px rgba(0,0,0,.12), 0 4px 16px rgba(0,0,0,.08))
4. Rounded corners: 8px for cards, 6px for buttons, 4px for inputs, 24px for badges
5. Micro-interactions: button hover scale(1.02), card hover translateY(-2px), transition all 0.2s ease
6. Color palette for dark mode: background #0a0a0f, surface #111118, border #1e1e2e, text #e2e2e8, primary #7c3aed
7. Smooth scrollbar styling (webkit), selection color matches primary
8. Use fluid typography with clamp() for headings
9. All images: use beautiful CSS gradient placeholders (linear-gradient with relevant colors) with aspect-ratio
10. Include at least 200 lines of CSS — no bare unstyled HTML
11. The final output must look like a real, polished, professional product
12. Add subtle background patterns or gradients to sections for visual richness
13. Icons: use inline SVG icons (heroicons style) — provide actual <svg> code, not just text
`;

async function generateWithAI(prompt: string, projectType: string): Promise<{
  code: string;
  structure: {
    pages: string[];
    features: string[];
    techStack: string[];
    dbSchema: string | null;
    apiEndpoints: string[];
  };
}> {
  const typePrompt = TYPE_SYSTEM_PROMPTS[projectType] || TYPE_SYSTEM_PROMPTS.web_app;

  const systemPrompt = `${typePrompt}

${SHARED_STYLE_RULES}

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no explanation:
{
  "html": "<complete standalone HTML document — everything in one file: <head> with styles, <body> with content, <script> at bottom>",
  "pages": ["array of page/section names in this project"],
  "features": ["array of implemented features, be specific"],
  "techStack": ["HTML5", "CSS3 Custom Properties", "Vanilla JavaScript", "SVG", "Google Fonts"],
  "dbSchema": "SQL-style schema string if the project needs a database, else null",
  "apiEndpoints": ["REST endpoints if backend is needed, e.g. GET /api/products"]
}

IMPORTANT: The "html" field must contain a COMPLETE, SELF-CONTAINED HTML document with ALL CSS in a <style> tag and ALL JavaScript in a <script> tag. No external dependencies except Google Fonts. The page must look visually impressive when rendered in a browser.`;

  const userPrompt = `Build this: ${prompt}

Make it look like a real, production-quality website that a professional agency would be proud of. Pay attention to every detail: spacing, typography, color, interactions, and content. Populate it with realistic placeholder content relevant to the project.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 8000,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content from AI");

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON from AI");
  }

  const code = parsed.html || parsed.code || "<html><body><h1>Generation error</h1></body></html>";

  return {
    code,
    structure: {
      pages: parsed.pages || ["Home"],
      features: parsed.features || ["Responsive Design"],
      techStack: parsed.techStack || ["HTML5", "CSS3", "JavaScript"],
      dbSchema: parsed.dbSchema || null,
      apiEndpoints: parsed.apiEndpoints || [],
    },
  };
}

// SSE streaming generation endpoint
router.get("/:id/stream", async (req, res) => {
  const userId = (req as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
    .limit(1);

  if (!projects.length) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent("progress", { step: 0, label: "Reading your description..." });
    await new Promise(r => setTimeout(r, 500));
    sendEvent("progress", { step: 1, label: "Planning architecture..." });

    const project = projects[0];
    const result = await generateWithAI(project.prompt, project.type);

    sendEvent("progress", { step: 2, label: "Generating components..." });
    await new Promise(r => setTimeout(r, 300));
    sendEvent("progress", { step: 3, label: "Applying design system..." });
    await new Promise(r => setTimeout(r, 300));
    sendEvent("progress", { step: 4, label: "Finalizing..." });

    await db.update(projectsTable).set({
      status: "ready",
      generatedCode: result.code,
      updatedAt: new Date(),
    }).where(eq(projectsTable.id, id));

    sendEvent("done", {
      projectId: id,
      status: "ready",
      generatedCode: result.code,
      structure: result.structure,
      message: "Generated successfully",
    });

    res.end();
  } catch (err) {
    logger.error({ err }, "Stream generation error");
    await db.update(projectsTable).set({ status: "error", updatedAt: new Date() }).where(eq(projectsTable.id, id));
    sendEvent("error", { message: "Generation failed. Please try again." });
    res.end();
  }
});

router.post("/:id/generate", async (req, res) => {
  const userId = (req as any).userId as number;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { prompt, regenerate } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
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

    const project = projects[0];
    if (project.status === "generating") {
      res.status(409).json({ error: "Already generating" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const user = users[0];
    const limit = planLimit(user.plan);
    if (limit !== null && user.projectsThisMonth >= limit && !regenerate) {
      res.status(429).json({ error: `You've reached your ${limit} project limit this month. Upgrade to Pro.` });
      return;
    }

    await db.update(projectsTable).set({ status: "generating", updatedAt: new Date() }).where(eq(projectsTable.id, id));

    let result;
    try {
      result = await generateWithAI(prompt, project.type);
    } catch (aiErr) {
      logger.error({ aiErr }, "AI generation failed");
      await db.update(projectsTable).set({ status: "error", updatedAt: new Date() }).where(eq(projectsTable.id, id));
      res.status(500).json({ error: "AI generation failed. Please try again." });
      return;
    }

    await db.update(projectsTable).set({
      status: "ready",
      generatedCode: result.code,
      prompt,
      updatedAt: new Date(),
    }).where(eq(projectsTable.id, id));

    if (!regenerate) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const resetMonth = user.resetMonth;
      const newCount = resetMonth === currentMonth ? user.projectsThisMonth + 1 : 1;
      await db.update(usersTable).set({ projectsThisMonth: newCount, resetMonth: currentMonth }).where(eq(usersTable.id, userId));
    }

    res.json({
      projectId: id,
      status: "ready",
      generatedCode: result.code,
      previewUrl: null,
      structure: result.structure,
      message: "Project generated successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Error generating project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quick", async (req, res) => {
  const userId = (req as any).userId as number;
  const { prompt, type } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  const projectType = type || detectProjectType(prompt);

  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const user = users[0];
    const limit = planLimit(user.plan);
    if (limit !== null && user.projectsThisMonth >= limit) {
      res.status(429).json({ error: `You've reached your ${limit} project limit this month. Upgrade to Pro for unlimited generation.` });
      return;
    }

    const typeLabels: Record<string, string> = {
      landing_page: "Landing Page",
      ecommerce: "E-commerce Store",
      blog: "Blog",
      portfolio: "Portfolio",
      dashboard: "Dashboard",
      saas: "SaaS App",
      web_app: "Web App",
    };

    const name = `${typeLabels[projectType] || "Web App"} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const [project] = await db
      .insert(projectsTable)
      .values({ userId, name, type: projectType as any, prompt, status: "generating" })
      .returning();

    let result;
    try {
      result = await generateWithAI(prompt, projectType);
    } catch (aiErr) {
      logger.error({ aiErr }, "Quick AI generation failed");
      await db.update(projectsTable).set({ status: "error", updatedAt: new Date() }).where(eq(projectsTable.id, project.id));
      res.status(500).json({ error: "AI generation failed. Please try again." });
      return;
    }

    await db.update(projectsTable).set({
      status: "ready",
      generatedCode: result.code,
      updatedAt: new Date(),
    }).where(eq(projectsTable.id, project.id));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const resetMonth = user.resetMonth;
    const newCount = resetMonth === currentMonth ? user.projectsThisMonth + 1 : 1;
    await db.update(usersTable).set({ projectsThisMonth: newCount, resetMonth: currentMonth }).where(eq(usersTable.id, userId));

    res.json({
      projectId: project.id,
      status: "ready",
      generatedCode: result.code,
      previewUrl: null,
      structure: result.structure,
      message: "Project generated successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Error in quick generate");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
