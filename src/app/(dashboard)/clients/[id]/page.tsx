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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{client.fullName}</h2>
        <p className="text-muted-foreground font-mono text-sm">{client.caseNumber}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-1">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="deadlines">المواعيد</TabsTrigger>
          <TabsTrigger value="checklist">القائمة</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="timeline">السجل</TabsTrigger>
          <TabsTrigger value="interactions">التفاعلات</TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ClientInfoCard client={client} />
              <TimelineSection
                clientId={client.id}
                updates={client.caseUpdates}
              />
            </div>
            <div className="space-y-6">
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
    <div className="space-y-4">
      {overdueTasks.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {overdueTasks.length} موعد {overdueTasks.length > 1 ? "متأخر" : "متأخر"}
          </p>
          <ul className="text-xs text-red-600 dark:text-red-300 mt-1 space-y-0.5">
            {overdueTasks.slice(0, 3).map((t) => (
              <li key={t.id}>• {t.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border p-3">
        <p className="text-sm font-medium mb-1">المستندات</p>
        <p className="text-sm text-muted-foreground">
          {completedChecklist} / {totalChecklist} مكتمل
        </p>
        {missingRequired.length > 0 && (
          <p className="text-xs text-red-500 mt-1">{missingRequired.length} مطلوب ناقص</p>
        )}
      </div>

      {interactions.length > 0 && (
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-1">آخر تواصل</p>
          <p className="text-sm text-muted-foreground">{interactions[0].note}</p>
          <p className="text-xs text-muted-foreground mt-1">
            بواسطة {interactions[0].createdBy.name} · {new Date(interactions[0].createdAt).toLocaleDateString("ar-SA")}
          </p>
        </div>
      )}
    </div>
  );
}
