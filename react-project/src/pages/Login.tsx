import { useState } from "react";
import { login } from "../api/auth";

interface LoginProps {
  setUser: (user: any) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Введите username и пароль");
      return;
    }

    try {
      const data = await login(username, password);

      if (!data?.token) {
        alert(data?.message || "Ошибка входа");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user || { username });
    } catch (error) {
      console.error("Login error:", error);
      alert("Не удалось войти");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-6 w-80 bg-gray-900 text-white rounded">
      <h2 className="text-xl font-bold">Вход</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
      />

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
      >
        Войти
      </button>
    </div>
  );
}