import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClientInfoCard } from "@/components/client-info-card";
import { StatusCard } from "@/components/status-card";
import { TasksSection } from "@/components/tasks-section";
import { ChecklistSection } from "@/components/checklist-section";
import { InteractionsSection } from "@/components/interactions-section";
import { DocumentsSection } from "@/components/documents-section";
import { TimelineSection } from "@/components/timeline-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText as FileTextIcon } from "lucide-react";
import { initChecklist } from "@/lib/actions";

export default async function ClientDetailsPage({
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
      caseUpdates: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
      tasks: {
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      checklist: {
        orderBy: { createdAt: "asc" },
      },
      interactions: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      },
    },
  });

  if (!client) notFound();

  await initChecklist(client.id);

  const freshChecklist = await prisma.clientChecklistItem.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 md:p-3 rounded-xl bg-primary/10">
          <FileTextIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black">{client.fullName}</h2>
          <p className="text-muted-foreground font-mono text-xs md:text-sm">{client.caseNumber}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <div className="overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm">نظرة عامة</TabsTrigger>
          <TabsTrigger value="deadlines" className="text-xs md:text-sm">المواعيد</TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs md:text-sm">القائمة</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs md:text-sm">المستندات</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs md:text-sm">السجل</TabsTrigger>
          <TabsTrigger value="interactions" className="text-xs md:text-sm">التفاعلات</TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <ClientInfoCard client={client} />
              <TimelineSection
                clientId={client.id}
                updates={client.caseUpdates}
              />
            </div>
            <div className="space-y-4 md:space-y-6">
              <StatusCard client={client} />
              <QuickOverview
                tasks={client.tasks}
                checklist={freshChecklist}
                interactions={client.interactions}
                clientId={client.id}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deadlines">
          <TasksSection clientId={client.id} tasks={client.tasks} />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistSection clientId={client.id} items={freshChecklist} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsSection
            clientId={client.id}
            documents={client.documents}
            isAdmin={(session?.user as any)?.role === "ADMIN"}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineSection
            clientId={client.id}
            updates={client.caseUpdates}
          />
        </TabsContent>

        <TabsContent value="interactions">
          <InteractionsSection
            clientId={client.id}
            interactions={client.interactions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function QuickOverview({
  tasks,
  checklist,
  interactions,
  clientId,
}: {
  tasks: { id: string; title: string; dueDate: Date; status: string }[];
  checklist: { id: string; title: string; completed: boolean; required: boolean }[];
  interactions: { id: string; type: string; note: string; createdAt: Date; createdBy: { name: string } }[];
  clientId: string;
}) {
  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const overdueTasks = pendingTasks.filter((t) => new Date(t.dueDate) < new Date());
  const completedChecklist = checklist.filter((i) => i.completed).length;
  const totalChecklist = checklist.length;
  const missingRequired = checklist.filter((i) => i.required && !i.completed);

  return (
    <div className="space-y-3">
      {overdueTasks.length > 0 && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">
            {overdueTasks.length} موعد{overdueTasks.length > 1 ? " متأخرة" : " متأخر"}
          </p>
          <ul className="text-xs text-red-600 dark:text-red-300 mt-1.5 space-y-1">
            {overdueTasks.slice(0, 3).map((t) => (
              <li key={t.id} className="flex items-center gap-1.5">• {t.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border-2 p-3">
        <p className="text-sm font-bold mb-1.5">المستندات المطلوبة</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black">{completedChecklist}</span>
          <span className="text-sm text-muted-foreground">/ {totalChecklist}</span>
          <span className="text-sm text-muted-foreground mr-1">مكتمل</span>
        </div>
        {missingRequired.length > 0 && (
          <p className="text-xs font-medium text-red-500 mt-1.5">{missingRequired.length} مستند مطلوب ناقص</p>
        )}
      </div>

      {interactions.length > 0 && (
        <div className="rounded-xl border-2 p-3">
          <p className="text-sm font-bold mb-1.5">آخر تواصل</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{interactions[0].note}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            بواسطة {interactions[0].createdBy.name}
          </p>
        </div>
      )}
    </div>
  );
}
