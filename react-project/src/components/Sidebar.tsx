type Page = "home" | "stats";

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
  isAuth: boolean;
}

export default function Sidebar({
  page,
  setPage,
  onLogout,
  isAuth,
}: SidebarProps) {
  return (
    <div className="w-64 min-h-screen bg-gray-950 text-white p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-8">ToDo App</h1>

        {isAuth && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setPage("home")}
              className={`text-left px-4 py-2 rounded transition ${
                page === "home"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Главная
            </button>

            <button
              onClick={() => setPage("stats")}
              className={`text-left px-4 py-2 rounded transition ${
                page === "stats"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Статистика
            </button>
          </div>
        )}
      </div>

      {isAuth && (
        <button
          onClick={onLogout}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Выйти
        </button>
      )}
    </div>
  );
}