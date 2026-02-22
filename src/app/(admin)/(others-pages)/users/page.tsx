import type { Metadata } from "next";
import UsersTable from "@/components/users/UsersTable";

export const metadata: Metadata = {
  title: "Users | Boilerplate",
  description: "Manage users",
};

export default function UsersPage() {
  return <UsersTable />;
}
