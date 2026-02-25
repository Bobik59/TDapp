const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    password: {
      type: String
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true
    },
    telegramChatId: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);