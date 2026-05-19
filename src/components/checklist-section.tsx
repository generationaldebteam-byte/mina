"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CheckSquare, PlusCircle, Trash2, FileText } from "lucide-react";
import { toggleChecklistItem, addChecklistItem, deleteChecklistItem } from "@/lib/actions";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

export function ChecklistSection({ clientId, items }: { clientId: string; items: ChecklistItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle(itemId: string) {
    await toggleChecklistItem(itemId);
    router.refresh();
  }

  async function handleAdd(formData: FormData) {
    setLoading(true);
    formData.append("clientId", clientId);
    await addChecklistItem(formData);
    toast.success("تم إضافة العنصر");
    router.refresh();
    setLoading(false);
    setOpen(false);
  }

  async function handleDelete(itemId: string) {
    await deleteChecklistItem(itemId);
    toast.success("تم إزالة العنصر");
    router.refresh();
  }

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const missing = items.filter((i) => i.required && !i.completed);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          قائمة المستندات
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground transition-all outline-none select-none gap-1.5">
            <PlusCircle className="h-3.5 w-3.5" />
            إضافة
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عنصر للقائمة</DialogTitle>
              <DialogDescription>أضف مستنداً أو عنصراً للقائمة.</DialogDescription>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input id="title" name="title" required placeholder="مثال: شهادة الميلاد" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="required" name="required" defaultChecked />
                <Label htmlFor="required">مطلوب</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={loading}>{loading ? "جاري الإضافة..." : "إضافة"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {completed} / {total} مستند مكتمل
            </span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {missing.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
              {missing.length} مستند مطلوب {missing.length > 1 ? "ناقص" : "ناقص"}
            </p>
            <ul className="text-xs text-red-600 dark:text-red-300 space-y-0.5">
              {missing.map((item) => (
                <li key={item.id}>• {item.title}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1">
          {items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">لا توجد عناصر في القائمة.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-2.5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      item.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {item.completed && <FileText className="h-3 w-3" />}
                  </button>
                  <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </span>
                  {item.required && !item.completed && (
                    <span className="text-xs text-red-500 shrink-0">مطلوب</span>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent px-2 h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-all outline-none select-none">
                    <Trash2 className="h-3 w-3" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>إزالة العنصر؟</AlertDialogTitle>
                      <AlertDialogDescription>هل تريد إزالة "{item.title}" من القائمة؟</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">إزالة</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
