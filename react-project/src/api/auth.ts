const BASE_URL = "http://localhost:5000/api/auth";

export const sendCode = async (
  username: string,
  password: string,
  telegramId: string
) => {
  const res = await fetch(`${BASE_URL}/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, telegramId })
  });

  return res.json();
};

export const verifyCode = async (
  username: string,
  password: string,
  telegramId: string,
  code: string
) => {
  const res = await fetch(`${BASE_URL}/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, telegramId, code })
  });

  return res.json();
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  return res.json();
};