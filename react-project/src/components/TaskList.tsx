import TaskItem from "./TaskItem";

interface Task {
  _id: string;
  title: string;
  date: string;
  priority: "low" | "medium" | "high";
  status: "active" | "done" | "overdue";
}

interface Props {
  tasks: Task[];
  refresh: () => void;
}

export default function TaskList({ tasks, refresh }: Props) {
  if (!tasks.length) {
    return <div className="text-gray-400">Нет задач</div>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          refresh={refresh}
        />
      ))}
    </div>
  );
}