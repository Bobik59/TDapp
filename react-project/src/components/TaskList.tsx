import TaskItem from "./TaskItem";
import type { Task } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  refresh: () => void;
  filterDate?: string;
}

export default function TaskList({ tasks, refresh, filterDate }: TaskListProps) {
  if (!Array.isArray(tasks)) return <div className="text-gray-400">Нет задач</div>;

  const sorted = [...tasks]
    .filter(t => !filterDate || t.date === filterDate)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  if (sorted.length === 0) {
    return <div className="text-gray-400">Задач нет</div>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(task => (
        <TaskItem key={task._id} task={task} refresh={refresh} />
      ))}
    </div>
  );
}