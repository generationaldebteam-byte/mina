"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, ScanLine } from "lucide-react";

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
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;

    setScanning(true);
    setProgress(0);

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("ara+eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    try {
      const result = await worker.recognize(file);
      const text = result.data.text;
      const fields = parseText(text);

      onExtracted(fields);
    } finally {
      await worker.terminate();
      setScanning(false);
      setProgress(0);
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
            {progress}%
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

function parseText(text: string): ExtractedData {
  const result: ExtractedData = {};
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const full = text.trim();

  const patterns: [RegExp, (m: RegExpMatchArray) => string, keyof ExtractedData][] = [
    [/(?:الاسم|اسم|Name|NAME|Full Name)[:\s]+(.+)/i, (m) => m[1].trim(), "fullName"],
    [/(?:الهاتف|Phone|PHONE|Tel|Mobile|رقم الجوال)[:\s]+([+\d\s\-()]+)/i, (m) => m[1].trim(), "phone"],
    [/(?:رقم القضية|Case|CASE|Case No|FILE)[:\s]*([A-Za-z0-9\-/]+)/i, (m) => m[1].trim(), "caseNumber"],
    [/(?:البريد|Email|EMAIL)[:\s]+([\w@.]+)/i, (m) => m[1].trim(), "email"],
    [/(?:الجنسية|Nationality|NATIONALITY)[:\s]+(.+)/i, (m) => m[1].trim(), "nationality"],
    [/(?:تاريخ الميلاد|DOB|Date of Birth|BIRTH)[:\s]*([\d/.\-]+)/i, (m) => normalizeDate(m[1]), "dateOfBirth"],
    [/(?:جواز|Passport|PASSPORT|ID No|ID)[:\s]+([A-Za-z0-9]+)/i, (m) => m[1].trim(), "passportNumber"],
    [/(?:نوع القضية|Case Type|نوع)[:\s]+(.+)/i, (m) => m[1].trim(), "caseType"],
  ];

  for (const [regex, extract, key] of patterns) {
    const match = full.match(regex);
    if (match) {
      const val = extract(match);
      if (val) result[key] = val;
    }
  }

  if (!result.fullName) {
    for (const line of lines) {
      if (/^[\u0600-\u06FF\s]{4,30}$/.test(line) && line.length >= 6) {
        result.fullName = line;
        break;
      }
    }
  }

  if (!result.nationality) {
    const nationMatch = full.match(/(?:جمهورية|دولة|Kingdom|Republic)[:\s]*([\u0600-\u06FF\s]{3,30})/i);
    if (nationMatch) result.nationality = nationMatch[1].trim();
  }

  if (!result.phone) {
    const phoneMatch = full.match(/(?:05|966|\+966)[0-9\s\-]{7,12}/);
    if (phoneMatch) result.phone = phoneMatch[0].trim();
  }

  if (!result.caseNumber) {
    const cnMatch = full.match(/[A-Z]{3,4}[\-/]?\d{4}[\-/]?\d{1,4}/);
    if (cnMatch) result.caseNumber = cnMatch[0].trim();
  }

  if (!result.dateOfBirth) {
    const dobMatch = full.match(/\b(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})\b/);
    if (dobMatch) result.dateOfBirth = normalizeDate(`${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}`);
  }

  return result;
}

function normalizeDate(dateStr: string): string {
  const parts = dateStr.split(/[\/.\-]/).filter(Boolean);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const p = parts[0].length === 4 ? parts : [parts[2], parts[1], parts[0]];
      return `${p[0]}-${p[1].padStart(2, "0")}-${p[2].padStart(2, "0")}`;
    }
  }
  return dateStr;
}
