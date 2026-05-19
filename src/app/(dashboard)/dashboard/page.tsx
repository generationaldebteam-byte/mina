import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Hourglass, CheckCircle } from "lucide-react";
import { ClientTable } from "@/components/client-table";
import { UrgentCasesWidget } from "@/components/urgent-cases-widget";
import { RecentClientsWidget } from "@/components/recent-clients-widget";
import { CasesByStatusWidget } from "@/components/status-summary-widget";
import { ClientStatus } from "@/lib/prisma";

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي العملاء" value={stats.total} icon={Users} description="جميع العملاء في النظام" color="blue" />
        <StatCard title="القضايا النشطة" value={stats.active} icon={Clock} description="قيد العمل حالياً" color="amber" />
        <StatCard title="بانتظار القرار" value={stats.waiting} icon={Hourglass} description="قيد المراجعة" color="orange" />
        <StatCard title="القضايا المغلقة" value={stats.closed} icon={CheckCircle} description="تم حلها أو إغلاقها" color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrgentCasesWidget />
        </div>
        <CasesByStatusWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClientTable />
        </div>
        <RecentClientsWidget />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    amber: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    orange: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    green: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
    green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
  };

  return (
    <Card className={`border-2 shadow-md ${colorMap[color]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">{value}</div>
        <p className="text-xs font-medium mt-1 opacity-70">{description}</p>
      </CardContent>
    </Card>
  );
}
