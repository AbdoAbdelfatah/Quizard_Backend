import Subscription from "../../models/subscription.model.js";

export class SubscriptionService {
  async createSubscription(subscriptionData) {
    try {
      const subscription = new Subscription(subscriptionData);
      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error("Failed to create subscription: " + error.message);
    }
  }

  async getSubscriptionByUserId(userId) {
    try {
      const subscription = await Subscription.findOne({ userId });
      return subscription;
    } catch (error) {
      throw new Error("Failed to get subscription: " + error.message);
    }
  }
  async updateSubscription(userId, updateData) {
    try {
      const updatedSubscription = await Subscription.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true }
      );
      return updatedSubscription;
    } catch (error) {
      throw new Error("Failed to update subscription: " + error.message);
    }
  }
}
