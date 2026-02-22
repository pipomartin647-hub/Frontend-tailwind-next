"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { contactsService } from "@/services/contacts.service";
import { useAuth } from "@/hooks/useAuth";
import type { Contact, CreateContactPayload } from "@/types/api.types";
import { ApiError } from "@/services/api";
import { Modal } from "@/components/ui/modal";
import { alert } from "@/lib/alerts";

// ── Create Contact Form ───────────────────────────────────────────────────────
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#ec4899","#14b8a6"];

function CreateContactModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (c: Contact) => void;
}) {
  const [form, setForm] = useState<CreateContactPayload>({ name: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof CreateContactPayload, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      await alert.error(new ApiError(400, "El nombre es obligatorio."));
      return;
    }
    setSaving(true);
    try {
      const created = await contactsService.create(form);
      onCreated(created);
      setForm({ name: "" });
      onClose();
      await alert.success("Contacto creado", created.name);
    } catch (err) {
      await alert.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        New Contact
      </h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="john@example.com"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 234 567 890"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <input
            type="text"
            value={form.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Client, Partner..."
            className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* Color */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Avatar color
          </label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                className="h-7 w-7 rounded-full ring-2 ring-offset-2 transition-all"
                style={{
                  backgroundColor: c,
                  outline: form.color === c ? `2px solid ${c}` : "2px solid transparent",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create contact"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Modal de Editar ─────────────────────────────────────────────────────────
function EditContactModal({
  contact,
  onClose,
  onUpdated,
}: {
  contact: Contact | null;
  onClose: () => void;
  onUpdated: (c: Contact) => void;
}) {
  const [form, setForm] = useState<{ name: string; email: string; phone: string; category: string; color: string }>({
    name: "", email: "", phone: "", category: "", color: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        category: contact.category ?? "",
        color: contact.color ?? "",
      });
    }
  }, [contact]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    if (!form.name.trim()) {
      await alert.error(new ApiError(400, "El nombre es obligatorio."));
      return;
    }
    setSaving(true);
    try {
      const updated = await contactsService.update(contact.id, form);
      onUpdated(updated);
      onClose();
      await alert.success("Contacto actualizado", updated.name);
    } catch (err) {
      await alert.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!contact} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Edit Contact</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 234 567 890" className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Client, Partner..." className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("color", c)}
                className="h-7 w-7 rounded-full transition-all"
                style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : "2px solid transparent", outlineOffset: "2px" }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </form>
    </Modal>
  );
}

const columnHelper = createColumnHelper<Contact>();

export default function ContactsTable() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactsService.getAll(1, 1000);
      setContacts(res.data);
    } catch (err) {
      await alert.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const handleDelete = async (c: Contact) => {
    const result = await alert.confirm(`Delete "${c.name}"?`, "This contact will be removed.");
    if (!result.isConfirmed) return;
    try {
      await contactsService.remove(c.id);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
      await alert.success("Contact deleted");
    } catch (err) {
      await alert.error(err);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: c.color ?? "#6366f1" }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {c.name}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {info.getValue()}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setEditContact(c)} className="text-xs text-brand-500 hover:text-brand-700 dark:text-brand-400">Edit</button>
              <button onClick={() => handleDelete(c)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          );
        },
      }),
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (authLoading) return null;

  return (
    <>
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Contacts
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({table.getFilteredRowModel().rows.length})
          </span>
        </h3>

        {/* Right side: search + button */}
        <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search contacts..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
          />
        </div>

        {/* New Contact button */}
        <button
          onClick={() => setCreateOpen(true)}
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          + New contact
        </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-t border-gray-200 dark:border-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-300 dark:text-gray-600">
                          {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? " ↕"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  {globalFilter ? "No results found." : "No contacts yet."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/2"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border border-gray-200 bg-transparent px-2 py-1 text-sm dark:border-gray-700 dark:text-gray-300"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Page info + nav */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >«</button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >‹</button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >›</button>
            <button
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >»</button>
          </div>
        </div>
      </div>
    </div>

    <CreateContactModal
      isOpen={createOpen}
      onClose={() => setCreateOpen(false)}
      onCreated={(c) => setContacts((prev) => [c, ...prev])}
    />
    <EditContactModal
      contact={editContact}
      onClose={() => setEditContact(null)}
      onUpdated={(updated) =>
        setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }
    />
  </>
  );
}

