import { Router } from "express";
import { ModuleController } from "./module.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createModuleSchema, updateModuleSchema } from "./module.validation.js";

const router = Router();
const moduleController = new ModuleController();

router.get("/", errorHandler(moduleController.getModule));
router.get("/me", errorHandler(moduleController.getMyGroups));

router.post("/",validate(createModuleSchema) ,  errorHandler(moduleController.createModule));
router.patch("/:id",validate(updateModuleSchema), errorHandler(moduleController.updateModule));

router.delete("/:id/hard", errorHandler(moduleController.deleteModule));
router.delete("/:id", errorHandler(moduleController.deleteModule));

router.patch("/:id/restore", errorHandler(moduleController.restoreModule));

export default router;
