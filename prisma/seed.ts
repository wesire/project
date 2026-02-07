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

  // Create project members
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: pm.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: pm.id,
      role: 'Project Manager',
    },
  })
  console.log('✓ Added PM as project member')

  // Create a milestone
  const milestone = await prisma.milestone.create({
    data: {
      projectId: project.id,
      name: 'Foundation Complete',
      description: 'Complete foundation work',
      dueDate: new Date('2024-03-31'),
      status: 'PENDING',
      progress: 0,
      owner: 'Site Engineer',
    },
  })
  console.log('✓ Created sample milestone')

  // Create a sprint
  const sprint = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: 'Sprint 1 - Foundation',
      goal: 'Complete foundation excavation and concrete work',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      status: 'PLANNED',
    },
  })
  console.log('✓ Created sample sprint')

  // Create a task
  await prisma.task.create({
    data: {
      projectId: project.id,
      sprintId: sprint.id,
      milestoneId: milestone.id,
      taskNumber: 'TASK-001',
      title: 'Excavate foundation',
      description: 'Excavate to required depth',
      status: 'TODO',
      priority: 'HIGH',
      createdById: pm.id,
      assignedToId: site.id,
      estimatedHours: 40,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
    },
  })
  console.log('✓ Created sample task')

  // Create a risk
  await prisma.risk.create({
    data: {
      projectId: project.id,
      riskNumber: 'RISK-001',
      title: 'Weather delays',
      description: 'Adverse weather may delay foundation work',
      category: 'Environmental',
      probability: 3,
      impact: 4,
      score: 12,
      status: 'OPEN',
      owner: 'Project Manager',
      mitigation: 'Plan alternative indoor tasks',
      contingency: 'Add 2 weeks buffer to schedule',
    },
  })
  console.log('✓ Created sample risk')

  // Create a change order
  await prisma.changeOrder.create({
    data: {
      projectId: project.id,
      changeNumber: 'CHG-001',
      title: 'Additional reinforcement',
      description: 'Client requested extra reinforcement in foundation',
      status: 'SUBMITTED',
      requestedBy: 'Client',
      costImpact: 15000,
      timeImpact: 3,
    },
  })
  console.log('✓ Created sample change order')

  // Create a resource
  const resource = await prisma.resource.create({
    data: {
      name: 'Excavator',
      type: 'EQUIPMENT',
      description: 'Heavy excavation equipment',
      costPerHour: 150,
      availability: 'On-demand',
      skills: ['excavation', 'grading'],
    },
  })
  console.log('✓ Created sample resource')

  // Create resource allocation
  await prisma.resourceAllocation.create({
    data: {
      projectId: project.id,
      userId: site.id,
      resourceId: resource.id,
      resourceType: 'EQUIPMENT',
      allocatedHours: 40,
      utilization: 80,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
    },
  })
  console.log('✓ Created sample resource allocation')

  // Create budget line
  await prisma.budgetLine.create({
    data: {
      projectId: project.id,
      category: 'Labor',
      description: 'Site workers',
      budgeted: 300000,
      spent: 0,
      committed: 50000,
    },
  })
  console.log('✓ Created sample budget line')

  // Create cashflow
  await prisma.cashflow.create({
    data: {
      projectId: project.id,
      date: new Date('2024-01-31'),
      type: 'OUTFLOW',
      category: 'Labor',
      description: 'January labor costs',
      forecast: 25000,
      actual: null,
    },
  })
  console.log('✓ Created sample cashflow')

  // Create an issue
  await prisma.issue.create({
    data: {
      projectId: project.id,
      issueNumber: 'ISS-001',
      title: 'Equipment breakdown',
      description: 'Excavator requires maintenance',
      status: 'OPEN',
      priority: 'HIGH',
      raisedBy: 'Site Engineer',
      raisedById: site.id,
      dueDate: new Date('2024-01-10'),
    },
  })
  console.log('✓ Created sample issue')

  // Create a decision
  const decision = await prisma.decision.create({
    data: {
      projectId: project.id,
      decisionNumber: 'DEC-001',
      title: 'Approve alternative foundation design',
      description: 'Decision on using alternative foundation method',
      status: 'PENDING',
      priority: 'HIGH',
    },
  })
  console.log('✓ Created sample decision')

  // Create an action
  await prisma.action.create({
    data: {
      projectId: project.id,
      decisionId: decision.id,
      actionNumber: 'ACT-001',
      title: 'Review alternative design',
      description: 'Review and approve alternative foundation design',
      status: 'OPEN',
      priority: 'HIGH',
      assignedToId: pm.id,
      dueDate: new Date('2024-01-15'),
    },
  })
  console.log('✓ Created sample action')

  // Create an RFI
  await prisma.rFI.create({
    data: {
      projectId: project.id,
      rfiNumber: 'RFI-001',
      title: 'Foundation depth clarification',
      description: 'Request clarification on exact foundation depth',
      status: 'OPEN',
      requestedBy: 'Site Engineer',
      requestedById: site.id,
      dueDate: new Date('2024-01-12'),
    },
  })
  console.log('✓ Created sample RFI')

  // Create a submittal
  const submittal = await prisma.submittal.create({
    data: {
      projectId: project.id,
      submittalNumber: 'SUB-001',
      title: 'Concrete mix design',
      description: 'Submit concrete mix design for approval',
      status: 'DRAFT',
      type: 'Product Data',
      submittedBy: 'Contractor',
    },
  })
  console.log('✓ Created sample submittal')

  // Create procurement
  await prisma.procurement.create({
    data: {
      projectId: project.id,
      poNumber: 'PO-001',
      vendor: 'Concrete Supplies Ltd',
      description: 'Concrete for foundation',
      status: 'REQUESTED',
      orderValue: 50000,
    },
  })
  console.log('✓ Created sample procurement')

  // Create attachment
  await prisma.attachment.create({
    data: {
      projectId: project.id,
      entityType: 'Submittal',
      entityId: submittal.id,
      fileName: 'concrete-mix-design.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      filePath: '/uploads/submittal/concrete-mix-design.pdf',
      uploadedById: pm.id,
    },
  })
  console.log('✓ Created sample attachment')

  // Create audit log
  await prisma.auditLog.create({
    data: {
      projectId: project.id,
      userId: pm.id,
      action: 'CREATE',
      entityType: 'Project',
      entityId: project.id,
      changes: {
        before: null,
        after: { name: project.name, status: 'PLANNING' },
      },
    },
  })
  console.log('✓ Created sample audit log')

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
