"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User, Mail, Phone, Globe, Calendar, Hash, FileText } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { ClientStatus } from "@/lib/prisma";
import { updateClient, deleteClient } from "@/lib/actions";
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
  NEW_CLIENT: "bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  GATHERING_DOCUMENTS: "bg-amber-100 text-amber-800 border-2 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700",
  SUBMITTED: "bg-purple-100 text-purple-800 border-2 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800 border-2 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700",
  WAITING_DECISION: "bg-orange-100 text-orange-800 border-2 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  APPEAL: "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  APPROVED: "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  REJECTED: "bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
  CLOSED: "bg-slate-100 text-slate-800 border-2 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
};

interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  nationality: string | null;
  dateOfBirth: Date | null;
  passportNumber: string | null;
  caseNumber: string;
  status: ClientStatus;
  caseType: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ClientInfoCard({ client }: { client: Client }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEdit(formData: FormData) {
    setLoading(true);
    const result = await updateClient(client.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم تحديث بيانات العميل");
      setEditOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete() {
    const result = await deleteClient(client.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم حذف العميل");
      router.push("/dashboard");
    }
  }

  const infoFields = [
    { icon: Phone, label: "الهاتف", value: client.phone, color: "text-blue-600" },
    { icon: Mail, label: "البريد الإلكتروني", value: client.email, color: "text-purple-600" },
    { icon: Globe, label: "الجنسية", value: client.nationality, color: "text-green-600" },
    {
      icon: Calendar,
      label: "تاريخ الميلاد",
      value: client.dateOfBirth ? format(client.dateOfBirth, "d MMMM yyyy", { locale: arSA }) : null,
      color: "text-amber-600",
    },
    { icon: Hash, label: "رقم جواز السفر", value: client.passportNumber, color: "text-indigo-600" },
    { icon: FileText, label: "نوع القضية", value: client.caseType, color: "text-orange-600" },
  ];

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-lg font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          بيانات العميل
        </CardTitle>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-border bg-background px-3 h-9 text-sm font-bold hover:bg-muted hover:text-foreground transition-all outline-none select-none gap-1.5">
              <Pencil className="h-4 w-4" />
              تعديل
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">تعديل بيانات العميل</DialogTitle>
                <DialogDescription>تحديث معلومات العميل.</DialogDescription>
              </DialogHeader>
              <form action={handleEdit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-bold">الاسم الكامل *</Label>
                    <Input id="fullName" name="fullName" defaultValue={client.fullName} required className="border-2 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold">الهاتف *</Label>
                    <Input id="phone" name="phone" defaultValue={client.phone} required className="border-2 font-medium" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber" className="font-bold">رقم القضية *</Label>
                    <Input id="caseNumber" name="caseNumber" defaultValue={client.caseNumber} required className="border-2 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold">البريد الإلكتروني</Label>
                    <Input id="email" name="email" type="email" defaultValue={client.email || ""} className="border-2 font-medium" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="font-bold">الجنسية</Label>
                    <Input id="nationality" name="nationality" defaultValue={client.nationality || ""} className="border-2 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="font-bold">تاريخ الميلاد</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      defaultValue={client.dateOfBirth ? format(client.dateOfBirth, "yyyy-MM-dd") : ""}
                      className="border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber" className="font-bold">رقم جواز السفر</Label>
                    <Input id="passportNumber" name="passportNumber" defaultValue={client.passportNumber || ""} className="border-2 font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseType" className="font-bold">نوع القضية</Label>
                  <Input id="caseType" name="caseType" defaultValue={client.caseType || ""} className="border-2 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-bold">ملاحظات</Label>
                  <Textarea id="notes" name="notes" defaultValue={client.notes || ""} rows={3} className="border-2 font-medium" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="font-bold">إلغاء</Button>
                  <Button type="submit" disabled={loading} className="font-bold">{loading ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-destructive/30 bg-destructive/10 text-destructive px-3 h-9 text-sm font-bold hover:bg-destructive/20 transition-all outline-none select-none gap-1.5">
              <Trash2 className="h-4 w-4" />
              حذف
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold">حذف العميل</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف {client.fullName} وجميع السجلات المرتبطة بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-bold">إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-bold">حذف</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {infoFields.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
              <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-base font-bold mt-0.5">{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">ملاحظات</p>
            <p className="text-sm font-medium bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">{client.notes}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t-2 flex items-center gap-3">
          <Badge className={`${statusColors[client.status]} font-bold text-sm px-4 py-1.5`} variant="secondary">
            {statusLabels[client.status]}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            تم الإنشاء في {format(client.createdAt, "d MMM yyyy", { locale: arSA })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
