import { useState } from "react";
import { createTask } from "../api/tasks";
import TaskList from "../components/TaskList";

interface HomeProps {
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  refresh: () => void;
}

const days = [
  { label: "Пн", value: 1 },
  { label: "Вт", value: 2 },
  { label: "Ср", value: 3 },
  { label: "Чт", value: 4 },
  { label: "Пт", value: 5 },
  { label: "Сб", value: 6 },
  { label: "Вс", value: 0 },
];

export default function Home({ tasks, refresh }: HomeProps) {
  const [newTitle, setNewTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [category, setCategory] = useState("general");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const [tab, setTab] = useState<"active" | "done" | "overdue">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleAddTask = async () => {
    if (!newTitle) {
      alert("Введите название задачи");
      return;
    }

    const taskData = {
      title: newTitle,
      date: new Date(`${date}T${time || "00:00"}`).toISOString(),
      priority,
      category,
      repeatDays,
      status: "active",
    };

    try {
      await createTask(taskData);

      setNewTitle("");
      setTime("");
      setPriority("low");
      setCategory("general");
      setRepeatDays([]);

      refresh();
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления задачи");
    }
  };

  // фильтр по вкладке
  let filtered = tasks.filter((t) => {
    if (tab === "active") return t.status === "active";
    if (tab === "done") return t.status === "done";
    if (tab === "overdue") return t.status === "overdue";
    return true;
  });

  // фильтр по категории
  if (categoryFilter !== "all") {
    filtered = filtered.filter((t) => t.category === categoryFilter);
  }

  const categories = Array.from(new Set(tasks.map((t) => t.category || "general")));

  return (
    <div className="p-4">
      {/* вкладки */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("active")}
          className={`px-3 py-1 rounded ${
            tab === "active" ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
          }`}
        >
          Активные
        </button>

        <button
          onClick={() => setTab("done")}
          className={`px-3 py-1 rounded ${
            tab === "done" ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
          }`}
        >
          Выполненные
        </button>

        <button
          onClick={() => setTab("overdue")}
          className={`px-3 py-1 rounded ${
            tab === "overdue"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          Просроченные
        </button>
      </div>

      {/* фильтр по категории */}
      <div className="mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white border border-gray-600"
        >
          <option value="all">Все категории</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* форма */}
      <div className="p-4 rounded-xl bg-gray-800 text-white shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Новая задача</h2>

        <input
          type="text"
          placeholder="Название"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-2"
        />

        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-2"
        >
          <option value="low">🟢 Низкий</option>
          <option value="medium">🟡 Средний</option>
          <option value="high">🔴 Высокий</option>
        </select>

        {/* категория */}
        <input
          type="text"
          placeholder="Категория"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-2"
        />

        {/* повтор по дням */}
        <div className="flex gap-2 flex-wrap mb-2">
          {days.map((d) => (
            <label key={d.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={repeatDays.includes(d.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRepeatDays([...repeatDays, d.value]);
                  } else {
                    setRepeatDays(repeatDays.filter((x) => x !== d.value));
                  }
                }}
              />
              {d.label}
            </label>
          ))}
        </div>

        <button
          onClick={handleAddTask}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Добавить
        </button>
      </div>

      {/* список */}
      <TaskList tasks={filtered} refresh={refresh} />
    </div>
  );
}