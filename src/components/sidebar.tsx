"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  Scale,
  LogOut,
  Sun,
  Moon,
  Calendar,
  Menu,
  X,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/clients", label: "العملاء", icon: Users },
  { href: "/calendar", label: "التقويم", icon: Calendar },
  { href: "/clients/new", label: "إضافة عميل", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 flex md:hidden h-10 w-10 items-center justify-center rounded-xl border-2 bg-background shadow-md hover:bg-muted active:scale-95 transition-all"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-64 border-l-2 bg-background shadow-lg transition-transform duration-300",
          "md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between gap-3 border-b-2 px-6 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Scale className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">إدارة القضايا</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-all"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-border"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t-2 p-3 space-y-2 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 font-medium"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
