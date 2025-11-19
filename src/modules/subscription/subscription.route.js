// routes/subscription.routes.js
import express from "express";
import { SubscriptionController } from "./subscription.controller.js";

const router = express.Router();
const subscriptionController = new SubscriptionController();

// Other routes with JSON parsing
router.post("/checkout", subscriptionController.createCheckoutSession);

router.get("/my-subscription", subscriptionController.getMySubscription);

export default router;
