"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Eye, PlusCircle, Settings2, Check } from "lucide-react";
import { ClientStatus } from "@/lib/prisma";
import Link from "next/link";

const statusLabels: Record<ClientStatus, string> = {
  NEW_CLIENT: "عميل جديد",
  GATHERING_DOCUMENTS: "جمع المستندات",
  SUBMITTED: "تم التقديم",
  INTERVIEW_SCHEDULED: "مقابلة مجدولة",
  WAITING_DECISION: "بانتظار القرار",
  APPEAL: "استئناف",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
  CLOSED: "مغلق",
};

const statusColors: Record<ClientStatus, string> = {
  NEW_CLIENT: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  GATHERING_DOCUMENTS: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700",
  SUBMITTED: "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700",
  WAITING_DECISION: "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  APPEAL: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  APPROVED: "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  REJECTED: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
  CLOSED: "bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
};

const ITEMS_PER_PAGE = 10;

interface Client {
  id: string;
  fullName: string;
  caseNumber: string;
  status: ClientStatus;
  phone: string;
  passportNumber: string | null;
  updatedAt: string;
}

interface ClientsResponse {
  clients: Client[];
  total: number;
}

export function ClientTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState<"updatedAt" | "fullName">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [data, setData] = useState<ClientsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [visibleColumns, setVisibleColumns] = useState({
    fullName: true,
    caseNumber: true,
    status: true,
    phone: true,
    updatedAt: true,
    actions: true,
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", page.toString());
    params.set("limit", ITEMS_PER_PAGE.toString());

    const res = await fetch(`/api/clients?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [search, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    setSelectedIndex(-1);
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [search, statusFilter, page, router]);

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value || "ALL");
    setPage(1);
  };

  const handleSort = (column: "updatedAt" | "fullName") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setColumnMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columnLabels: Record<string, string> = {
    fullName: "الاسم الكامل",
    caseNumber: "رقم القضية",
    status: "الحالة",
    phone: "الهاتف",
    updatedAt: "آخر تحديث",
    actions: "إجراءات",
  };

  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (!data?.clients.length) return;
    const clients = data.clients;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, clients.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < clients.length) {
          router.push(`/clients/${clients[selectedIndex].id}`);
        }
        break;
      case "Escape":
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border-2 shadow-sm p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، رقم القضية، الهاتف..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-9 font-medium border-2"
              />
            </div>
            <Button onClick={handleSearch} variant="default" className="shrink-0 font-bold">
              بحث
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] border-2 font-medium">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="font-semibold">جميع الحالات</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key} className="font-medium">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative" ref={columnMenuRef}>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 font-bold text-xs h-9 px-2"
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            {columnMenuOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl border-2 bg-popover p-2 shadow-xl animate-scale-in">
                <p className="text-xs font-bold text-muted-foreground px-2 py-1.5">إظهار الأعمدة</p>
                {Object.entries(columnLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setVisibleColumns((prev) => ({ ...prev, [key]: !(prev as any)[key] }))}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${(visibleColumns as any)[key] ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                      {(visibleColumns as any)[key] && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 shadow-sm bg-white dark:bg-gray-900 overflow-hidden" ref={tableRef}>
        <div className="overflow-x-auto" tabIndex={0} onKeyDown={handleTableKeyDown} role="grid" aria-label="جدول العملاء">
          <TableHeader>
            <TableRow className="bg-muted/60 border-b-2">
              {visibleColumns.fullName && (
                <TableHead
                  className="cursor-pointer select-none font-bold text-sm"
                  onClick={() => handleSort("fullName")}
                >
                  الاسم الكامل {sortBy === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.caseNumber && (
                <TableHead className="font-bold text-sm">رقم القضية</TableHead>
              )}
              {visibleColumns.status && (
                <TableHead className="font-bold text-sm">الحالة</TableHead>
              )}
              {visibleColumns.phone && (
                <TableHead className="font-bold text-sm">الهاتف</TableHead>
              )}
              {visibleColumns.updatedAt && (
                <TableHead
                  className="cursor-pointer select-none font-bold text-sm"
                  onClick={() => handleSort("updatedAt")}
                >
                  آخر تحديث {sortBy === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
              )}
              {visibleColumns.actions && (
                <TableHead className="w-[80px] font-bold text-sm">إجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {visibleColumns.fullName && <TableCell><Skeleton className="h-5 w-32" /></TableCell>}
                  {visibleColumns.caseNumber && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  {visibleColumns.status && <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>}
                  {visibleColumns.phone && <TableCell><Skeleton className="h-5 w-28" /></TableCell>}
                  {visibleColumns.updatedAt && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                  {visibleColumns.actions && <TableCell><Skeleton className="h-9 w-9 rounded-lg" /></TableCell>}
                </TableRow>
              ))
            ) : data?.clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Search className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-muted-foreground">
                        لم يتم العثور على عملاء
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {search || statusFilter !== "ALL" ? "جرب تغيير معايير البحث أو التصفية" : "لم يتم إضافة أي عميل بعد"}
                      </p>
                    </div>
                    {!search && statusFilter === "ALL" && (
                      <Link href="/clients/new">
                        <Button variant="default" size="sm" className="font-bold text-xs">
                          <PlusCircle className="h-4 w-4 ml-1" />
                          إضافة عميل جديد
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.clients.map((client, i) => (
                <TableRow
                  key={client.id}
                  className={`hover:bg-muted/40 border-b transition-colors cursor-pointer ${selectedIndex === i ? "bg-primary/5 border-primary/30 shadow-sm" : ""}`}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  aria-selected={selectedIndex === i}
                >
                  {visibleColumns.fullName && (
                    <TableCell className="font-bold text-base">{client.fullName}</TableCell>
                  )}
                  {visibleColumns.caseNumber && (
                    <TableCell className="font-mono font-semibold text-sm bg-muted/30 rounded px-2 py-1 inline-block">{client.caseNumber}</TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge className={`${statusColors[client.status]} font-semibold text-xs px-3 py-1`} variant="secondary">
                        {statusLabels[client.status]}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.phone && (
                    <TableCell className="font-medium text-sm">{client.phone}</TableCell>
                  )}
                  {visibleColumns.updatedAt && (
                    <TableCell className="font-medium text-sm">
                      {new Date(client.updatedAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="default" size="sm" className="h-8 px-3 font-bold text-xs">
                          <Eye className="h-3.5 w-3.5 ml-1" />
                          عرض
                        </Button>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {!loading && data && data.total > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-xl border-2 p-4 shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground order-2 sm:order-1">
            عرض {(page - 1) * ITEMS_PER_PAGE + 1} إلى{" "}
            {Math.min(page * ITEMS_PER_PAGE, data.total)} من {data.total} عميل
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="font-bold"
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              السابق
            </Button>
            <span className="text-sm font-bold px-3 py-1 bg-muted rounded-lg">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="font-bold"
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
