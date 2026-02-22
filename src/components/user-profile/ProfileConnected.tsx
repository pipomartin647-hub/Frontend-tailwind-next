"use client";
import React from "react";
import { useMe } from "@/hooks/useMe";

export default function ProfileConnected() {
  const { user, loading, error } = useMe();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error || !user) {
    return (
      <p className="text-sm text-red-500">{error ?? "Could not load profile."}</p>
    );
  }

  const [firstName, ...rest] = (user.name ?? "").split(" ");
  const lastName = rest.join(" ");

  return (
    <div className="space-y-6">
      {/* ── Avatar + name card ─────────────────────────────────────────── */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center gap-4 xl:flex-row">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>

            <div className="text-center xl:text-left">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {user.name ?? "—"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              user.role === "ADMIN"
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* ── Personal info card ─────────────────────────────────────────── */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h4>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
          <Field label="First Name" value={firstName || "—"} />
          <Field label="Last Name"  value={lastName  || "—"} />
          <Field label="Email"      value={user.email} />
          <Field label="Role"       value={user.role} />
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
          <Field
            label="Last updated"
            value={new Date(user.updatedAt).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}
