"use client";
import React, { useEffect, useState, useCallback } from "react";
import { contactsService } from "@/services/contacts.service";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/tables/Pagination";
import type { Contact } from "@/types/api.types";
import { ApiError } from "@/services/api";

export default function ContactsPage() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await contactsService.getAll(p, 10);
      setContacts(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar contactos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) load(page);
  }, [authLoading, page, load]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    setDeleting(id);
    try {
      await contactsService.remove(id);
      await load(page);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Contacts
        </h3>
      </div>

      {/* Error */}
      {error && (
        <p className="px-5 pb-3 text-sm text-red-500">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-t border-gray-200 dark:border-gray-800">
            <tr>
              {["Name", "Email", "Phone", "Category", ""].map((h) => (
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
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No contacts yet.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  {/* Avatar + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: c.color ?? "#6366f1" }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {c.category ? (
                      <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {c.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === c.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
