"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { TableActions } from "@/components/ui/TableActions";
import { CreateContactModal } from "./CreateContactModal";
import { EditContactModal } from "./EditContactModal";
import { contactsService } from "@/services/contacts.service";
import { useAuth } from "@/hooks/useAuth";
import { alert } from "@/lib/alerts";
import type { Contact } from "@/types/api.types";

const columnHelper = createColumnHelper<Contact>();

export default function ContactsTable() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);

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

  const handleDelete = useCallback(async (c: Contact) => {
    const result = await alert.confirm(`Delete "${c.name}"?`, "This contact will be removed.");
    if (!result.isConfirmed) return;
    try {
      await contactsService.remove(c.id);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
      await alert.success("Contact deleted");
    } catch (err) {
      await alert.error(err);
    }
  }, []);

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
            <TableActions
              onEdit={() => setEditContact(c)}
              onDelete={() => handleDelete(c)}
            />
          );
        },
      }),
    ],
    [handleDelete]
  );

  if (authLoading) return null;

  return (
    <>
      <DataTable
        data={contacts}
        columns={columns}
        loading={loading}
        title="Contacts"
        searchPlaceholder="Search contacts..."
        onNew={() => setCreateOpen(true)}
        newLabel="+ New contact"
        emptyText="No contacts yet."
      />
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
