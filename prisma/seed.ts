import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✓ Created admin user:', admin.email)

  // Create PM user
  const pmPassword = await hashPassword('pm123')
  const pm = await prisma.user.upsert({
    where: { email: 'pm@example.com' },
    update: {},
    create: {
      email: 'pm@example.com',
      name: 'Project Manager',
      passwordHash: pmPassword,
      role: 'PM',
    },
  })
  console.log('✓ Created PM user:', pm.email)

  // Create QS user
  const qsPassword = await hashPassword('qs123')
  const qs = await prisma.user.upsert({
    where: { email: 'qs@example.com' },
    update: {},
    create: {
      email: 'qs@example.com',
      name: 'Quantity Surveyor',
      passwordHash: qsPassword,
      role: 'QS',
    },
  })
  console.log('✓ Created QS user:', qs.email)

  // Create Site user
  const sitePassword = await hashPassword('site123')
  const site = await prisma.user.upsert({
    where: { email: 'site@example.com' },
    update: {},
    create: {
      email: 'site@example.com',
      name: 'Site Engineer',
      passwordHash: sitePassword,
      role: 'SITE',
    },
  })
  console.log('✓ Created Site user:', site.email)

  // Create Viewer user
  const viewerPassword = await hashPassword('viewer123')
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Viewer User',
      passwordHash: viewerPassword,
      role: 'VIEWER',
    },
  })
  console.log('✓ Created Viewer user:', viewer.email)

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { projectNumber: 'PRJ-001' },
    update: {},
    create: {
      projectNumber: 'PRJ-001',
      name: 'Sample Construction Project',
      description: 'A sample project for demonstration purposes',
      status: 'PLANNING',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 1000000,
      actualCost: 0,
      currency: 'GBP',
      location: 'London, UK',
      client: 'Sample Client Ltd',
      createdById: pm.id,
    },
  })
  console.log('✓ Created sample project:', project.name)

  console.log('✅ Database seeding completed successfully!')
  console.log('\nTest credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:  admin@example.com / admin123')
  console.log('PM:     pm@example.com / pm123')
  console.log('QS:     qs@example.com / qs123')
  console.log('Site:   site@example.com / site123')
  console.log('Viewer: viewer@example.com / viewer123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
