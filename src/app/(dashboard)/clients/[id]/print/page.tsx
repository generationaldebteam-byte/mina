import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";

const statusLabels: Record<string, string> = {
  NEW_CLIENT: "عميل جديد", GATHERING_DOCUMENTS: "جمع المستندات", SUBMITTED: "تم التقديم",
  INTERVIEW_SCHEDULED: "مقابلة مجدولة", WAITING_DECISION: "بانتظار القرار",
  APPEAL: "استئناف", APPROVED: "مقبول", REJECTED: "مرفوض", CLOSED: "مغلق",
};

export const dynamic = 'force-dynamic';

export default async function PrintClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) notFound();

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      caseUpdates: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      documents: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      tasks: { orderBy: { dueDate: "asc" } },
      checklist: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!client) notFound();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 print:py-0 print:px-0">
      <div className="no-print flex items-center justify-between mb-6">
        <Link href={`/clients/${client.id}`}>
          <Button variant="outline" size="sm" className="font-bold text-xs">← العودة</Button>
        </Link>
        <PrintButton />
      </div>

      <div className="border-b-3 border-foreground pb-4 mb-6 print:border-b-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">{client.fullName}</h1>
            <p className="font-mono text-sm text-muted-foreground">{client.caseNumber}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-muted font-bold text-sm">{statusLabels[client.status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
        {[
          ["رقم الهاتف", client.phone],
          ["البريد الإلكتروني", client.email || "—"],
          ["الجنسية", client.nationality || "—"],
          ["رقم جواز السفر", client.passportNumber || "—"],
          ["نوع القضية", client.caseType || "—"],
          ["تاريخ الميلاد", client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString("ar-SA") : "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {client.notes && (
        <div className="mb-6">
          <h2 className="text-sm font-black border-b-2 pb-1 mb-3">ملاحظات</h2>
          <p className="text-sm">{client.notes}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-black border-b-2 pb-1 mb-3">المواعيد</h2>
        {client.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد مواعيد</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 bg-muted/50">
                <th className="text-right font-bold p-2">العنوان</th>
                <th className="text-right font-bold p-2">تاريخ الاستحقاق</th>
                <th className="text-right font-bold p-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {client.tasks.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-2 font-medium">{t.title}</td>
                  <td className="p-2">{new Date(t.dueDate).toLocaleDateString("ar-SA")}</td>
                  <td className="p-2">{t.status === "PENDING" ? "قيد الانتظار" : t.status === "COMPLETED" ? "مكتمل" : "متأخر"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black border-b-2 pb-1 mb-3">المستندات المطلوبة</h2>
        <div className="space-y-1">
          {client.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span className={item.completed ? "text-green-600 font-bold" : "text-red-500"}>{item.completed ? "✓" : "○"}</span>
              <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.title}</span>
              {item.required && <span className="text-xs text-muted-foreground">(مطلوب)</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black border-b-2 pb-1 mb-3">المستندات المرفوعة</h2>
        {client.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد مستندات</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 bg-muted/50">
                <th className="text-right font-bold p-2">اسم الملف</th>
                <th className="text-right font-bold p-2">تاريخ الرفع</th>
                <th className="text-right font-bold p-2">بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {client.documents.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="p-2">{doc.fileName}</td>
                  <td className="p-2">{new Date(doc.createdAt).toLocaleDateString("ar-SA")}</td>
                  <td className="p-2">{doc.uploadedBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-black border-b-2 pb-1 mb-3">سجل القضية</h2>
        {client.caseUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد تحديثات</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 bg-muted/50">
                <th className="text-right font-bold p-2">التاريخ</th>
                <th className="text-right font-bold p-2">الملاحظة</th>
                <th className="text-right font-bold p-2">بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {client.caseUpdates.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("ar-SA")}</td>
                  <td className="p-2">{u.note}</td>
                  <td className="p-2">{u.createdBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground border-t-2 pt-4 mt-8 print:mt-4">
        تم إنشاء هذا التقرير في {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })} · {session.user?.name}
      </div>
    </div>
  );
}
