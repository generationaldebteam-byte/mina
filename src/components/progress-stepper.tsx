"use client";

import { ClientStatus } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Check, Circle, ChevronLeft } from "lucide-react";

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

const statusSteps: ClientStatus[] = [
  ClientStatus.NEW_CLIENT,
  ClientStatus.GATHERING_DOCUMENTS,
  ClientStatus.SUBMITTED,
  ClientStatus.INTERVIEW_SCHEDULED,
  ClientStatus.WAITING_DECISION,
  ClientStatus.APPEAL,
];

const terminalStatuses: ClientStatus[] = [ClientStatus.APPROVED, ClientStatus.REJECTED, ClientStatus.CLOSED];

export function ProgressStepper({ currentStatus }: { currentStatus: ClientStatus }) {
  if (terminalStatuses.some((s) => s === currentStatus)) {
    return (
      <div className="flex gap-2">
        {terminalStatuses.map((s) => {
          const isActive = s === currentStatus;
          const colors: Record<ClientStatus, string> = {
            [ClientStatus.APPROVED]: "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300",
            [ClientStatus.REJECTED]: "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300",
            [ClientStatus.CLOSED]: "border-slate-500 bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300",
            [ClientStatus.NEW_CLIENT]: "",
            [ClientStatus.GATHERING_DOCUMENTS]: "",
            [ClientStatus.SUBMITTED]: "",
            [ClientStatus.INTERVIEW_SCHEDULED]: "",
            [ClientStatus.WAITING_DECISION]: "",
            [ClientStatus.APPEAL]: "",
          };
          return (
            <div
              key={s}
              className={cn(
                "flex-1 rounded-xl border-2 p-3 text-center transition-all",
                isActive ? "shadow-md scale-105" : "opacity-50",
                colors[s]
              )}
            >
              <div className="text-sm font-bold">{statusLabels[s]}</div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentIndex = statusSteps.indexOf(currentStatus);

  return (
    <div className="relative">
      <div className="flex items-center overflow-x-auto gap-0 pb-2">
        {statusSteps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isUpcoming = i > currentIndex;

          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0",
                    isCompleted && "bg-primary border-primary text-primary-foreground shadow-md",
                    isCurrent && "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 scale-110",
                    isUpcoming && "border-muted-foreground/30 bg-muted/50 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Circle className={cn("h-2.5 w-2.5 md:h-3 md:w-3 fill-current", isCurrent && "fill-primary")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] md:text-xs font-bold text-center leading-tight max-w-20 md:max-w-24",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    isUpcoming && "text-muted-foreground/50"
                  )}
                >
                  {statusLabels[step]}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 md:mx-2 rounded-full transition-all duration-500",
                    i < currentIndex ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
