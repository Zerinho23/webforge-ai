import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import generateRouter from "./generate";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/projects", projectsRouter);
router.use("/projects", generateRouter);
router.use("/generate", generateRouter);
router.use("/stats", statsRouter);
router.use("/plans", statsRouter);

export default router;
