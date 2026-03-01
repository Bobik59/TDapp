import { useState } from "react";
import { motion } from "framer-motion";
import { updateTask, deleteTask } from "../api/tasks";

export interface Task {
  _id: string;
  title: string;
  date: string;
  priority: "low" | "medium" | "high";
  status: "active" | "done" | "overdue";
  category?: string;
  repeatDays?: number[];
}

interface TaskItemProps {
  task: Task;
  refresh: () => void;
}

const border = {
  low: "border-gray-500",
  medium: "border-yellow-500",
  high: "border-red-500",
};

const statusText = {
  active: "⏳ Активно",
  done: "✅ Выполнено",
  overdue: "🔴 Просрочено",
};

const days = [
  { label: "Пн", value: 1 },
  { label: "Вт", value: 2 },
  { label: "Ср", value: 3 },
  { label: "Чт", value: 4 },
  { label: "Пт", value: 5 },
  { label: "Сб", value: 6 },
  { label: "Вс", value: 0 },
];

export default function TaskItem({ task, refresh }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDate, setEditDate] = useState(
    task.date ? new Date(task.date).toISOString().split("T")[0] : ""
  );
  const [editTime, setEditTime] = useState(
    task.date ? new Date(task.date).toISOString().slice(11, 16) : ""
  );
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editCategory, setEditCategory] = useState(task.category || "general");
  const [editRepeatDays, setEditRepeatDays] = useState<number[]>(
    task.repeatDays || []
  );

  // ✔ выполнить
  const markDone = async () => {
    await updateTask(task._id, {
      status: "done",
    });
    refresh();
  };

  // ✔ удалить (soft)
  const removeTask = async () => {
    await deleteTask(task._id);
    refresh();
  };

  // ✔ сохранить изменения
  const saveEdit = async () => {
    await updateTask(task._id, {
      title: editTitle,
      date: new Date(`${editDate}T${editTime || "00:00"}`).toISOString(),
      priority: editPriority,
      category: editCategory,
      repeatDays: editRepeatDays,
    });

    setIsEditing(false);
    refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`p-4 rounded-xl border-l-4 ${border[task.priority]} bg-gray-800 text-white shadow-md mb-3`}
    >
      <div className="flex justify-between items-center">
        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <div className="flex gap-2">
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="low">🟢 Низкий</option>
              <option value="medium">🟡 Средний</option>
              <option value="high">🔴 Высокий</option>
            </select>

            {/* категория */}
            <input
              type="text"
              placeholder="Категория"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            {/* повтор по дням */}
            <div className="flex gap-2 flex-wrap">
              {days.map((d) => (
                <label key={d.value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editRepeatDays.includes(d.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditRepeatDays([...editRepeatDays, d.value]);
                      } else {
                        setEditRepeatDays(editRepeatDays.filter((x) => x !== d.value));
                      }
                    }}
                  />
                  {d.label}
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="px-2 py-1 rounded bg-green-600 text-white text-sm"
              >
                Сохранить
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 rounded bg-gray-600 text-white text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div
                className={
                  task.status === "done" ? "line-through text-gray-500" : ""
                }
              >
                {task.title}
              </div>

              <div className="text-sm text-gray-400">
                {statusText[task.status]}
              </div>

              <div className="text-sm text-gray-500">
                {task.date && new Date(task.date).toLocaleString()}
              </div>

              {task.category && (
                <div className="text-sm text-blue-400">📂 {task.category}</div>
              )}

              {task.repeatDays && task.repeatDays.length > 0 && (
                <div className="text-sm text-green-400">
                  🔁 Повтор:{" "}
                  {task.repeatDays
                    .map((d) => days.find((x) => x.value === d)?.label)
                    .join(", ")}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* выполнить */}
              {task.status !== "done" && (
                <button
                  onClick={markDone}
                  className="px-2 py-1 rounded bg-green-600 text-white text-sm"
                >
                  ✔ Выполнить
                </button>
              )}

              {/* редактировать */}
              {task.status !== "done" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 rounded bg-yellow-600 text-white text-sm"
                >
                  ✎ Редактировать
                </button>
              )}

              {/* удалить */}
              <button
                onClick={removeTask}
                className="text-red-400 hover:text-red-600"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}