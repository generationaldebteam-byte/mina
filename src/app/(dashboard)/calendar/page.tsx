import { prisma } from "@/lib/db";
import { Calendar } from "@/components/calendar-view";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  INTERVIEW: "مقابلة",
  DOCUMENT_DEADLINE: "موعد مستندات",
  APPOINTMENT: "موعد",
  APPEAL: "استئناف",
  FOLLOW_UP: "متابعة",
  COURT_DATE: "جلسة محكمة",
  OTHER: "أخرى",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default async function CalendarPage() {
  const tasks = await prisma.task.findMany({
    where: { status: { notIn: ["COMPLETED"] } },
    include: {
      client: { select: { id: true, fullName: true, caseNumber: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    date: task.dueDate,
    type: task.type,
    priority: task.priority,
    status: task.status,
    clientName: task.client.fullName,
    caseNumber: task.client.caseNumber,
    clientId: task.client.id,
    description: task.description,
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="p-2 md:p-3 rounded-xl bg-primary/10">
          <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black">التقويم</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">مواعيد ومهام القضايا</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(typeLabels).map(([key, label]) => (
          <Badge key={key} variant="outline" className="text-[10px] md:text-xs">
            {label}
          </Badge>
        ))}
      </div>

      <Calendar events={events} />

      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b-2 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base font-black">
            <CalendarIcon className="h-4 w-4" />
            المهام القادمة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === "PENDING")
              .slice(0, 10)
              .map((task) => (
                <Link
                  key={task.id}
                  href={`/clients/${task.client.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-xl border-2 p-3 hover:bg-accent active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.client.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0 mr-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        {typeLabels[task.type]}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            {tasks.filter((t) => t.status === "PENDING").length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">لا توجد مهام قادمة</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
