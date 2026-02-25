import { useState, useEffect } from "react";
import { getTasks } from "./api/tasks";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Statistics from "./components/Statistics";
import Login from "./pages/Login";
import Register from "./pages/Register";

type Page = "home" | "stats";

function App() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [page, setPage] = useState<Page>("home");

  // Проверка токена при запуске
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
    }
  }, []);

  // Загрузка задач после авторизации
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await getTasks();

      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.warn("Backend вернул не массив:", data);
        setTasks([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
      setTasks([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTasks([]);
    setPage("home");
  };

  // Если не авторизован — показываем Login/Register
  if (!user) {
    return (
      <div className="min-h-screen flex bg-gray-900 text-white">
        <Sidebar
          page="home"
          setPage={() => {}}
          onLogout={handleLogout}
          isAuth={false}
        />

        <div className="flex-1 p-6">
          {showRegister ? (
            <Register setUser={setUser} />
          ) : (
            <Login setUser={setUser} />
          )}

          <div className="mt-4">
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="text-blue-400 hover:underline"
            >
              {showRegister
                ? "Уже есть аккаунт? Вход"
                : "Нет аккаунта? Регистрация"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если авторизован — основное приложение
  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        isAuth={true}
      />

      <main className="flex-1 p-6">
        {page === "home" && (
          <Home
            tasks={tasks}
            setTasks={setTasks}
            refresh={loadTasks}
          />
        )}

        {page === "stats" && (
          <Statistics tasks={tasks} />
        )}
      </main>
    </div>
  );
}

export default App;