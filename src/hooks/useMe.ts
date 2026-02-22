"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/api.types";

export function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<User>("/auth/me", token)
      .then((data) => setUser(data))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
