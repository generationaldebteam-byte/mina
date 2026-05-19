"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Phone, MessageSquare, Mail, Building, FileText, Repeat, PlusCircle, Trash2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { addInteraction, deleteInteraction } from "@/lib/actions";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  PHONE_CALL: "مكالمة هاتفية",
  WHATSAPP: "واتساب",
  EMAIL: "بريد إلكتروني",
  OFFICE_VISIT: "زيارة المكتب",
  DOCUMENT_RECEIVED: "استلام مستندات",
  FOLLOW_UP: "متابعة",
  OTHER: "أخرى",
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PHONE_CALL: Phone,
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  OFFICE_VISIT: Building,
  DOCUMENT_RECEIVED: FileText,
  FOLLOW_UP: Repeat,
  OTHER: MoreHorizontal,
};

interface Interaction {
  id: string;
  type: string;
  note: string;
  createdAt: Date;
  createdBy: { name: string };
}

export function InteractionsSection({ clientId, interactions }: { clientId: string; interactions: Interaction[] }) {
  const router = useRouter();
  const [type, setType] = useState("OTHER");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("clientId", clientId);
    formData.append("type", type);
    formData.append("note", note);

    const result = await addInteraction(formData);
    if (result.error) toast.error(result.error);
    else { toast.success("تم تسجيل التفاعل"); setNote(""); router.refresh(); }
    setLoading(false);
  }

  function handleTypeChange(value: string | null) {
    if (value) setType(value);
  }

  async function handleDelete(id: string) {
    await deleteInteraction(id);
    toast.success("تم الحذف");
    router.refresh();
  }

  const quickActions = [
    { type: "PHONE_CALL", label: "اتصال — بدون رد" },
    { type: "WHATSAPP", label: "مستندات عبر واتساب" },
    { type: "OFFICE_VISIT", label: "زيارة مكتب" },
    { type: "FOLLOW_UP", label: "متابعة مطلوبة" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          سجل التفاعلات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="سجّل تفاعلاً..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[60px] flex-1"
              rows={2}
            />
            <Button type="submit" disabled={loading || !note.trim()} className="self-end shrink-0">
              <PlusCircle className="h-4 w-4 ml-1" />
              تسجيل
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {quickActions.map((qa) => (
              <Button
                key={qa.type}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => { setType(qa.type); setNote(qa.label); }}
              >
                {qa.label}
              </Button>
            ))}
          </div>
        </form>

        <div className="space-y-4">
          {interactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">لم يتم تسجيل أي تفاعلات بعد.</p>
          ) : (
            interactions.map((interaction, index) => {
              const Icon = typeIcons[interaction.type] || MoreHorizontal;
              return (
                <div key={interaction.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {index < interactions.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{interaction.createdBy.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(interaction.createdAt, { addSuffix: true, locale: arSA })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{typeLabels[interaction.type]}</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent px-2 h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground transition-all outline-none select-none">
                            <Trash2 className="h-3 w-3" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف التفاعل؟</AlertDialogTitle>
                              <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(interaction.id)} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{interaction.note}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
