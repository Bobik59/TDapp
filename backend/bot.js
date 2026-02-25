const { Telegraf, Markup } = require("telegraf");
const User = require("./models/user.model");
const Task = require("./models/task.model");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN не задан");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.telegram.deleteWebhook().catch(() => {});

// ==========================
// Главное меню
// ==========================
const menu = Markup.keyboard([
  ["📋 Задачи", "⏭ Следующая"],
  ["➕ Добавить", "🗑 Удалить"]
]).resize();

// ==========================
// /start — показываем меню
// ==========================
bot.start(async (ctx) => {
  try {
    const username = ctx.from.username?.toLowerCase();
    const chatId = ctx.chat.id;

    if (!username) {
      return ctx.reply("У вас не установлен username в Telegram.");
    }

    await User.findOneAndUpdate(
      { telegramId: username },
      {
        telegramId: username,
        telegramChatId: chatId,
      },
      { upsert: true }
    );

    ctx.reply("Привет! Меню активировано.", menu);
  } catch (error) {
    console.error("Bot error:", error);
    ctx.reply("Произошла ошибка.");
  }
});

// ==========================
// обработка нажатий кнопок
// ==========================
bot.hears("📋 Задачи", async (ctx) => {
  const username = ctx.from.username?.toLowerCase();
  const user = await User.findOne({ telegramId: username });

  if (!user) return ctx.reply("Сначала зарегистрируйтесь.");

  const tasks = await Task.find({ user: user._id });

  if (!tasks.length) return ctx.reply("Задач нет.");

  const lines = tasks.map(
    (t, i) => `${i + 1}. ${t.title} [${t.date || "—"} ${t.time || ""}]`
  );

  ctx.reply(lines.join("\n"));
});

bot.hears("⏭ Следующая", async (ctx) => {
  const username = ctx.from.username?.toLowerCase();
  const user = await User.findOne({ telegramId: username });

  if (!user) return ctx.reply("Сначала зарегистрируйтесь.");

  const task = await Task.findOne({ user: user._id, done: false }).sort({
    date: 1,
    time: 1,
  });

  if (!task) return ctx.reply("Ближайших задач нет.");

  ctx.reply(`⏳ Следующая:\n${task.title}\n${task.date} ${task.time || ""}`);
});

bot.hears("➕ Добавить", (ctx) => {
  ctx.reply("Формат:\n➕ название|дата|время\n\nПример:\n➕ Купить хлеб|2026-02-22|18:00");
});

bot.hears("🗑 Удалить", (ctx) => {
  ctx.reply("Формат:\n🗑 номер задачи\n\nЧтобы узнать номер — нажмите '📋 Задачи'.");
});

// ==========================
// обработка текста для добавления/удаления
// ==========================
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();
  const username = ctx.from.username?.toLowerCase();
  const user = await User.findOne({ telegramId: username });

  if (!user) return ctx.reply("Сначала зарегистрируйтесь.");

  // ➕ добавление
  if (text.startsWith("➕")) {
    const data = text.replace("➕", "").trim();
    const [title, date, time] = data.split("|").map((s) => s?.trim());

    if (!title) return ctx.reply("Формат: ➕ название|дата|время");

    const task = new Task({
      title,
      date,
      time,
      user: user._id,
      done: false,
      status: "active",
    });

    await task.save();
    return ctx.reply("Задача добавлена 👍");
  }

  // 🗑 удаление по номеру
  if (text.startsWith("🗑")) {
    const index = parseInt(text.replace("🗑", "").trim());

    if (!index) return ctx.reply("Формат: 🗑 номер");

    const tasks = await Task.find({ user: user._id }).sort({ createdAt: 1 });

    if (index < 1 || index > tasks.length) {
      return ctx.reply("Неверный номер.");
    }

    const task = tasks[index - 1];
    await Task.findByIdAndDelete(task._id);

    return ctx.reply("Задача удалена 🗑");
  }
});

bot.catch((err) => console.error("Bot error:", err));

bot.launch();

console.log("Telegram bot started");

module.exports = { bot };