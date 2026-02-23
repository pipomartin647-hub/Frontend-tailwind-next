"use client";
import React, { useState } from "react";
import { ModalForm } from "@/components/ui/ModalForm";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { contactsService } from "@/services/contacts.service";
import { alert } from "@/lib/alerts";
import type { Contact, CreateContactPayload } from "@/types/api.types";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (c: Contact) => void;
}

export function CreateContactModal({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateContactPayload>({ name: "" });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = EMAIL_RE.test(form.email ?? "");

  const set = (k: keyof CreateContactPayload, v: string) => {
    if (k === "name") setNameError("");
    if (k === "email") setEmailTouched(true);
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const created = await contactsService.create(form);
      onCreated(created);
      setForm({ name: "" });
      setEmailTouched(false);
      onClose();
      await alert.success("Contacto creado", created.name);
    } catch (err) {
      await alert.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="New Contact"
      onSubmit={handleSubmit}
      saving={saving}
      submitLabel="Create contact"
      savingLabel="Saving..."
    >
      {/* Name */}
      <div>
        <Label htmlFor="create-name">Name <span className="text-red-500">*</span></Label>
        <Input
          id="create-name"
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="John Doe"
          error={!!nameError}
          hint={nameError || undefined}
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="create-email">Email</Label>
        <Input
          id="create-email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="john@example.com"
          error={emailTouched && !!form.email && !emailValid}
          success={emailTouched && emailValid}
          hint={
            emailTouched && !!form.email
              ? emailValid ? "Email válido." : "Introduce un email válido."
              : undefined
          }
        />
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="create-phone">Phone</Label>
        <Input
          id="create-phone"
          type="tel"
          value={form.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+1 234 567 890"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="create-category">Category</Label>
        <Input
          id="create-category"
          type="text"
          value={form.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
          placeholder="Client, Partner..."
        />
      </div>

      {/* Color */}
      <div>
        <Label>Avatar color</Label>
        <div className="flex gap-2 mt-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              className="h-7 w-7 rounded-full transition-all"
              style={{
                backgroundColor: c,
                outline: form.color === c ? `2px solid ${c}` : "2px solid transparent",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>
    </ModalForm>
  );
}
