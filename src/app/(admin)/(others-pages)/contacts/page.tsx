import type { Metadata } from "next";
import ContactsTable from "@/components/contacts/ContactsTable";

export const metadata: Metadata = {
  title: "Contacts | Boilerplate",
  description: "Manage your contacts",
};

export default function ContactsPage() {
  return <ContactsTable />;
}
