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
subscriptionSchema.index({ user: 1 });

// Calculate remaining credits
subscriptionSchema.virtual("creditsRemaining").get(function () {
  return Math.max(0, this.creditsAllocated - this.creditsUsed);
});

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
