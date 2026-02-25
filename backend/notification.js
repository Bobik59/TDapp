const Task = require("./models/task.model");
const { bot } = require("./bot");

function startNotificationJob() {
  setInterval(async () => {
    try {
      const now = new Date();

      const tasks = await Task.find({ done: false });

      for (const task of tasks) {
        if (!task.date || !task.time || !task.user) continue;

        const taskTime = new Date(task.date + "T" + task.time);

        // 🔴 просрочено
        if (taskTime < now) {
          if (task.status !== "overdue") {
            task.status = "overdue";
            await task.save();
          }
          continue;
        }

        // ⏰ напоминание за 30 минут
        const diff = taskTime - now;

        if (diff > 0 && diff <= 30 * 60 * 1000 && !task.notified) {
          try {
            const user = await require("./models/user.model").findById(task.user);

            if (user?.telegramChatId) {
              await bot.telegram.sendMessage(
                user.telegramChatId,
                `⏰ Напоминание: через 30 минут задача\n\n${task.title}`
              );
            }

            task.notified = true;
            await task.save();
          } catch (e) {
            console.error("Notify error:", e);
          }
        }
      }
    } catch (err) {
      console.error("Notification job error:", err);
    }
  }, 60 * 1000);
}

module.exports = { startNotificationJob };