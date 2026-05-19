import { auth } from "@/lib/auth-index";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
