const API_BASE =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_FINANCE_API ||
  "http://localhost:5001/api/finance";

// Decide role per page (can be overridden)
function resolveRole(pathname = window.location.pathname, overrideRole) {
  if (overrideRole) return overrideRole;
  const saved = localStorage.getItem("hp_role");
  if (saved) return saved;
  return pathname.startsWith("/fm") ? "Billing" : "Owner";
}

// Core fetch wrapper
async function request(path, options = {}) {
  const role = resolveRole(window.location.pathname, options.role);
  const headers = {
    "Content-Type": "application/json",
    "x-role": role,
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    credentials: "include",
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

// Exported API methods
export const api = {
  get: (path, opts) => request(path, { method: "GET", ...(opts || {}) }),
  post: (path, body, opts) => request(path, { method: "POST", body: JSON.stringify(body), ...(opts || {}) }),
  put: (path, body, opts) => request(path, { method: "PUT", body: JSON.stringify(body), ...(opts || {}) }),
  delete: (path, opts) => request(path, { method: "DELETE", ...(opts || {}) }),
};

export { API_BASE };
