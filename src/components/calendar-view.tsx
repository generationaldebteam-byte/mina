"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  CalendarIcon,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast, isSameDay } from "date-fns";
import { arSA } from "date-fns/locale";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  INTERVIEW: "مقابلة",
  DOCUMENT_DEADLINE: "مستندات",
  APPOINTMENT: "موعد",
  APPEAL: "استئناف",
  FOLLOW_UP: "متابعة",
  COURT_DATE: "محكمة",
  OTHER: "أخرى",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  priority: string;
  status: string;
  clientName: string;
  caseNumber: string;
  clientId: string;
  description: string | null;
}

export function Calendar({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const endDay = monthEnd.getDay();
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startDay - i));
    return d;
  });
  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const d = new Date(monthEnd);
    d.setDate(d.getDate() + (i + 1));
    return d;
  });

  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(e.date, day));

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5" />
          {format(currentDate, "MMMM yyyy", { locale: arSA })}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>اليوم</Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {allDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`bg-background p-2 min-h-[80px] text-right transition-colors hover:bg-accent ${
                  !isCurrentMonth ? "opacity-40" : ""
                } ${isSelected ? "bg-accent" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${
                      isTodayDate
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => {
                    const isOverdue = isPast(event.date) && event.status === "PENDING";
                    return (
                      <div
                        key={event.id}
                        className={`text-[10px] truncate px-1 py-0.5 rounded ${
                          isOverdue
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                        title={`${event.title} - ${event.clientName}`}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 3} أخرى
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDate && selectedEvents.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">
              مهام {format(selectedDate, "d MMMM yyyy", { locale: arSA })}
            </h3>
            {selectedEvents.map((event) => {
              const isOverdue = isPast(event.date) && event.status === "PENDING";
              return (
                <Link
                  key={event.id}
                  href={`/clients/${event.clientId}`}
                >
                  <div
                    className={`rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer ${
                      isOverdue ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isOverdue ? "bg-red-500" : priorityColors[event.priority] || "bg-gray-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{event.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[event.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 mr-4">
                      <span className="text-xs text-muted-foreground">
                        {event.clientName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {event.caseNumber}
                      </span>
                      {isOverdue && (
                        <span className="text-xs text-red-500 flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          متأخر
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 mr-4">
                        {event.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
