import { useEffect, useState } from "react";
import { authApi } from "../services/authApi";

export default function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await authApi.get("/check-auth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.success && res.user) {
          setUser(res.user); // { _id, name, email, role, ... }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading, error };
}