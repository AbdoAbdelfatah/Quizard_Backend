import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: String,
    type: { type: String, enum: ["pdf", "video", "link"], required: false },
    url: String,
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    fullName: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);
