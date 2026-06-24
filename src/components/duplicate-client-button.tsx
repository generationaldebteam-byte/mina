"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Loader2 } from "lucide-react";
import { duplicateClient } from "@/lib/actions";
import { toast } from "sonner";

export function DuplicateClientButton({
  clientId,
  clientName,
  caseNumber,
}: {
  clientId: string;
  clientName: string;
  caseNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(`${clientName} (نسخة)`);
  const [newCaseNumber, setNewCaseNumber] = useState("");

  async function handleDuplicate() {
    if (!name.trim() || !newCaseNumber.trim()) {
      toast.error("يرجى إدخال الاسم ورقم القضية");
      return;
    }
    setLoading(true);
    const result = await duplicateClient(clientId, name.trim(), newCaseNumber.trim());
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم نسخ القضية بنجاح");
      setOpen(false);
      router.push(`/clients/${result.clientId}`);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-bold text-xs h-8">
          <Copy className="h-3.5 w-3.5 ml-1" />
          نسخ القضية
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black">نسخ القضية</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="dup-name" className="font-bold text-sm">الاسم الكامل</Label>
            <Input id="dup-name" value={name} onChange={(e) => setName(e.target.value)} className="border-2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dup-case" className="font-bold text-sm">رقم القضية الجديد *</Label>
            <Input
              id="dup-case"
              value={newCaseNumber}
              onChange={(e) => setNewCaseNumber(e.target.value)}
              placeholder={`نسخة من ${caseNumber}`}
              className="border-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="font-bold">إلغاء</Button>
            <Button onClick={handleDuplicate} disabled={loading} className="font-bold">
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              {loading ? "جاري النسخ..." : "تأكيد النسخ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
