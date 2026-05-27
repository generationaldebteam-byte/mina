"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Eye, Upload, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/lib/actions";

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
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(formData: FormData) {
    setUploading(true);
    const result = await uploadDocument(clientId, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم رفع المستند");
      formRef.current?.reset();
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

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b-2 bg-muted/20">
        <CardTitle className="flex items-center gap-3 text-lg font-black">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          المستندات
        </CardTitle>
        <div className="shrink-0 max-w-[200px] sm:max-w-none">
          <form ref={formRef} action={handleUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="file"
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              className="text-xs sm:text-sm file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors file:active:scale-95"
              disabled={uploading}
            />
            <Button type="submit" disabled={uploading} size="sm" className="font-bold text-xs h-9 shrink-0">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "جاري الرفع..." : "رفع"}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-base font-bold text-muted-foreground">
              لم يتم رفع أي مستندات بعد
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border-2 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{doc.fileName}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {doc.uploadedBy.name} · {formatDistanceToNow(doc.createdAt, { addSuffix: true, locale: arSA })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8 px-2 font-bold text-xs">
                      <Eye className="h-3.5 w-3.5 ml-1" />
                      عرض
                    </Button>
                  </a>
                  <a href={doc.fileUrl} download={doc.fileName}>
                    <Button variant="outline" size="sm" className="h-8 px-2 font-bold text-xs">
                      <Download className="h-3.5 w-3.5 ml-1" />
                      تحميل
                    </Button>
                  </a>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 font-bold text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
