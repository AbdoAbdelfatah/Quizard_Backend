import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    currentQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("ChatSession", chatSessionSchema);
