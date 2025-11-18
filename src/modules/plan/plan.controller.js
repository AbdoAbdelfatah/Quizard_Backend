import { PlanService } from "./plan.service.js";
const planService = new PlanService();
export class PlanController {
  async createPlan(req, res, next) {
    const planData = req.body;
    const createdPlan = await planService.createPlan(planData);
    res.status(201).json({ success: true, data: createdPlan });
  }
  async getPlanById(req, res, next) {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    res.status(200).json({ success: true, data: plan });
  }
  async deletePlan(req, res, next) {
    const { id } = req.params;
    const deletedPlan = await planService.deletePlan(id);
    res.status(200).json({ success: true, data: deletedPlan });
  }
  async updatePlan(req, res, next) {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPlan = await planService.updatePlan(id, updateData);
    res.status(200).json({ success: true, data: updatedPlan });
  }
  async getAllPlans(req, res, next) {
    const plans = await planService.getAllPlans();
    res.status(200).json({ success: true, data: plans });
  }
}
