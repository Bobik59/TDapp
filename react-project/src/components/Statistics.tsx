interface StatisticsProps {
  tasks: any[];
}

export default function Statistics({ tasks }: StatisticsProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  // цвет
  let color = "#ef4444"; // red

  if (percent > 20 && percent <= 60) {
    color = "#eab308"; // yellow
  } else if (percent > 60) {
    color = "#22c55e"; // green
  }

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white">
      <h2 className="text-xl font-semibold mb-6">Статистика выполнения</h2>

      <div className="relative w-56 h-56">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* фон круга */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#374151"
            strokeWidth="15"
            fill="transparent"
          />

          {/* прогресс */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={color}
            strokeWidth="15"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
          {percent}%
        </div>
      </div>

      <p className="mt-4 text-gray-400">
        Выполнено {done} из {total} задач
      </p>
    </div>
  );
}