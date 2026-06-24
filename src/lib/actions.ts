"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ClientStatus, TaskType, TaskPriority, TaskStatus, InteractionType } from "./prisma";

const checklistTemplates: Record<string, { title: string; required: boolean }[]> = {
  "لجوء": [
    { title: "جواز السفر", required: true },
    { title: "صور شخصية", required: true },
    { title: "إثبات الهوية", required: true },
    { title: "تقرير الدولة الأصل", required: true },
    { title: "شهادات شهود", required: false },
    { title: "تقرير طبي", required: false },
    { title: "طلب اللجوء", required: true },
    { title: "أدلة الاضطهاد", required: true },
    { title: "ترجمة المستندات", required: false },
  ],
  "استئناف": [
    { title: "قرار الرفض", required: true },
    { title: "طلب الاستئناف", required: true },
    { title: "مذكرة قانونية", required: true },
    { title: "أدلة جديدة", required: false },
    { title: "توكيل محامي", required: true },
    { title: "ترجمة المستندات", required: false },
  ],
  "لم شمل": [
    { title: "إثبات العلاقة الأسرية", required: true },
    { title: "جوازات السفر", required: true },
    { title: "شهادات ميلاد", required: true },
    { title: "إثبات الإقامة", required: true },
    { title: "طلب لم الشمل", required: true },
    { title: "صور عائلية", required: false },
  ],
  "تأشيرة": [
    { title: "جواز السفر", required: true },
    { title: "طلب التأشيرة", required: true },
    { title: "صور شخصية", required: true },
    { title: "إثبات العمل", required: true },
    { title: "كشف حساب بنكي", required: true },
    { title: "حجز طيران", required: false },
    { title: "تأمين صحي", required: true },
    { title: "دعوة رسمية", required: false },
  ],
};

const defaultChecklist = [
  { title: "جواز السفر", required: true },
  { title: "بطاقة الهوية", required: true },
  { title: "إثبات السكن", required: true },
  { title: "صور شخصية", required: true },
  { title: "طلب التقديم", required: true },
  { title: "أدلة داعمة", required: true },
  { title: "المستندات المطلوبة", required: false },
];

const createClientSchema = z.object({
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  phone: z.string().min(1, "الهاتف مطلوب"),
  email: z.string().email().optional().or(z.literal("")),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  passportNumber: z.string().optional(),
  caseNumber: z.string().min(1, "رقم القضية مطلوب"),
  caseType: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const session = await getSession();

  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    nationality: formData.get("nationality"),
    dateOfBirth: formData.get("dateOfBirth"),
    passportNumber: formData.get("passportNumber"),
    caseNumber: formData.get("caseNumber"),
    caseType: formData.get("caseType"),
    notes: formData.get("notes"),
  };

  const parsed = createClientSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const client = await prisma.client.create({
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        nationality: parsed.data.nationality || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        passportNumber: parsed.data.passportNumber || null,
        caseNumber: parsed.data.caseNumber,
        caseType: parsed.data.caseType || null,
        notes: parsed.data.notes || null,
      },
    });

    const template = parsed.data.caseType ? checklistTemplates[parsed.data.caseType] : null;
    const items = template || defaultChecklist;
    for (const item of items) {
      await prisma.clientChecklistItem.create({
        data: { clientId: client.id, title: item.title, required: item.required },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء إنشاء العميل" };
  }
}

export async function duplicateClient(clientId: string, newFullName: string, newCaseNumber: string) {
  const session = await getSession();

  const original = await prisma.client.findUnique({ where: { id: clientId } });
  if (!original) return { error: "العميل غير موجود" };

  const client = await prisma.client.create({
    data: {
      fullName: newFullName,
      phone: original.phone,
      email: original.email,
      nationality: original.nationality,
      dateOfBirth: original.dateOfBirth,
      passportNumber: original.passportNumber,
      caseNumber: newCaseNumber,
      caseType: original.caseType,
      notes: original.notes,
    },
  });

  const checklistItems = await prisma.clientChecklistItem.findMany({
    where: { clientId },
  });

  if (checklistItems.length > 0) {
    await prisma.clientChecklistItem.createMany({
      data: checklistItems.map((item) => ({
        clientId: client.id,
        title: item.title,
        completed: false,
        required: item.required,
      })),
    });
  }

  await prisma.caseUpdate.create({
    data: {
      clientId: client.id,
      note: `تم إنشاء هذه القضية كنسخة من ${original.caseNumber}`,
      createdById: (session.user as any).id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, clientId: client.id };
}

export async function updateClientStatus(clientId: string, status: ClientStatus) {
  const session = await getSession();

  await prisma.client.update({
    where: { id: clientId },
    data: { status },
  });

  await prisma.caseUpdate.create({
    data: {
      clientId,
      note: `تم تغيير الحالة إلى ${status.replace(/_/g, " ").toLowerCase()}`,
      createdById: (session.user as any).id,
    },
  });

  if (status === ClientStatus.REJECTED) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const existingAppeal = await prisma.task.findFirst({
      where: { clientId, type: TaskType.APPEAL, status: TaskStatus.PENDING },
    });
    if (!existingAppeal) {
      await prisma.task.create({
        data: {
          clientId,
          title: "تقديم استئناف - مدة 30 يوماً",
          description: "تم رفض القضية. يجب تقديم استئناف خلال 30 يوماً من تاريخ الرفض.",
          dueDate,
          type: TaskType.APPEAL,
          priority: TaskPriority.URGENT,
          status: TaskStatus.PENDING,
          createdById: (session.user as any).id,
        },
      });
    }
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function addCaseUpdate(clientId: string, note: string) {
  const session = await getSession();

  if (!note.trim()) {
    return { error: "لا يمكن إضافة ملاحظة فارغة" };
  }

  await prisma.caseUpdate.create({
    data: {
      clientId,
      note: note.trim(),
      createdById: (session.user as any).id,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  const session = await getSession();
  if ((session.user as any).role !== "ADMIN") {
    return { error: "ليس لديك صلاحية لحذف العملاء" };
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateClient(clientId: string, formData: FormData) {
  const session = await getSession();
  if ((session.user as any).role !== "ADMIN") {
    return { error: "ليس لديك صلاحية لتعديل العملاء" };
  }

  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    nationality: formData.get("nationality"),
    dateOfBirth: formData.get("dateOfBirth"),
    passportNumber: formData.get("passportNumber"),
    caseNumber: formData.get("caseNumber"),
    caseType: formData.get("caseType"),
    notes: formData.get("notes"),
  };

  const parsed = createClientSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        nationality: parsed.data.nationality || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        passportNumber: parsed.data.passportNumber || null,
        caseNumber: parsed.data.caseNumber,
        caseType: parsed.data.caseType || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تعديل العميل" };
  }
}

// TASKS / DEADLINES

export async function createTask(formData: FormData) {
  const session = await getSession();
  const clientId = formData.get("clientId") as string;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const type = formData.get("type") as TaskType;
  const priority = formData.get("priority") as TaskPriority;

  if (!title || !dueDate) {
    return { error: "العنوان والتاريخ مطلوبان" };
  }

  await prisma.task.create({
    data: {
      clientId,
      title,
      description: description || null,
      dueDate: new Date(dueDate),
      type: type || TaskType.OTHER,
      priority: priority || TaskPriority.MEDIUM,
      createdById: (session.user as any).id,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "لم يتم العثور على المهمة" };

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath(`/clients/${task.clientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "لم يتم العثور على المهمة" };

  await prisma.task.delete({ where: { id: taskId } });

  revalidatePath(`/clients/${task.clientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(taskId: string, formData: FormData) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "لم يتم العثور على المهمة" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const type = formData.get("type") as TaskType;
  const priority = formData.get("priority") as TaskPriority;

  if (!title || !dueDate) {
    return { error: "العنوان والتاريخ مطلوبان" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { title, description: description || null, dueDate: new Date(dueDate), type, priority },
  });

  revalidatePath(`/clients/${task.clientId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

// CHECKLIST

export async function toggleChecklistItem(itemId: string) {
  const item = await prisma.clientChecklistItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "لم يتم العثور على العنصر" };

  await prisma.clientChecklistItem.update({
    where: { id: itemId },
    data: { completed: !item.completed },
  });

  revalidatePath(`/clients/${item.clientId}`);
  return { success: true };
}

export async function addChecklistItem(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const title = formData.get("title") as string;
  const required = formData.get("required") === "true";

  if (!title) return { error: "العنوان مطلوب" };

  await prisma.clientChecklistItem.create({ data: { clientId, title, required } });

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
  const item = await prisma.clientChecklistItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "لم يتم العثور على العنصر" };

  await prisma.clientChecklistItem.delete({ where: { id: itemId } });

  revalidatePath(`/clients/${item.clientId}`);
  return { success: true };
}

export async function initChecklist(clientId: string) {
  const existing = await prisma.clientChecklistItem.count({ where: { clientId } });
  if (existing > 0) return { success: true };

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { caseType: true },
  });

  const template = client?.caseType ? checklistTemplates[client.caseType] : null;
  const items = template || defaultChecklist;

  for (const item of items) {
    await prisma.clientChecklistItem.create({ data: { clientId, title: item.title, required: item.required } });
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

// INTERACTIONS

export async function addInteraction(formData: FormData) {
  const session = await getSession();
  const clientId = formData.get("clientId") as string;
  const type = formData.get("type") as InteractionType;
  const note = formData.get("note") as string;

  if (!note.trim()) return { error: "لا يمكن إضافة ملاحظة فارغة" };

  await prisma.clientInteraction.create({
    data: { clientId, type: type || InteractionType.OTHER, note: note.trim(), createdById: (session.user as any).id },
  });

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteInteraction(interactionId: string) {
  const interaction = await prisma.clientInteraction.findUnique({ where: { id: interactionId } });
  if (!interaction) return { error: "لا يوجد تفاعل بهذا الرقم" };

  await prisma.clientInteraction.delete({ where: { id: interactionId } });

  revalidatePath(`/clients/${interaction.clientId}`);
  return { success: true };
}

// DOCUMENTS

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadDocument(clientId: string, formData: FormData) {
  try {
    const session = await getSession();
    const userId = (session.user as any).id;

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { error: "يرجى اختيار ملف" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "فقط ملفات PDF و PNG و JPG مسموح بها" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: "حجم الملف يجب أن لا يتجاوز 10 ميجابايت" };
    }

    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { data: uploadData, error: uploadError } = await getSupabaseAdmin().storage
      .from("documents")
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `فشل رفع الملف: ${uploadError.message}` };
    }

    const { data } = await getSupabaseAdmin().storage
      .from("documents")
      .createSignedUrl(uniqueName, 60 * 60 * 24 * 365);

    if (!data?.signedUrl) {
      return { error: "فشل إنشاء رابط المستند" };
    }

    const fileUrl = data.signedUrl;

    await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        fileUrl,
        uploadedById: (session.user as any).id,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteDocument(docId: string) {
  try {
    const session = await getSession();
    if ((session.user as any).role !== "ADMIN") {
      return { error: "هذه العملية متاحة للمسؤول فقط" };
    }

    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) return { error: "لا يوجد مستند بهذا الرقم" };

    const filePath = doc.fileUrl.split("/").pop();
    if (filePath) {
      await getSupabaseAdmin().storage.from("documents").remove([filePath]);
    }

    await prisma.document.delete({ where: { id: docId } });

    revalidatePath(`/clients/${doc.clientId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}
