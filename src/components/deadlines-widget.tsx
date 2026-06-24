import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export async function DeadlinesWidget() {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const urgentTasks = await prisma.task.findMany({
    where: {
      status: "PENDING",
      dueDate: { lte: sevenDays },
    },
    orderBy: { dueDate: "asc" },
    take: 10,
    include: {
      client: { select: { id: true, fullName: true, caseNumber: true } },
    },
  });

  const overdue = urgentTasks.filter((t) => new Date(t.dueDate) < now);
  const upcoming = urgentTasks.filter((t) => new Date(t.dueDate) >= now);

  if (urgentTasks.length === 0) {
    return (
      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 bg-muted/20 py-3">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            المواعيد الهامة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-8 w-8 mx-auto text-green-500/50 mb-2" />
          <p className="text-sm font-bold text-muted-foreground">لا توجد مواعيد مستحقة هذا الأسبوع</p>
          <p className="text-xs text-muted-foreground mt-1">كل القضايا في مسارها الصحيح</p>
        </CardContent>
      </Card>
    );
  }

  function timeLeft(date: Date) {
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `متأخر بـ ${Math.abs(days)} يوم`;
    if (days === 0) return "اليوم";
    if (days === 1) return "غداً";
    return `${days} أيام`;
  }

  return (
    <Card className="border-2 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 bg-muted/20 py-3">
        <CardTitle className="flex items-center gap-2 text-base font-black">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          المواعيد الهامة
        </CardTitle>
        <Badge variant="outline" className="font-bold text-xs">
          {urgentTasks.length} موعد
        </Badge>
      </CardHeader>
      <CardContent className="p-2">
        {overdue.length > 0 && (
          <div className="px-2 pt-2 pb-1">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" />
              متأخرة
            </p>
          </div>
        )}
        {overdue.map((task) => (
          <Link
            key={task.id}
            href={`/clients/${task.client.id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/30 shrink-0">
              <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.client.fullName} · {task.client.caseNumber}</p>
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">{timeLeft(task.dueDate)}</span>
          </Link>
        ))}

        {upcoming.length > 0 && overdue.length > 0 && (
          <div className="border-t-2 my-1" />
        )}

        {upcoming.length > 0 && (
          <div className="px-2 pt-2 pb-1">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              قادمة
            </p>
          </div>
        )}
        {upcoming.map((task) => (
          <Link
            key={task.id}
            href={`/clients/${task.client.id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 shrink-0">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.client.fullName} · {task.client.caseNumber}</p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">{timeLeft(task.dueDate)}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
