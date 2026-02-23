import React from "react";
import { Modal } from "@/components/ui/modal";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  saving?: boolean;
  submitLabel?: string;
  savingLabel?: string;
  children: React.ReactNode;
}

/**
 * Wrapper reutilizable para modales con formulario.
 * Incluye el título, los campos (children) y los botones Cancel / Submit.
 */
export function ModalForm({
  isOpen,
  onClose,
  title,
  onSubmit,
  saving = false,
  submitLabel = "Save",
  savingLabel = "Saving...",
  children,
}: ModalFormProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h4>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}

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
            {saving ? savingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
