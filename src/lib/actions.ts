"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ClientStatus, TaskType, TaskPriority, TaskStatus, InteractionType } from "./prisma";

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
    await prisma.client.create({
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

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء إنشاء العميل" };
  }
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

  const defaults = [
    { title: "Passport", required: true },
    { title: "ID Card", required: true },
    { title: "Proof of Residence", required: true },
    { title: "Tax Number", required: false },
    { title: "Photos", required: true },
    { title: "Application Form", required: true },
    { title: "Interview Letter", required: false },
    { title: "Residence Permit", required: false },
    { title: "Supporting Evidence", required: true },
  ];

  for (const item of defaults) {
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

    const { data: { publicUrl } } = getSupabaseAdmin().storage
      .from("documents")
      .getPublicUrl(uniqueName);

    await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        fileUrl: publicUrl,
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
