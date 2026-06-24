import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { QuickSearch } from "@/components/quick-search";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-muted/30">
      <QuickSearch />
      <Sidebar />
      <main className="md:mr-64 min-h-screen pb-16 md:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-base md:text-lg font-bold">مرحباً، {(session.user as any).name}</h1>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">{(session.user as any).role === "ADMIN" ? "مدير النظام" : "موظف"}</p>
            </div>
          </div>
          <button
            onClick={() => document.dispatchEvent(new Event('toggle-quick-search'))}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 bg-muted/50 text-muted-foreground text-xs font-bold hover:bg-muted transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            بحث سريع
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded border text-[10px]">
              ⌘K
            </kbd>
          </button>
        </header>
        <div className="px-3 md:px-8 py-4 md:py-6 animate-fade-in">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
