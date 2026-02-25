const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String },
    time: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },

    done: { type: Boolean, default: false },

    // новый статус
    status: {
      type: String,
      enum: ["active", "done", "overdue"],
      default: "active",
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);