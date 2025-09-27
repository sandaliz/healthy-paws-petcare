// src/services/authApi.js
const AUTH_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api/auth";

// Generic request for auth endpoints
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${AUTH_BASE}${path}`, {
    headers,
    credentials: "include", // send cookies if any
    ...options,
  });

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok)
    throw new Error(data?.message || `Auth request failed: ${res.status}`);
  return data;
}

export const authApi = {
  get: (path, opts) =>
    request(path, { method: "GET", ...(opts || {}) }),
  post: (path, body, opts) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...(opts || {}),
    }),
};