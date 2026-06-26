"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { addCaseUpdate } from "@/lib/actions";
import { toast } from "sonner";

interface CaseUpdate {
  id: string;
  note: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

export function TimelineSection({
  clientId,
  updates,
}: {
  clientId: string;
  updates: CaseUpdate[];
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    const result = await addCaseUpdate(clientId, note);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم إضافة الملاحظة");
      setNote("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-lg font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          سجل القضية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row-reverse gap-2 p-3 rounded-xl border-2 bg-muted/20">
          <Button type="submit" disabled={loading || !note.trim()} className="w-full sm:w-auto sm:self-end shrink-0 font-bold">
            <PlusCircle className="h-4 w-4 ml-1" />
            {loading ? "جاري الإضافة..." : "إضافة"}
          </Button>
          <Textarea
            placeholder="أضف ملاحظة..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[60px] border-2 font-medium flex-1 max-h-[40vh] overflow-y-auto"
            rows={2}
          />
        </form>

        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-base font-bold text-muted-foreground">
                لا توجد تحديثات بعد
              </p>
              <p className="text-sm text-muted-foreground mt-1">أضف ملاحظة لبدء السجل</p>
            </div>
          ) : (
            updates.map((update, index) => (
              <div key={update.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-10 w-10 border-2 shadow-sm">
                    <AvatarFallback className="text-sm font-bold">
                      {update.createdBy.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {index < updates.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold">{update.createdBy.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {formatDistanceToNow(update.createdAt, { addSuffix: true, locale: arSA })}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed bg-muted/30 rounded-lg p-3 border">{update.note}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
