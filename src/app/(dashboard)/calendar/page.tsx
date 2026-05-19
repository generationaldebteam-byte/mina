import { prisma } from "@/lib/db";
import { Calendar } from "@/components/calendar-view";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">التقويم</h2>
          <p className="text-muted-foreground">مواعيد ومهام القضايا</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(typeLabels).map(([key, label]) => (
          <Badge key={key} variant="outline" className="text-xs">
            {label}
          </Badge>
        ))}
      </div>

      <Calendar events={events} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">المهام القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === "PENDING")
              .slice(0, 10)
              .map((task) => (
                <Link
                  key={task.id}
                  href={`/clients/${task.client.id}`}
                >
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.client.fullName} — {task.client.caseNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[task.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            {tasks.filter((t) => t.status === "PENDING").length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                لا توجد مهام قادمة
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
