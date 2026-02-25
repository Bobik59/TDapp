const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { bot } = require("../bot");

const router = express.Router();
const codes = new Map();

// ==========================
// 1️⃣ Отправка кода
// ==========================
router.post("/send-code", async (req, res) => {
  try {
    const { username, password, telegramId } = req.body;

    if (!username || !password || !telegramId) {
      return res.status(400).json({ message: "Заполните все поля." });
    }

    const user = await User.findOne({ telegramId });

    if (!user || !user.telegramChatId) {
      return res
        .status(400)
        .json({ message: "Напишите /start в боте и попробуйте снова." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    codes.set(telegramId, { code, username, password });

    await bot.telegram.sendMessage(user.telegramChatId, `Ваш код: ${code}`);

    res.json({ message: "Код отправлен в Telegram." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// ==========================
// 2️⃣ Подтверждение кода
// ==========================
router.post("/verify-code", async (req, res) => {
  try {
    const { telegramId, code } = req.body;

    const stored = codes.get(telegramId);

    if (!stored || stored.code !== code) {
      return res.status(400).json({ message: "Неверный код." });
    }

    const hashedPassword = await bcrypt.hash(stored.password, 10);

    await User.findOneAndUpdate(
      { telegramId },
      {
        username: stored.username,
        password: hashedPassword
      },
      { new: true }
    );

    codes.delete(telegramId);

    res.json({ message: "Регистрация успешна." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

// ==========================
// 3️⃣ Вход (login)
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Вход выполнен успешно",
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;