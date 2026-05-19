"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { ClientStatus } from "@/lib/prisma";
import { updateClientStatus } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  NEW_CLIENT: "bg-blue-100 text-blue-800 border-2 border-blue-400 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600",
  GATHERING_DOCUMENTS: "bg-amber-100 text-amber-800 border-2 border-amber-400 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-600",
  SUBMITTED: "bg-purple-100 text-purple-800 border-2 border-purple-400 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-600",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800 border-2 border-indigo-400 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-600",
  WAITING_DECISION: "bg-orange-100 text-orange-800 border-2 border-orange-400 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-600",
  APPEAL: "bg-red-100 text-red-800 border-2 border-red-400 dark:bg-red-900 dark:text-red-200 dark:border-red-600",
  APPROVED: "bg-green-100 text-green-800 border-2 border-green-400 dark:bg-green-900 dark:text-green-200 dark:border-green-600",
  REJECTED: "bg-gray-100 text-gray-800 border-2 border-gray-400 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-600",
  CLOSED: "bg-slate-100 text-slate-800 border-2 border-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-600",
};

const statusOrder: ClientStatus[] = [
  "NEW_CLIENT",
  "GATHERING_DOCUMENTS",
  "SUBMITTED",
  "INTERVIEW_SCHEDULED",
  "WAITING_DECISION",
  "APPEAL",
  "APPROVED",
  "REJECTED",
  "CLOSED",
];

interface Client {
  id: string;
  status: ClientStatus;
}

export function StatusCard({ client }: { client: Client }) {
  const router = useRouter();

  async function handleStatusChange(value: string | null) {
    if (!value) return;
    const result = await updateClientStatus(client.id, value as ClientStatus);
    if (result.success) {
      toast.success("تم تحديث الحالة");
      router.refresh();
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-base font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flag className="h-5 w-5 text-primary" />
          </div>
          حالة القضية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Badge className={`${statusColors[client.status]} font-bold text-sm px-4 py-2`} variant="secondary">
          {statusLabels[client.status]}
        </Badge>

        <Select defaultValue={client.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="border-2 font-bold h-11">
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            {statusOrder.map((status) => (
              <SelectItem key={status} value={status} className="font-semibold">
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="pt-4 border-t-2">
          <div className="space-y-2.5">
            {statusOrder.map((status) => (
              <div key={status} className="flex items-center gap-3 text-sm">
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    client.status === status
                      ? "bg-primary border-primary shadow-md"
                      : "bg-background border-muted-foreground/40"
                  }`}
                />
                <span className={client.status === status ? "font-black" : "font-medium text-muted-foreground"}>
                  {statusLabels[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
