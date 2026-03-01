const BASE_URL = import.meta.env.VITE_API_URL + "/api/tasks";

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
    return null;
  }

  return res.json();
};

export const getTasks = async () => {
  const res = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

export const createTask = async (task: any) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(task),
  });

  return handleResponse(res);
};

export const updateTask = async (id: string, updates: any) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(updates),
  });

  return handleResponse(res);
};

export const deleteTask = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};