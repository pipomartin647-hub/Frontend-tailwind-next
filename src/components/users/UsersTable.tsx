"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/services/api";
import { authService } from "@/services/auth.service";
import Pagination from "@/components/tables/Pagination";
import type { User } from "@/types/api.types";

interface PaginatedUsers {
  data: User[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function UsersTable() {
  const { user: me, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<PaginatedUsers>(
        `/users?page=${p}&limit=10`,
        authService.getToken() ?? undefined,
      );
      setUsers(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) load(page);
  }, [authLoading, page, load]);

  const isAdmin = me?.role === "ADMIN";

  if (authLoading) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between p-5 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Users
        </h3>
        {!isAdmin && (
          <span className="text-xs text-gray-400">Read-only — Admin access required to manage users</span>
        )}
      </div>

      {error && <p className="px-5 pb-3 text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-t border-gray-200 dark:border-gray-800">
            <tr>
              {["Name", "Email", "Role", "Joined"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-50 dark:hover:bg-white/2 ${
                    u.id === me?.userId ? "bg-brand-50/30 dark:bg-brand-500/5" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar con inicial */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                        {(u.name ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {u.name ?? "—"}
                        {u.id === me?.userId && (
                          <span className="ml-2 text-xs text-brand-500">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {u.email}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
