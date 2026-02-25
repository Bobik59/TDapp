import { useState } from "react";
import { createTask } from "../api/tasks";
import TaskList from "../components/TaskList";

interface HomeProps {
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  refresh: () => void;
}

export default function Home({ tasks, refresh }: HomeProps) {
  const [newTitle, setNewTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");

  const [tab, setTab] = useState<"active" | "done" | "overdue">("active");

  const handleAddTask = async () => {
    if (!newTitle) {
      alert("Введите название задачи");
      return;
    }

    const taskData = {
      title: newTitle,
      date,
      time: time || undefined,
      priority,
      done: false,
      status: "active",
    };

    try {
      await createTask(taskData);

      setNewTitle("");
      setTime("");
      setPriority("low");

      refresh();
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления задачи");
    }
  };

  // фильтр по вкладке
  const filtered = tasks.filter((t) => {
    if (tab === "active") return t.status === "active";
    if (tab === "done") return t.status === "done";
    if (tab === "overdue") return t.status === "overdue";
    return true;
  });

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