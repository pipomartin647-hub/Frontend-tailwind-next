import React from "react";

interface TableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

/**
 * Botones de acción reutilizables para filas de tabla (Edit + Delete).
 */
export function TableActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: TableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={onEdit}
        className="text-xs text-brand-500 hover:text-brand-700 dark:text-brand-400"
      >
        {editLabel}
      </button>
      <button
        onClick={onDelete}
        className="text-xs text-red-500 hover:text-red-700"
      >
        {deleteLabel}
      </button>
    </div>
  );
}
