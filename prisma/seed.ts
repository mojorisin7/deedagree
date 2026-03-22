import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const dbUrl = `postgresql://${process.env.USER ?? 'postgres'}@localhost:5432/deed_of_guarantee`
const adapter = new PrismaPg({ connectionString: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create organisation
  const org = await prisma.organisation.upsert({
    where: { id: 'seed-org-1' },
    update: {},
    create: {
      id: 'seed-org-1',
      name: 'Smith & Partners Solicitors',
      type: 'LAW_FIRM',
      address: '10 Legal Square, London EC1A 1BB',
      email: 'info@smithpartners.com',
      phone: '+44 20 7123 4567',
    },
  })

  // Create admin user
  const adminHash = await bcrypt.hash('password123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
      organisationId: org.id,
    },
  })

  // Create solicitor user
  const solHash = await bcrypt.hash('password123', 12)
  const solicitor = await prisma.user.upsert({
    where: { email: 'solicitor@example.com' },
    update: {},
    create: {
      email: 'solicitor@example.com',
      name: 'Sarah Williams',
      passwordHash: solHash,
      role: 'SOLICITOR',
      organisationId: org.id,
    },
  })

  // Deed 1: Draft
  await prisma.deed.upsert({
    where: { reference: 'DOG-2026-00001' },
    update: {},
    create: {
      reference: 'DOG-2026-00001',
      status: 'DRAFT',
      companyName: 'Oakwood Properties Ltd',
      companyRegNumber: '12345678',
      companyAddress: '15 Oak Lane\nManchester\nM1 2AB',
      directorName: 'Robert Oak',
      directorEmail: 'robert@oakwood.co.uk',
      propertyAddress: '42 Elm Street\nLondon\nN1 2BC',
      titleNumber: 'GM123456',
      mortgageAmount: 35000000, // £350,000.00
      lender: 'Halifax',
      mortgageTermYears: 25,
      guaranteeType: 'ALL_MONIES',
      governingLaw: 'ENGLAND_WALES',
      jointAndSeveral: true,
      includesInterest: true,
      includesCosts: true,
      requiresILA: true,
      createdById: admin.id,
      organisationId: org.id,
      guarantors: {
        create: [
          {
            fullName: 'Robert Oak',
            email: 'robert@oak.co.uk',
            address: '1 Acacia Avenue\nLondon\nN2 3CD',
            phone: '+44 7700 900001',
            relationshipToCompany: 'Director',
            sortOrder: 0,
          },
          {
            fullName: 'Margaret Oak',
            email: 'margaret@oak.co.uk',
            address: '1 Acacia Avenue\nLondon\nN2 3CD',
            relationshipToCompany: 'Spouse of Director',
            sortOrder: 1,
          },
        ],
      },
    },
  })

  // Deed 2: Pending signatures
  const deed2 = await prisma.deed.upsert({
    where: { reference: 'DOG-2026-00002' },
    update: {},
    create: {
      reference: 'DOG-2026-00002',
      status: 'PENDING_SIGNATURES',
      companyName: 'Birchwood Investments Ltd',
      companyRegNumber: '87654321',
      companyAddress: '22 Birch Road\nBirmingham\nB1 1AA',
      propertyAddress: '5 Cherry Blossom Way\nBristol\nBS1 2CD',
      mortgageAmount: 50000000, // £500,000.00
      lender: 'Nationwide',
      mortgageTermYears: 20,
      guaranteeType: 'LIMITED',
      limitedAmount: 25000000, // £250,000.00
      governingLaw: 'ENGLAND_WALES',
      jointAndSeveral: true,
      includesInterest: true,
      includesCosts: true,
      requiresILA: true,
      createdById: solicitor.id,
      organisationId: org.id,
      guarantors: {
        create: [
          {
            fullName: 'James Birch',
            email: 'james@birchwood.co.uk',
            address: '10 Maple Close\nBirmingham\nB2 2BB',
            relationshipToCompany: 'Director & Shareholder',
            signatureStatus: 'INVITED',
            inviteToken: 'demo-token-james-birch-001-please-replace',
            inviteSentAt: new Date(),
            inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            sortOrder: 0,
          },
        ],
      },
    },
  })

  // Deed 3: Completed
  const deed3 = await prisma.deed.upsert({
    where: { reference: 'DOG-2026-00003' },
    update: {},
    create: {
      reference: 'DOG-2026-00003',
      status: 'FULLY_SIGNED',
      companyName: 'Elmwood Commercial Ltd',
      companyRegNumber: '11223344',
      companyAddress: '33 Elm Square\nLeeds\nLS1 1AA',
      propertyAddress: '7 Pine Avenue\nLeeds\nLS2 2BB',
      mortgageAmount: 75000000, // £750,000.00
      lender: 'Barclays',
      mortgageTermYears: 15,
      guaranteeType: 'ALL_MONIES',
      governingLaw: 'ENGLAND_WALES',
      jointAndSeveral: false,
      includesInterest: true,
      includesCosts: true,
      requiresILA: true,
      createdById: solicitor.id,
      organisationId: org.id,
      guarantors: {
        create: [
          {
            fullName: 'Elizabeth Elm',
            email: 'liz@elmwood.co.uk',
            address: '15 Poplar Street\nLeeds\nLS3 3CC',
            relationshipToCompany: 'Director',
            signatureStatus: 'SIGNED',
            signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            witnessName: 'Patricia Poplar',
            witnessAddress: '20 Oak Road\nLeeds\nLS4 4DD',
            ilaConfirmed: true,
            termsConfirmed: true,
            voluntaryConfirmed: true,
            liabilityConfirmed: true,
            sortOrder: 0,
          },
        ],
      },
    },
  })

  // Audit log entries
  await prisma.auditLog.createMany({
    data: [
      { action: 'DEED_CREATED', deedId: deed2.id, userId: solicitor.id, metadata: { reference: 'DOG-2026-00002' } },
      { action: 'GUARANTOR_ADDED', deedId: deed2.id, userId: solicitor.id, metadata: { fullName: 'James Birch' } },
      { action: 'INVITE_SENT', deedId: deed2.id, userId: solicitor.id, metadata: { guarantorEmail: 'james@birchwood.co.uk' } },
      { action: 'DEED_CREATED', deedId: deed3.id, userId: solicitor.id, metadata: { reference: 'DOG-2026-00003' } },
      { action: 'GUARANTOR_SIGNED', deedId: deed3.id, metadata: { guarantorName: 'Elizabeth Elm' } },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete!')
  console.log('👤 Admin: admin@example.com / password123')
  console.log('👤 Solicitor: solicitor@example.com / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
