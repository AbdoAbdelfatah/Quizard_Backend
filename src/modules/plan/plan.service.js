import Plan from "../../models/plan.model.js";

export class PlanService {
  async createPlan(planData) {
    const plan = new Plan(planData);
    return await plan.save();
  }
  async getPlanById(planId) {
    return await Plan.findById(planId);
  }
  async deletePlan(planId) {
    return await Plan.findByIdAndDelete(planId);
  }
  async updatePlan(planId, updateData) {
    return await Plan.findByIdAndUpdate(planId, updateData, { new: true });
  }
  async getAllPlans() {
    return await Plan.find({});
  }
}
