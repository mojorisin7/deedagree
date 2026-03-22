import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const dbUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.USER ?? 'postgres'}@localhost:5432/deed_of_guarantee`

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: dbUrl })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
