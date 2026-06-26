import { prisma } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Hourglass, CheckCircle } from "lucide-react";
import { ClientTable } from "@/components/client-table";
import { RecentClientsWidget } from "@/components/recent-clients-widget";
import { CasesByStatusWidget } from "@/components/status-summary-widget";
import { DeadlinesWidget } from "@/components/deadlines-widget";
import { ClientStatus } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const total = await prisma.client.count();
  const active = await prisma.client.count({
    where: { status: { notIn: [ClientStatus.APPROVED, ClientStatus.REJECTED, ClientStatus.CLOSED] } },
  });
  const waiting = await prisma.client.count({ where: { status: ClientStatus.WAITING_DECISION } });
  const closed = await prisma.client.count({
    where: { status: { in: [ClientStatus.APPROVED, ClientStatus.REJECTED, ClientStatus.CLOSED] } },
  });

  return { total, active, waiting, closed };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black">لوحة التحكم</h2>
        <p className="text-sm text-muted-foreground mt-1">نظرة عامة على جميع القضايا</p>
      </div>
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي العملاء" value={stats.total} icon={Users} description="جميع العملاء في النظام" color="blue" href="/clients" />
        <StatCard title="القضايا النشطة" value={stats.active} icon={Clock} description="قيد العمل حالياً" color="amber" href="/clients?status=active" />
        <StatCard title="بانتظار القرار" value={stats.waiting} icon={Hourglass} description="قيد المراجعة" color="orange" href="/clients?status=WAITING_DECISION" />
        <StatCard title="القضايا المغلقة" value={stats.closed} icon={CheckCircle} description="تم حلها أو إغلاقها" color="green" href="/clients?status=closed" />
      </div>

      <Suspense fallback={<WidgetFallback lines={3} />}>
        <div className="grid gap-3 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DeadlinesWidget />
          </div>
          <CasesByStatusWidget />
        </div>
      </Suspense>

      <Suspense fallback={<WidgetFallback lines={5} />}>
        <div className="grid gap-3 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ClientTable />
          </div>
          <RecentClientsWidget />
        </div>
      </Suspense>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  href: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50/80 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    amber: "bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    orange: "bg-orange-50/80 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    green: "bg-green-50/80 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
    green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
  };

  return (
    <Link href={href} className="block">
      <Card className={`border-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] ${colorMap[color]}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
          <CardTitle className="text-[11px] md:text-sm font-bold">{title}</CardTitle>
          <div className={`p-1.5 md:p-2 rounded-lg ${iconColorMap[color]}`}>
            <Icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-3xl font-black">{value}</div>
          <p className="text-[10px] md:text-xs font-medium mt-0.5 md:mt-1 opacity-70">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function WidgetFallback({ lines }: { lines: number }) {
  return (
    <div className="animate-pulse grid gap-3 md:gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl border-2 p-4 space-y-3">
          {[...Array(lines)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-muted" />
              <div className="flex-1 h-4 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border-2 p-4 space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
