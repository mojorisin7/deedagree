import type { PrismaClient } from '@prisma/client'
import prisma from './prisma'

export async function generateDeedReference(tx?: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]): Promise<string> {
  const client = tx ?? prisma
  const year = new Date().getFullYear()
  const prefix = `DOG-${year}-`
  const count = await (client as PrismaClient).deed.count({
    where: { reference: { startsWith: prefix } },
  })
  return `${prefix}${String(count + 1).padStart(5, '0')}`
}
