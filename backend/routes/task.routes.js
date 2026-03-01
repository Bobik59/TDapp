const express = require("express");
const router = express.Router();

const Task = require("../models/task.model");
const TaskStatus = require("../models/enums/TaskStatus");
const TaskPriority = require("../models/enums/TaskPriority");
const authMiddleware = require("../middleware/auth.middleware");

// ==========================
// Получить задачи пользователя
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ==========================
// Создать задачу
// ==========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, date, time, priority, category, repeatDays } = req.body;

    const newTask = new Task({
      title,
      date: date || null,
      time: time || "",
      priority: priority || TaskPriority.Low,
      category: category || "general",
      repeatDays: repeatDays || [],
      status: TaskStatus.Active,
      done: false,
      user: req.user.id,
    });

    await newTask.save();

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при создании задачи" });
  }
});

// ==========================
// Обновить задачу
// ==========================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, date, time, priority, status, category, done, repeatDays } = req.body;

    const updateData = {
      title,
      date: date || null,
      time: time || "",
      priority,
      category,
      status,
      done,
      repeatDays,
    };

    // если задача завершена
    if (status === TaskStatus.Done || done === true) {
      updateData.done = true;
      updateData.status = TaskStatus.Done;
      updateData.completedAt = new Date();

      // 🔁 Повтор по дням недели
      if (repeatDays && repeatDays.length > 0) {
        const now = new Date();
        let next = null;

        // ищем ближайший день из repeatDays
        for (let i = 1; i <= 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);

          if (repeatDays.includes(d.getDay())) {
            next = d;
            break;
          }
        }

        if (next) {
          await Task.create({
            title,
            date: next.toISOString(),
            priority,
            category,
            repeatDays,
            status: TaskStatus.Active,
            done: false,
            user: req.user.id,
          });
        }
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isDeleted: false },
      updateData,
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

// ==========================
// Soft delete
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json({ message: "Задача удалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при удалении" });
  }
});

module.exports = router;