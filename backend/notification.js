const Task = require("./models/task.model");
const TaskStatus = require("./models/enums/TaskStatus");
const User = require("./models/user.model");
const { bot } = require("./bot");

function startNotificationJob() {
  setInterval(async () => {
    try {
      const now = new Date();

      const tasks = await Task.find({
        isDeleted: false,
        status: { $in: [TaskStatus.Active] }
      });

      for (const task of tasks) {
        if (!task.date) continue;

        // 🔴 Просрочено
        if (task.date < now && task.status === TaskStatus.Active) {
          task.status = TaskStatus.Overdue;
          await task.save();
          continue;
        }

        // ⏰ Напоминание за 30 минут
        const diff = task.date - now;

        if (diff > 0 && diff <= 30 * 60 * 1000 && !task.notified) {
          const user = await User.findById(task.user);

          if (user?.telegramChatId) {
            await bot.telegram.sendMessage(
              user.telegramChatId,
              `⏰ Напоминание:\n\n${task.title}`
            );
          }

          task.notified = true;
          await task.save();
        }
      }
    } catch (err) {
      console.error("Notification job error:", err);
    }
  }, 60 * 1000);
}

module.exports = { startNotificationJob };