"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function WhatsAppSendDialog({
  clientId,
  clientName,
  phone,
}: {
  clientId: string;
  clientName: string;
  phone: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "فشل الإرسال");
      } else {
        toast.success("تم إرسال الرسالة عبر واتساب");
        setMessage("");
        setOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    }
    setLoading(false);
  }

  const quickMessages = [
    "السلام عليكم، هذه متابعة من مكتب المحاماة بخصوص قضيتكم",
    "نود إعلامكم بوجود موعد جديد. يرجى التواصل معنا",
    "تم تحديث ملف القضية. يرجى مراجعة المستندات المطلوبة",
    "نشكركم على تواصلكم. سنعود إليكم بأقرب فرصة",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="font-bold text-xs h-8">
          <MessageSquare className="h-3.5 w-3.5 ml-1" />
          واتساب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            إرسال رسالة واتساب
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="bg-muted/40 p-3 rounded-lg border-2">
            <p className="text-sm font-bold">{clientName}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1" dir="ltr">{phone}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessage(msg)}
                className="text-xs bg-muted hover:bg-muted/80 px-2.5 py-1.5 rounded-lg border transition-colors text-right leading-relaxed"
              >
                {msg}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="اكتب رسالتك..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] border-2 font-medium"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} className="font-bold" disabled={loading}>
              إلغاء
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="font-bold bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              {loading ? "جاري الإرسال..." : (
                <>
                  <Send className="h-4 w-4 ml-1" />
                  إرسال
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
