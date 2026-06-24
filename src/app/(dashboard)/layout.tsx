import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
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
      <main className="md:mr-64 min-h-screen pb-16 md:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 shadow-sm">
          <div>
            <h1 className="text-base md:text-lg font-bold">مرحباً، {(session.user as any).name}</h1>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{(session.user as any).role === "ADMIN" ? "مدير النظام" : "موظف"}</p>
          </div>
        </header>
        <div className="px-3 md:px-8 py-4 md:py-6 animate-fade-in">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
