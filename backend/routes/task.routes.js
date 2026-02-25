const express = require("express");
const router = express.Router();

const Task = require("../models/task.model");
const authMiddleware = require("../middleware/auth.middleware");

// Получить задачи пользователя
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Создать задачу
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, date, time, priority, done } = req.body;

    const newTask = new Task({
      title,
      date,
      time,
      priority,
      done: done ?? false,
      user: req.user.id,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при создании задачи" });
  }
});

// Обновить задачу
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, date, time, priority, done, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        title,
        date,
        time,
        priority,
        done,
        status,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
});

// Удалить задачу
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json({ message: "Задача удалена" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при удалении" });
  }
});

module.exports = router;