import { buildApiUrl, apiHeaders } from "../lib/api";

const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(apiHeaders(token) || {}),
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getThreads = async (token) => {
  const res = await fetch(buildApiUrl("/threads"), {
    headers: apiHeaders(token) || {},
  });
  return handleResponse(res);
};

export const createThread = async (title, token) => {
  const res = await fetch(buildApiUrl("/threads"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
};

export const deleteThread = async (id, token) => {
  const res = await fetch(buildApiUrl(`/threads/${id}`), {
    method: "DELETE",
    headers: apiHeaders(token) || {},
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || "Failed to delete thread");
  }
  return true;
};

export const getMessages = async (threadId, token) => {
  const res = await fetch(buildApiUrl(`/messages/${threadId}`), {
    headers: apiHeaders(token) || {},
  });
  return handleResponse(res);
};

export const sendMessage = async (threadId, question, token) => {
  const res = await fetch(buildApiUrl("/ask"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ thread_id: threadId, question }),
  });
  return handleResponse(res);
};
