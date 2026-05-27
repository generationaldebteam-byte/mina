const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
async function main() {
  const users = await prisma.user.count();
  const clients = await prisma.client.count();
  const tasks = await prisma.task.count();
  const interactions = await prisma.clientInteraction.count();
  const docs = await prisma.document.count();
  const updates = await prisma.caseUpdate.count();
  console.log({ users, clients, tasks, interactions, docs, updates });
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
