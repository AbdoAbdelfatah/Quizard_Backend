import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Credits per billing cycle
    credits: {
      type: Number,
      required: true,
      min: 0,
    },

    // Plan details
    description: String,
    feature: [String],
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active plans
planSchema.index({ isActive: 1 });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
