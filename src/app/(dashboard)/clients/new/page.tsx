"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/actions";
import { ArrowRight, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { IdScanner } from "@/components/id-scanner";
import type { ExtractedData } from "@/components/id-scanner";

const DRAFT_KEY = "new-client-draft";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && formRef.current) {
      try {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
          const input = formRef.current?.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | null;
          if (input) input.value = value as string;
        });
        toast.info("تم استعادة المسودة المحفوظة", { duration: 2000 });
      } catch {}
    }
  }, []);

  const debouncedSave = useCallback((formData: Record<string, string>) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setDraftSaved(true);
    }, 1000);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    if (e.target.name && !["submit", "button"].includes(e.target.type)) {
      const form = e.currentTarget;
      const data: Record<string, string> = {};
      Array.from(form.elements).forEach((el) => {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        if (input.name) data[input.name] = input.value;
      });
      debouncedSave(data);
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    if (formRef.current) formRef.current.reset();
    setDraftSaved(false);
    toast.success("تم حذف المسودة");
  }

  function handleExtracted(data: ExtractedData) {
    const form = formRef.current;
    if (!form) return;

    const set = (name: string, value?: string) => {
      if (!value) return;
      const el = form.elements.namedItem(name) as HTMLInputElement | null;
      if (el) { el.value = value; el.dispatchEvent(new Event("input", { bubbles: true })); }
    };

    set("fullName", data.fullName);
    set("phone", data.phone);
    set("caseNumber", data.caseNumber);
    set("email", data.email);
    set("nationality", data.nationality);
    set("dateOfBirth", data.dateOfBirth);
    set("passportNumber", data.passportNumber);
    set("caseType", data.caseType);

    const filled = Object.values(data).filter(Boolean).length;
    if (filled > 0) {
      toast.success(`تم استخراج ${filled} حقل من البطاقة`);
    } else {
      toast.error("لم نتمكن من استخراج بيانات، يمكنك إدخالها يدوياً");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      localStorage.removeItem(DRAFT_KEY);
      toast.success("تم إضافة العميل بنجاح");
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">إضافة عميل جديد</h2>
            <p className="text-sm text-muted-foreground">أدخل بيانات العميل أدناه</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IdScanner onExtracted={handleExtracted} disabled={loading} />
          {draftSaved && (
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3" />
              تم الحفظ
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-medium text-destructive hover:text-destructive"
            onClick={clearDraft}
          >
            <Trash2 className="h-3.5 w-3.5 ml-1" />
            مسح المسودة
          </Button>
        </div>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b-2 bg-muted/20">
          <CardTitle className="text-lg font-black">بيانات العميل</CardTitle>
          <CardDescription>الحقول المطلوبة محددة بعلامة *</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} onSubmit={onSubmit} onChange={handleChange} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-bold text-sm">الاسم الكامل *</Label>
                <Input id="fullName" name="fullName" required placeholder="أحمد محمد" className="border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-sm">الهاتف *</Label>
                <Input id="phone" name="phone" required placeholder="+966-555-0100" className="border-2" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseNumber" className="font-bold text-sm">رقم القضية *</Label>
                <Input id="caseNumber" name="caseNumber" required placeholder="ASY-2024-001" className="border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-sm">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" placeholder="client@email.com" className="border-2" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nationality" className="font-bold text-sm">الجنسية</Label>
                <Input id="nationality" name="nationality" placeholder="الدولة" className="border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="font-bold text-sm">تاريخ الميلاد</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" className="border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber" className="font-bold text-sm">رقم جواز السفر</Label>
                <Input id="passportNumber" name="passportNumber" placeholder="اختياري" className="border-2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseType" className="font-bold text-sm">نوع القضية</Label>
              <Input id="caseType" name="caseType" placeholder="لجوء، استئناف، إلخ." className="border-2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-bold text-sm">ملاحظات</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="ملخص مختصر عن القضية..."
                rows={3}
                className="border-2"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="font-bold w-full sm:w-auto">إلغاء</Button>
              </Link>
              <Button type="submit" disabled={loading} className="font-bold w-full sm:w-auto">
                {loading ? "جاري الإضافة..." : "إضافة عميل"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
