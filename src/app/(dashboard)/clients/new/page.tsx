"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/actions";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم إضافة العميل بنجاح");
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">إضافة عميل جديد</h2>
          <p className="text-muted-foreground">أدخل بيانات العميل أدناه.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات العميل</CardTitle>
          <CardDescription>الحقول المطلوبة محددة بعلامة *</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input id="fullName" name="fullName" required placeholder="أحمد محمد" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف *</Label>
                <Input id="phone" name="phone" required placeholder="+966-555-0100" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">رقم القضية *</Label>
                <Input id="caseNumber" name="caseNumber" required placeholder="ASY-2024-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" placeholder="client@email.com" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nationality">الجنسية</Label>
                <Input id="nationality" name="nationality" placeholder="الدولة" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber">رقم جواز السفر</Label>
                <Input id="passportNumber" name="passportNumber" placeholder="اختياري" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseType">نوع القضية</Label>
              <Input id="caseType" name="caseType" placeholder="لجوء، استئناف، إلخ." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="ملخص مختصر عن القضية..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard">
                <Button type="button" variant="outline">إلغاء</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الإضافة..." : "إضافة عميل"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
