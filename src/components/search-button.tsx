"use client";

export function SearchButton() {
  return (
    <button
      onClick={() => document.dispatchEvent(new Event("toggle-quick-search"))}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 bg-muted/50 text-muted-foreground text-xs font-bold hover:bg-muted transition-colors"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      بحث سريع
      <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded border text-[10px]">⌘K</kbd>
    </button>
  );
}
