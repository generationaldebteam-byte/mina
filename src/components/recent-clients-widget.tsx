import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  NEW_CLIENT: "جديد",
  GATHERING_DOCUMENTS: "جمع مستندات",
  SUBMITTED: "تم التقديم",
  INTERVIEW_SCHEDULED: "مقابلة",
  WAITING_DECISION: "بانتظار",
  APPEAL: "استئناف",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
  CLOSED: "مغلق",
};

const statusColors: Record<string, string> = {
  NEW_CLIENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  GATHERING_DOCUMENTS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  SUBMITTED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  WAITING_DECISION: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  APPEAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  CLOSED: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
};

export async function RecentClientsWidget() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, fullName: true, caseNumber: true, status: true, updatedAt: true },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          آخر التحديثات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <div className="rounded-lg border p-2.5 hover:bg-accent cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{client.fullName}</p>
                  <Badge className={statusColors[client.status]} variant="secondary">
                    {statusLabels[client.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">{client.caseNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(client.updatedAt, { addSuffix: true, locale: arSA })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
