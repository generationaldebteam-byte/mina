"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, PlusCircle, Trash2, Pencil, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { format, isPast, isWithinInterval, addDays } from "date-fns";
import { arSA } from "date-fns/locale";
import { createTask, deleteTask, updateTaskStatus, updateTask } from "@/lib/actions";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  INTERVIEW: "مقابلة",
  DOCUMENT_DEADLINE: "موعد مستندات",
  APPOINTMENT: "موعد",
  APPEAL: "استئناف",
  FOLLOW_UP: "متابعة",
  COURT_DATE: "جلسة محكمة",
  OTHER: "أخرى",
};

const priorityLabels: Record<string, string> = {
  LOW: "منخفض",
  MEDIUM: "متوسط",
  HIGH: "عالي",
  URGENT: "عاجل",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  type: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function getTaskUrgency(task: Task) {
  if (task.status === "COMPLETED") return "completed";
  if (task.status === "MISSED") return "missed";
  if (isPast(task.dueDate)) return "overdue";
  if (isWithinInterval(task.dueDate, { start: new Date(), end: addDays(new Date(), 7) })) return "soon";
  return "normal";
}

export function TasksSection({ clientId, tasks }: { clientId: string; tasks: Task[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    formData.append("clientId", clientId);
    const result = await createTask(formData);
    if (result.error) toast.error(result.error);
    else { toast.success("تم إضافة الموعد"); router.refresh(); }
    setLoading(false);
    setOpen(false);
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-lg font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          المواعيد والمواعيد النهائية
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-border bg-background px-3 h-9 text-sm font-bold hover:bg-muted hover:text-foreground transition-all outline-none select-none gap-1.5">
            <PlusCircle className="h-4 w-4" />
            إضافة موعد
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold">إضافة موعد</DialogTitle>
              <DialogDescription>أضف موعداً أو تاريخاً مهماً.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold">العنوان *</Label>
                <Input id="title" name="title" required placeholder="مثال: موعد المقابلة" className="border-2 font-medium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="font-bold">تاريخ الاستحقاق *</Label>
                <Input id="dueDate" name="dueDate" type="date" required className="border-2 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="font-bold">النوع</Label>
                  <Select name="type" defaultValue="OTHER">
                    <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="font-medium">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="font-bold">الأولوية</Label>
                  <Select name="priority" defaultValue="MEDIUM">
                    <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="font-medium">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold">الوصف</Label>
                <Textarea id="description" name="description" rows={2} placeholder="تفاصيل اختيارية..." className="border-2 font-medium" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-bold">إلغاء</Button>
                <Button type="submit" disabled={loading} className="font-bold">{loading ? "جاري الإضافة..." : "إضافة موعد"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-base font-bold text-muted-foreground">لا توجد مواعيد محددة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((task) => {
              const urgency = getTaskUrgency(task);
              return <TaskRow key={task.id} task={task} urgency={urgency} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, urgency }: { task: Task; urgency: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleComplete() {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await updateTaskStatus(task.id, newStatus as any);
    router.refresh();
  }

  async function markMissed() {
    await updateTaskStatus(task.id, "MISSED");
    router.refresh();
  }

  async function handleEdit(formData: FormData) {
    setLoading(true);
    const result = await updateTask(task.id, formData);
    if (result.error) toast.error(result.error);
    else { toast.success("تم التحديث"); router.refresh(); }
    setLoading(false);
    setEditing(false);
  }

  async function handleDelete() {
    await deleteTask(task.id);
    toast.success("تم الحذف");
    router.refresh();
  }

  const urgencyStyles = {
    overdue: "border-r-4 border-r-red-500 bg-red-50 dark:bg-red-950/20",
    soon: "border-r-4 border-r-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
    completed: "border-r-4 border-r-green-500 bg-green-50 dark:bg-green-950/20",
    missed: "border-r-4 border-r-gray-500 bg-gray-50 dark:bg-gray-950/20",
    normal: "border-r-4 border-r-blue-500 bg-blue-50 dark:bg-blue-950/20",
  };

  const urgencyIcons = {
    overdue: <AlertTriangle className="h-5 w-5 text-red-500" />,
    soon: <Clock className="h-5 w-5 text-yellow-500" />,
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    missed: <AlertTriangle className="h-5 w-5 text-gray-500" />,
    normal: <Calendar className="h-5 w-5 text-blue-500" />,
  };

  if (editing) {
    return (
      <form action={handleEdit} className="border-2 rounded-xl p-4 space-y-3 bg-background">
        <Input name="title" defaultValue={task.title} required className="border-2 font-medium" />
        <Input name="dueDate" type="date" defaultValue={format(task.dueDate, "yyyy-MM-dd")} required className="border-2 font-medium" />
        <div className="grid grid-cols-2 gap-2">
          <Select name="type" defaultValue={task.type}>
            <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k} className="font-medium">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="priority" defaultValue={task.priority}>
            <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([k, v]) => (
                <SelectItem key={k} value={k} className="font-medium">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea name="description" defaultValue={task.description || ""} rows={2} className="border-2 font-medium" />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} className="font-bold">إلغاء</Button>
          <Button type="submit" size="sm" disabled={loading} className="font-bold">{loading ? "جاري الحفظ..." : "حفظ"}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${urgencyStyles[urgency as keyof typeof urgencyStyles]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button onClick={toggleComplete} className="mt-0.5 shrink-0">
            {urgencyIcons[urgency as keyof typeof urgencyIcons]}
          </button>
          <div className="min-w-0">
            <p className={`text-base font-bold ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </p>
            {task.description && <p className="text-sm text-muted-foreground mt-1 font-medium">{task.description}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm font-bold text-muted-foreground">{format(task.dueDate, "d MMM yyyy", { locale: arSA })}</span>
              <Badge variant="outline" className="font-bold text-xs px-2 py-0.5">{typeLabels[task.type]}</Badge>
              <div className={`h-2.5 w-2.5 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`} />
              <span className="text-xs font-bold">{priorityLabels[task.priority]}</span>
              {urgency === "overdue" && <Badge variant="destructive" className="font-bold text-xs px-2 py-0.5">متأخر</Badge>}
              {urgency === "soon" && <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold text-xs px-2 py-0.5">قريب</Badge>}
              {task.status === "MISSED" && <Badge variant="secondary" className="font-bold text-xs px-2 py-0.5">فات</Badge>}
              {task.status === "COMPLETED" && <Badge className="bg-green-100 text-green-800 border border-green-300 font-bold text-xs px-2 py-0.5">مكتمل</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="sm" className="h-8 w-8" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {task.status !== "COMPLETED" && (
            <Button variant="outline" size="sm" className="h-8 w-8" onClick={markMissed}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-destructive/30 bg-transparent px-2 h-8 w-8 text-destructive hover:bg-destructive/10 transition-all outline-none select-none">
              <Trash2 className="h-3.5 w-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold">حذف الموعد؟</AlertDialogTitle>
                <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-bold">إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-bold">حذف</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
