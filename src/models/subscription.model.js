import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
      index: true,
    },

    // Dates
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Credits for this subscription period
    creditsAllocated: {
      type: Number,
      required: true,
    },
    creditsUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Calculate remaining credits
subscriptionSchema.virtual("creditsRemaining").get(function () {
  return Math.max(0, this.creditsAllocated - this.creditsUsed);
});

// Check if subscription is valid
subscriptionSchema.virtual("isValid").get(function () {
  return this.status === "active" && this.endDate > new Date();
});

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
