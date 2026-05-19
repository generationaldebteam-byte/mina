import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import { format, isPast, isWithinInterval, addDays } from "date-fns";
import { arSA } from "date-fns/locale";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  INTERVIEW: "مقابلة",
  DOCUMENT_DEADLINE: "موعد مستندات",
  APPOINTMENT: "موعد",
  APPEAL: "استئناف",
  FOLLOW_UP: "متابعة",
  COURT_DATE: "جلسة محكمة",
  OTHER: "أخرى",
};

export async function UrgentCasesWidget() {
  const now = new Date();
  const weekFromNow = addDays(now, 7);

  const overdueTasks = await prisma.task.findMany({
    where: { status: "PENDING", dueDate: { lt: now } },
    include: { client: { select: { id: true, fullName: true, caseNumber: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const upcomingTasks = await prisma.task.findMany({
    where: { status: "PENDING", dueDate: { gte: now, lte: weekFromNow } },
    include: { client: { select: { id: true, fullName: true, caseNumber: true } } },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  if (overdueTasks.length === 0 && upcomingTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            أولويات اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">لا توجد مواعيد عاجلة.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          أولويات اليوم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueTasks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              متأخر ({overdueTasks.length})
            </p>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <Link key={task.id} href={`/clients/${task.client.id}`}>
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-2.5 hover:bg-red-100 dark:hover:bg-red-950/40 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge variant="destructive" className="text-xs">متأخر</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.client.fullName}</span>
                      <span className="text-xs text-muted-foreground font-mono">{task.client.caseNumber}</span>
                      <span className="text-xs text-red-600 dark:text-red-400">{format(task.dueDate, "d MMM", { locale: arSA })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              يستحق هذا الأسبوع ({upcomingTasks.length})
            </p>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <Link key={task.id} href={`/clients/${task.client.id}`}>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 p-2.5 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                        {typeLabels[task.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.client.fullName}</span>
                      <span className="text-xs text-muted-foreground font-mono">{task.client.caseNumber}</span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">{format(task.dueDate, "d MMM", { locale: arSA })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
