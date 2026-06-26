"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ExtractedData {
  fullName?: string;
  phone?: string;
  caseNumber?: string;
  email?: string;
  nationality?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  caseType?: string;
}

interface Props {
  onExtracted: (data: ExtractedData) => void;
  disabled?: boolean;
}

export function IdScanner({ onExtracted, disabled }: Props) {
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;

    setScanning(true);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/scan-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "فشل المسح");
      }

      onExtracted(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل المسح";
      toast.error(message);
      onExtracted({});
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || scanning}
        onClick={() => fileRef.current?.click()}
        className="gap-1.5 font-bold text-xs h-8"
      >
        {scanning ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            جاري المسح...
          </>
        ) : (
          <>
            <ScanLine className="h-3.5 w-3.5" />
            مسح البطاقة
          </>
        )}
      </Button>
    </>
  );
}
