import { PlanController } from "./plan.controller.js";
import { Router } from "express";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";

const router = Router();
const planController = new PlanController();
router.post("/", errorHandler(planController.createPlan));
router.get("/:id", errorHandler(planController.getPlanById));
router.delete("/:id", errorHandler(planController.deletePlan));
router.patch("/:id", errorHandler(planController.updatePlan));
router.get("/", errorHandler(planController.getAllPlans));
export default router;
