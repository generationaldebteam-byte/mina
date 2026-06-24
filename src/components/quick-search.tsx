"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  fullName: string;
  caseNumber: string;
  phone: string;
  status: string;
}

export function QuickSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("toggle-quick-search", handleToggle);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("toggle-quick-search", handleToggle);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?search=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      setResults(data.clients || []);
      setSelectedIndex(0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  function handleSelect(clientId: string) {
    setOpen(false);
    router.push(`/clients/${clientId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-2xl border-2 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b-2">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث باسم العميل، رقم القضية، الهاتف..."
            className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-muted rounded border">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center">
              <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-bold text-muted-foreground">لا توجد نتائج</p>
            </div>
          )}
          {!loading && results.map((client, i) => (
            <button
              key={client.id}
              onClick={() => handleSelect(client.id)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 text-right transition-colors border-b last:border-0",
                i === selectedIndex ? "bg-primary/10" : "hover:bg-muted/50"
              )}
            >
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold truncate">{client.fullName}</p>
                <p className="text-xs text-muted-foreground font-mono">{client.caseNumber} · {client.phone}</p>
              </div>
            </button>
          ))}
          {!query && (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground/60">اكتب للبحث عن عميل...</p>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-t-2 bg-muted/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted rounded border font-bold">↑↓</kbd>
            <span>للتنقل</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted rounded border font-bold">↵</kbd>
            <span>للفتح</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted rounded border font-bold">Esc</kbd>
            <span>لإلغاء</span>
          </div>
        </div>
      </div>
    </div>
  );
}
