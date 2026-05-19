import { PrismaClient, ClientStatus, Role, TaskType, TaskPriority, TaskStatus, InteractionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("جاري إدخال البيانات التجريبية...");

  await prisma.caseUpdate.deleteMany();
  await prisma.document.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await hash("admin123", 12);
  const staffHash = await hash("staff123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "المدير",
      email: "admin@office.local",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "سارة أحمد",
      email: "sarah@office.local",
      passwordHash: staffHash,
      role: Role.STAFF,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "محمد علي",
      email: "michael@office.local",
      passwordHash: staffHash,
      role: Role.STAFF,
    },
  });

  const clients = [
    {
      fullName: "أميرة حسن",
      phone: "+966-555-0101",
      email: "amira.h@email.com",
      nationality: "سوريا",
      dateOfBirth: new Date("1992-03-15"),
      passportNumber: "SYR1234567",
      caseNumber: "ASY-2024-001",
      status: ClientStatus.WAITING_DECISION,
      caseType: "لجوء",
      notes: "فرت من الاضطهاد في دمشق. الطلب مبني على الرأي السياسي.",
    },
    {
      fullName: "خالد المنصور",
      phone: "+966-555-0102",
      nationality: "اليمن",
      dateOfBirth: new Date("1988-07-22"),
      passportNumber: "YEM9876543",
      caseNumber: "ASY-2024-002",
      status: ClientStatus.INTERVIEW_SCHEDULED,
      caseType: "لجوء",
      notes: "المقابلة مجدولة. جميع المستندات مقدمة.",
    },
    {
      fullName: "فاطمة الراشد",
      phone: "+966-555-0103",
      email: "fatima.r@email.com",
      nationality: "العراق",
      dateOfBirth: new Date("1995-11-08"),
      passportNumber: "IRQ5432109",
      caseNumber: "ASY-2024-003",
      status: ClientStatus.GATHERING_DOCUMENTS,
      caseType: "لجوء",
      notes: "بانتظار مستندات العائلة من الخارج.",
    },
    {
      fullName: "عبدالله محمد",
      phone: "+966-555-0104",
      nationality: "الصومال",
      dateOfBirth: new Date("1990-01-30"),
      caseNumber: "ASY-2024-004",
      status: ClientStatus.SUBMITTED,
      caseType: "لجوء",
      notes: "تم تقديم الطلب. بانتظار المعالجة.",
    },
    {
      fullName: "نورة الشمري",
      phone: "+966-555-0105",
      email: "noura.s@email.com",
      nationality: "السودان",
      dateOfBirth: new Date("1987-06-12"),
      passportNumber: "SDN8765432",
      caseNumber: "ASY-2024-005",
      status: ClientStatus.APPEAL,
      caseType: "استئناف لجوء",
      notes: "تم رفض الطلب الأولي. تم تقديم استئناف بأدلة جديدة.",
    },
    {
      fullName: "عمر فاروق",
      phone: "+966-555-0106",
      nationality: "إريتريا",
      dateOfBirth: new Date("1993-09-25"),
      passportNumber: "ERI3456789",
      caseNumber: "ASY-2024-006",
      status: ClientStatus.NEW_CLIENT,
      caseType: "لجوء",
      notes: "عميل جديد. تم إجراء المقابلة الأولية.",
    },
    {
      fullName: "ليلى عبدالله",
      phone: "+966-555-0107",
      nationality: "فلسطين",
      dateOfBirth: new Date("1991-04-18"),
      caseNumber: "ASY-2024-007",
      status: ClientStatus.APPROVED,
      caseType: "لجوء",
      notes: "تم قبول القضية. متابعة إجراءات الإقامة.",
    },
    {
      fullName: "يوسف إبراهيم",
      phone: "+966-555-0108",
      email: "youssef.i@email.com",
      nationality: "مصر",
      dateOfBirth: new Date("1985-12-03"),
      passportNumber: "EGY6543210",
      caseNumber: "ASY-2024-008",
      status: ClientStatus.CLOSED,
      caseType: "لجوء",
      notes: "تم إغلاق القضية. تم نقل العميل للكفيل.",
    },
    {
      fullName: "مريم حسن",
      phone: "+966-555-0109",
      nationality: "إثيوبيا",
      dateOfBirth: new Date("1996-08-14"),
      passportNumber: "ETH2345678",
      caseNumber: "ASY-2024-009",
      status: ClientStatus.WAITING_DECISION,
      caseType: "لجوء",
      notes: "طلب حماية. جميع الأدلة مقدمة.",
    },
    {
      fullName: "أحمد سعيد",
      phone: "+966-555-0110",
      email: "ahmed.s@email.com",
      nationality: "الكونغو",
      dateOfBirth: new Date("1989-02-28"),
      passportNumber: "COD7654321",
      caseNumber: "ASY-2024-010",
      status: ClientStatus.INTERVIEW_SCHEDULED,
      caseType: "لجوء",
      notes: "المقابلة مجدولة الشهر القادم. جاري تحضير العميل.",
    },
  ];

  const createdClients = [];
  for (const c of clients) {
    const client = await prisma.client.create({ data: c });
    createdClients.push(client);
  }

  const updates = [
    { clientId: createdClients[0].id, note: "تم إجراء المقابلة الأولية. قدم العميل بياناً مفصلاً.", userId: staff1.id },
    { clientId: createdClients[0].id, note: "تم جمع وترجمة جميع المستندات الداعمة.", userId: staff1.id },
    { clientId: createdClients[0].id, note: "تم تقديم الطلب لمكتب الهجرة.", userId: admin.id },
    { clientId: createdClients[0].id, note: "تم استلام التأكيد. القضية قيد المراجعة.", userId: staff1.id },
    { clientId: createdClients[1].id, note: "تم تسجيل العميل. فتح القضية.", userId: staff2.id },
    { clientId: createdClients[1].id, note: "تم جمع المستندات. إعداد الطلب.", userId: staff2.id },
    { clientId: createdClients[1].id, note: "تم تقديم الطلب بنجاح.", userId: admin.id },
    { clientId: createdClients[1].id, note: "تم تحديد موعد المقابلة في 4 يونيو 2025.", userId: staff2.id },
    { clientId: createdClients[2].id, note: "تم تسجيل عميل جديد. تحديد موعد أولي.", userId: staff1.id },
    { clientId: createdClients[2].id, note: "بانتظار مستندات العائلة من الخارج. تم إرسال متابعة.", userId: staff1.id },
    { clientId: createdClients[3].id, note: "تم تسجيل العميل.", userId: staff2.id },
    { clientId: createdClients[3].id, note: "تم تقديم الطلب. بانتظار تأكيد المعالجة.", userId: admin.id },
    { clientId: createdClients[4].id, note: "تم رفض الطلب الأولي. السبب: أدلة غير كافية.", userId: staff1.id },
    { clientId: createdClients[4].id, note: "تم تقديم استئناف بشهادات شهود وأدلة جديدة.", userId: admin.id },
    { clientId: createdClients[5].id, note: "عميل جديد. تم إجراء المقابلة الأولية.", userId: staff2.id },
    { clientId: createdClients[6].id, note: "تم تقديم الطلب ومعالجته.", userId: staff1.id },
    { clientId: createdClients[6].id, note: "تم إجراء المقابلة بنجاح.", userId: staff1.id },
    { clientId: createdClients[6].id, note: "تم قبول القضية. تم إبلاغ العميل.", userId: admin.id },
    { clientId: createdClients[7].id, note: "تم تقديم الطلب.", userId: staff2.id },
    { clientId: createdClients[7].id, note: "تم قبول القضية. تم نقل العميل للكفيل.", userId: admin.id },
    { clientId: createdClients[7].id, note: "تم إغلاق القضية. إنهاء جميع الإجراءات.", userId: admin.id },
    { clientId: createdClients[8].id, note: "تم تسجيل عميل جديد. طلب حماية.", userId: staff1.id },
    { clientId: createdClients[8].id, note: "تم جمع وتقديم جميع الأدلة.", userId: staff1.id },
    { clientId: createdClients[8].id, note: "تم تقديم الطلب. بانتظار القرار.", userId: admin.id },
    { clientId: createdClients[9].id, note: "تم تسجيل العميل.", userId: staff2.id },
    { clientId: createdClients[9].id, note: "تم جمع المستندات. إعداد وتقديم الطلب.", userId: staff2.id },
    { clientId: createdClients[9].id, note: "المقابلة مجدولة الشهر القادم. جاري تحضير العميل.", userId: admin.id },
  ];

  for (const u of updates) {
    await prisma.caseUpdate.create({
      data: {
        clientId: u.clientId,
        note: u.note,
        createdById: u.userId,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Seed tasks
  const tasks = [
    { clientId: createdClients[0].id, title: "تقديم أدلة إضافية", description: "العميل يحتاج لتقديم تقرير الشرطة", dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: TaskType.DOCUMENT_DEADLINE, priority: TaskPriority.URGENT, status: TaskStatus.PENDING, userId: staff1.id },
    { clientId: createdClients[0].id, title: "متابعة القرار", description: "الاتصال بمكتب الهجرة", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), type: TaskType.FOLLOW_UP, priority: TaskPriority.HIGH, status: TaskStatus.PENDING, userId: staff1.id },
    { clientId: createdClients[1].id, title: "تحضير المقابلة", description: "مراجعة القضية مع العميل قبل المقابلة", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), type: TaskType.INTERVIEW, priority: TaskPriority.URGENT, status: TaskStatus.PENDING, userId: staff2.id },
    { clientId: createdClients[2].id, title: "جمع مستندات العائلة", description: "شهادات الميلاد من الخارج", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), type: TaskType.DOCUMENT_DEADLINE, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, userId: staff1.id },
    { clientId: createdClients[4].id, title: "موعد الاستئناف", description: "تقديم الاستئناف بالأدلة الجديدة", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: TaskType.APPEAL, priority: TaskPriority.URGENT, status: TaskStatus.MISSED, userId: admin.id },
    { clientId: createdClients[4].id, title: "تقديم استئناف عاجل", description: "مطلب عاجل مطلوب", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: TaskType.APPEAL, priority: TaskPriority.URGENT, status: TaskStatus.PENDING, userId: admin.id },
    { clientId: createdClients[8].id, title: "أدلة ظروف البلد", description: "جمع التقارير والأخبار", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: TaskType.DOCUMENT_DEADLINE, priority: TaskPriority.HIGH, status: TaskStatus.PENDING, userId: staff1.id },
    { clientId: createdClients[9].id, title: "جلسة تحضير المقابلة", description: "مقابلة تجريبية مع العميل", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: TaskType.INTERVIEW, priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, userId: staff2.id },
    { clientId: createdClients[3].id, title: "التحقق من حالة الطلب", description: "متابعة المعالجة", dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), type: TaskType.FOLLOW_UP, priority: TaskPriority.LOW, status: TaskStatus.PENDING, userId: staff2.id },
    { clientId: createdClients[1].id, title: "إرسال خطاب التأكيد", dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), type: TaskType.APPOINTMENT, priority: TaskPriority.LOW, status: TaskStatus.COMPLETED, userId: staff2.id },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        clientId: t.clientId,
        title: t.title,
        description: t.description || null,
        dueDate: t.dueDate,
        type: t.type,
        priority: t.priority,
        status: t.status,
        createdById: t.userId,
      },
    });
  }

  // Seed checklist items
  const checklistDefaults = [
    { title: "جواز السفر", required: true },
    { title: "بطاقة الهوية", required: true },
    { title: "إثبات الإقامة", required: true },
    { title: "الرقم الضريبي", required: false },
    { title: "صور شخصية", required: true },
    { title: "نموذج الطلب", required: true },
    { title: "خطاب المقابلة", required: false },
    { title: "تصريح الإقامة", required: false },
    { title: "أدلة داعمة", required: true },
  ];

  for (const client of createdClients) {
    for (const item of checklistDefaults) {
      await prisma.clientChecklistItem.create({
        data: {
          clientId: client.id,
          title: item.title,
          required: item.required,
          completed: Math.random() > 0.5,
        },
      });
    }
  }

  // Seed interactions
  const interactions = [
    { clientId: createdClients[0].id, type: InteractionType.PHONE_CALL, note: "اتصال بالعميل — بدون رد، ترك رسالة صوتية", userId: staff1.id },
    { clientId: createdClients[0].id, type: InteractionType.WHATSAPP, note: "أرسل العميل مستندات إضافية عبر واتساب", userId: staff1.id },
    { clientId: createdClients[0].id, type: InteractionType.OFFICE_VISIT, note: "زيارة العميل للمكتب. مناقشة تقدم القضية والخطوات التالية.", userId: admin.id },
    { clientId: createdClients[1].id, type: InteractionType.OFFICE_VISIT, note: "تم الانتهاء من جلسة تحضير المقابلة. العميل يشعر بالاستعداد.", userId: staff2.id },
    { clientId: createdClients[1].id, type: InteractionType.EMAIL, note: "إرسال خطاب تأكيد المقابلة عبر البريد الإلكتروني", userId: staff2.id },
    { clientId: createdClients[2].id, type: InteractionType.PHONE_CALL, note: "محادثة مع العميل. لا يزال بانتظار مستندات العائلة.", userId: staff1.id },
    { clientId: createdClients[4].id, type: InteractionType.OFFICE_VISIT, note: "مناقشة استراتيجية الاستئناف. العميل قدم جهة اتصال شاهد جديد.", userId: admin.id },
    { clientId: createdClients[4].id, type: InteractionType.FOLLOW_UP, note: "يجب المتابعة مع المساعدة القانونية حول المطلب العاجل", userId: admin.id },
    { clientId: createdClients[8].id, type: InteractionType.DOCUMENT_RECEIVED, note: "استلام تقارير ظروف البلد من منظمة غير حكومية", userId: staff1.id },
    { clientId: createdClients[9].id, type: InteractionType.PHONE_CALL, note: "تأكيد موعد المقابلة مع العميل. العميل سيحضر مترجماً.", userId: staff2.id },
  ];

  for (const i of interactions) {
    await prisma.clientInteraction.create({
      data: {
        clientId: i.clientId,
        type: i.type,
        note: i.note,
        createdById: i.userId,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("تم إدخال البيانات التجريبية بنجاح!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
