import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.caseUpdate.deleteMany();
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();
  await prisma.clientChecklistItem.deleteMany();
  await prisma.clientInteraction.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await hash("admin123", 12);

  await prisma.user.create({
    data: {
      name: "المدير",
      email: "admin@office.local",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  console.log("User created: admin@office.local / admin123");
  console.log("IMPORTANT: Change the password after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
