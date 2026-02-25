import { motion } from "framer-motion";
import { updateTask, deleteTask } from "../api/tasks";

export interface Task {
  _id: string;
  title: string;
  date: string;
  time?: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  status: "active" | "done" | "overdue";
}

interface TaskItemProps {
  task: Task;
  refresh: () => void;
}

const priorityBorder = {
  low: "border-gray-500",
  medium: "border-yellow-500",
  high: "border-red-500",
};

export default function TaskItem({ task, refresh }: TaskItemProps) {
  // ✔ выполнить
  const markDone = async () => {
    await updateTask(task._id, {
      done: true,
      status: "done",
    });
    refresh();
  };

  // ✔ удалить
  const removeTask = async () => {
    await deleteTask(task._id);
    refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`p-4 rounded-xl border-l-4 ${priorityBorder[task.priority]}
        bg-gray-800 text-white shadow-md mb-3`}
    >
      <div className="flex justify-between items-center">
        <div className={task.done ? "line-through text-gray-500" : ""}>
          {task.time && <span className="text-blue-400">[{task.time}] </span>}
          {task.title}
        </div>

        <div className="flex gap-2">
          {/* кнопка выполнить */}
          {!task.done && (
            <button
              onClick={markDone}
              className="px-2 py-1 rounded bg-green-600 text-white text-sm"
            >
              ✔ Выполнить
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
      </div>
    </motion.div>
  );
}