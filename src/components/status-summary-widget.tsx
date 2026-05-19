import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

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
  NEW_CLIENT: "bg-blue-500",
  GATHERING_DOCUMENTS: "bg-yellow-500",
  SUBMITTED: "bg-purple-500",
  INTERVIEW_SCHEDULED: "bg-indigo-500",
  WAITING_DECISION: "bg-orange-500",
  APPEAL: "bg-red-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-gray-500",
  CLOSED: "bg-slate-500",
};

export async function CasesByStatusWidget() {
  const counts = await prisma.client.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statusMap: Record<string, number> = {};
  for (const c of counts) {
    statusMap[c.status] = c._count.status;
  }

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart className="h-4 w-4" />
          القضايا حسب الحالة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = statusMap[key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[key]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
