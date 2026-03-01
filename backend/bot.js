const { Telegraf, Markup } = require("telegraf");
const User = require("./models/user.model");
const Task = require("./models/task.model");
const TaskStatus = require("./models/enums/TaskStatus");

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
// Вспомогательная функция
// ==========================
async function getUser(ctx) {
  const username = ctx.from.username?.toLowerCase();

  if (!username) {
    await ctx.reply("Установите username в Telegram.");
    return null;
  }

  const user = await User.findOne({ telegramId: username });

  if (!user) {
    await ctx.reply("Сначала зарегистрируйтесь.");
    return null;
  }

  return user;
}

function parseTaskDate(task) {
  if (!task.date) return null;

  const date = new Date(task.date);
  return isNaN(date.getTime()) ? null : date;
}

// ==========================
// /start
// ==========================
bot.start(async (ctx) => {
  try {
    const username = ctx.from.username?.toLowerCase();
    const chatId = ctx.chat.id;

    if (!username) {
      return ctx.reply("Установите username в Telegram.");
    }

    await User.findOneAndUpdate(
      { telegramId: username },
      {
        telegramId: username,
        telegramChatId: chatId,
      },
      { upsert: true }
    );

    ctx.reply("Бот подключён ✅", menu);
  } catch (err) {
    console.error(err);
    ctx.reply("Ошибка.");
  }
});

// ==========================
// 📋 Все задачи
// ==========================
bot.hears("📋 Задачи", async (ctx) => {
  const user = await getUser(ctx);
  if (!user) return;

  const tasks = await Task.find({
    user: user._id,
    isDeleted: false,
  });

  if (!tasks.length) {
    return ctx.reply("Задач нет.");
  }

  // сортировка вручную (из-за String даты)
  tasks.sort((a, b) => {
    const da = parseTaskDate(a);
    const db = parseTaskDate(b);

    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;

    return da - db;
  });

  const lines = tasks.map((t, i) => {
    const icon =
      t.status === TaskStatus.Done ? "✅" :
      t.status === TaskStatus.Overdue ? "🔴" :
      "⏳";

    const date = parseTaskDate(t);
    const dateText = date ? date.toLocaleString() : "Без даты";

    return `${i + 1}. ${icon} ${t.title}\n   ${dateText}`;
  });

  ctx.reply(lines.join("\n\n"));
});

// ==========================
// ⏭ Следующая активная
// ==========================
bot.hears("⏭ Следующая", async (ctx) => {
  const user = await getUser(ctx);
  if (!user) return;

  const tasks = await Task.find({
    user: user._id,
    status: TaskStatus.Active,
    isDeleted: false,
  });

  const now = new Date();

  const upcoming = tasks
    .map(t => ({
      task: t,
      date: parseTaskDate(t)
    }))
    .filter(t => t.date && t.date > now)
    .sort((a, b) => a.date - b.date);

  if (!upcoming.length) {
    return ctx.reply("Ближайших активных задач нет.");
  }

  const next = upcoming[0];

  ctx.reply(
    `⏳ Следующая:\n\n${next.task.title}\n${next.date.toLocaleString()}`
  );
});

// ==========================
// ➕ Подсказка
// ==========================
bot.hears("➕ Добавить", (ctx) => {
  ctx.reply(
`Формат:
➕ Название | 2026-03-01T18:00

Дата необязательна`
  );
});

// ==========================
// 🗑 Подсказка
// ==========================
bot.hears("🗑 Удалить", (ctx) => {
  ctx.reply("Формат:\n🗑 номер задачи");
});

// ==========================
// Обработка текста
// ==========================
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();
  const user = await getUser(ctx);
  if (!user) return;

  // ➕ Добавление
  if (text.startsWith("➕")) {
    const data = text.replace("➕", "").trim();
    const [titleRaw, dateRaw] = data.split("|");

    const title = titleRaw?.trim();
    const date = dateRaw?.trim();

    if (!title) {
      return ctx.reply("Название обязательно.");
    }

    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return ctx.reply("Неверный формат даты.");
      }
    }

    await Task.create({
      title,
      date: date || null,
      user: user._id,
      status: TaskStatus.Active,
    });

    return ctx.reply("Задача добавлена ✅");
  }

  // 🗑 Удаление
  if (text.startsWith("🗑")) {
    const index = parseInt(text.replace("🗑", "").trim());

    if (!index) {
      return ctx.reply("Введите корректный номер.");
    }

    const tasks = await Task.find({
      user: user._id,
      isDeleted: false,
    });

    if (index < 1 || index > tasks.length) {
      return ctx.reply("Неверный номер.");
    }

    await Task.findByIdAndUpdate(tasks[index - 1]._id, {
      isDeleted: true,
    });

    return ctx.reply("Задача удалена 🗑");
  }
});

bot.catch(err => console.error("Bot error:", err));

bot.launch();
console.log("Telegram bot started");

module.exports = { bot };