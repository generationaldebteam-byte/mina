"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Eye, Upload, Loader2, X, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  uploadedBy: {
    name: string;
  };
}

export function DocumentsSection({
  clientId,
  documents,
  isAdmin,
}: {
  clientId: string;
  documents: Document[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadDocument(clientId, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم رفع المستند");
      setSelectedFile(null);
      router.refresh();
    }
    setUploading(false);
  }

  async function handleDelete(docId: string) {
    const result = await deleteDocument(docId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم حذف المستند");
      router.refresh();
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const fileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-lg font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          المستندات
        </CardTitle>
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="font-bold text-xs h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 ml-1" />
            رفع مستند
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-200",
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/20",
            selectedFile && "border-primary/50 bg-primary/5"
          )}
        >
          {!selectedFile ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  dragOver ? "bg-primary/20" : "bg-muted"
                )}>
                  <Upload className={cn(
                    "h-6 w-6 transition-colors",
                    dragOver ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
              </div>
              <p className="text-sm font-bold">
                اسحب وأفلت الملف هنا أو <button onClick={() => fileInputRef.current?.click()} className="text-primary underline underline-offset-2 hover:text-primary/80">اختر ملف</button>
              </p>
              <p className="text-xs text-muted-foreground">PDF, PNG, JPG - حد أقصى 10 ميجابايت</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{fileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="font-bold text-xs h-8"
                  disabled={uploading}
                  onClick={() => handleUpload(selectedFile)}
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 ml-1" />
                  )}
                  {uploading ? "جاري الرفع..." : "تأكيد الرفع"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={uploading}
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-base font-bold text-muted-foreground">
              لم يتم رفع أي مستندات بعد
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              اسحب وأفلت الملفات أعلاه لبدء الرفع
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border-2 p-3 md:p-4 hover:bg-muted/30 transition-all hover:border-primary/30 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 md:p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 shrink-0">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{doc.fileName}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      {doc.uploadedBy.name} · {formatDistanceToNow(doc.createdAt, { addSuffix: true, locale: arSA })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="عرض">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href={doc.fileUrl} download={doc.fileName}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="تحميل">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(doc.id)}
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
