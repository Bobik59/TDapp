import { useState } from "react";
import { sendCode, verifyCode } from "../api/auth";

interface RegisterProps {
  setUser: (user: any) => void;
}

export default function Register({ setUser }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"form" | "code">("form");
  const [loading, setLoading] = useState(false);

  // 1) отправить код в Telegram
  const handleSendCode = async () => {
    if (!username || !password || !telegramId) {
      alert("Заполните username, пароль и Telegram username");
      return;
    }

    if (password.length < 6) {
      alert("Пароль должен быть минимум 6 символов");
      return;
    }

    try {
      setLoading(true);

      const data = await sendCode(username, password, telegramId);

      if (data?.message) {
        setStep("code");
      } else {
        alert(data?.message || "Ошибка отправки кода");
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert("Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  // 2) подтвердить код и создать аккаунт
  const handleVerify = async () => {
    if (!code) {
      alert("Введите код");
      return;
    }

    try {
      setLoading(true);

      const data = await verifyCode(username, password, telegramId, code);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      } else {
        alert(data?.message || "Неверный код");
      }
    } catch (error) {
      console.error("Verify error:", error);
      alert("Ошибка подтверждения");
    } finally {
      setLoading(false);
    }
  };

  // форма регистрации
  if (step === "form") {
    return (
      <div className="flex flex-col gap-3 p-6 w-80 bg-gray-900 text-white rounded">
        <h2 className="text-xl font-bold">Регистрация</h2>

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

        <input
          type="text"
          placeholder="Telegram username (без @)"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        />

        <button
          onClick={handleSendCode}
          disabled={loading}
          className={`w-full p-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Отправка кода..." : "Отправить код"}
        </button>
      </div>
    );
  }

  // форма ввода кода
  return (
    <div className="flex flex-col gap-3 p-6 w-80 bg-gray-900 text-white rounded">
      <h2 className="text-xl font-bold">Введите код из Telegram</h2>

      <input
        type="text"
        placeholder="Код"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-full p-2 rounded text-white ${
          loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Проверка..." : "Подтвердить"}
      </button>
    </div>
  );
}