"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  title: string;
  searchPlaceholder?: string;
  onNew?: () => void;
  newLabel?: string;
  emptyText?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  title,
  searchPlaceholder = "Search...",
  onNew,
  newLabel = "+ New",
  emptyText = "No records found.",
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const colCount = columns.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({table.getFilteredRowModel().rows.length})
          </span>
        </h3>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          {/* New button */}
          {onNew && (
            <button
              onClick={onNew}
              className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              {newLabel}
            </button>
          )}
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
                <td colSpan={colCount} className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-10 text-center text-gray-400">
                  {globalFilter ? "No results found." : emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
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

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800">«</button>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800">‹</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800">›</button>
            <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}
              className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
