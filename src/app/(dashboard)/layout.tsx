import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="mr-0 md:mr-64 min-h-screen">
        <header className="flex h-16 items-center justify-between border-b-2 bg-background px-4 md:px-8 shadow-sm">
          <div className="mr-9 md:mr-0">
            <h1 className="text-lg font-bold">مرحباً، {(session.user as any).name}</h1>
            <p className="text-sm font-medium text-muted-foreground capitalize">{(session.user as any).role === "ADMIN" ? "مدير النظام" : "موظف"}</p>
          </div>
        </header>
        <div className="px-3 md:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
