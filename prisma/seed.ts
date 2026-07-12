import { PrismaClient, Role, Status, ApprovalStatus, ChallengeStatus, Difficulty, Severity, IssueStatus, CategoryType } from '@prisma/client'

const prisma = new PrismaClient()

// Dummy bcrypt hash for 'password123'
const dummyPassword = '$2b$10$vK1frHcSboUGHsCtHKpFO.KHN8YFrPezxhJpKn04R58.OqTr.gkKm' // Note: This is an actual valid bcrypt hash for 'password123'

async function main() {
  console.log('Seeding database...')

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'EcoCorp Inc.',
      weightEnv: 40,
      weightSocial: 30,
      weightGov: 30,
    }
  })

  // 2. Departments
  const eng = await prisma.department.create({ data: { name: 'Engineering', code: 'ENG', employeeCount: 50 } })
  const ops = await prisma.department.create({ data: { name: 'Operations', code: 'OPS', employeeCount: 80 } })
  const hr = await prisma.department.create({ data: { name: 'Human Resources', code: 'HR', employeeCount: 15 } })
  const mkt = await prisma.department.create({ data: { name: 'Marketing', code: 'MKT', employeeCount: 25 } })

  // 3. Users
  const admin = await prisma.user.create({ data: { name: 'Alice Admin', email: 'admin@ecocorp.com', passwordHash: dummyPassword, role: Role.ADMIN } })
  const mgrEng = await prisma.user.create({ data: { name: 'Bob Manager', email: 'bob@ecocorp.com', passwordHash: dummyPassword, role: Role.MANAGER, departmentId: eng.id } })
  const mgrOps = await prisma.user.create({ data: { name: 'Charlie Manager', email: 'charlie@ecocorp.com', passwordHash: dummyPassword, role: Role.MANAGER, departmentId: ops.id } })
  const auditor = await prisma.user.create({ data: { name: 'Diana Auditor', email: 'diana@ecocorp.com', passwordHash: dummyPassword, role: Role.AUDITOR } })
  
  const employees = []
  for (let i = 1; i <= 11; i++) {
    const dept = i % 2 === 0 ? eng.id : ops.id
    const emp = await prisma.user.create({
      data: {
        name: `Employee ${i}`,
        email: `emp${i}@ecocorp.com`,
        passwordHash: dummyPassword,
        role: Role.EMPLOYEE,
        departmentId: dept,
        xp: Math.floor(Math.random() * 500)
      }
    })
    employees.push(emp)
  }

  // 4. Emission Factors
  const efDiesel = await prisma.emissionFactor.create({ data: { name: 'Diesel (fleet)', scope: 'Scope 1', unit: 'L', factor: 2.68, keywords: ['diesel', 'fuel', 'truck'] } })
  const efElec = await prisma.emissionFactor.create({ data: { name: 'Grid Electricity', scope: 'Scope 2', unit: 'kWh', factor: 0.35, keywords: ['electricity', 'power'] } })
  const efPaper = await prisma.emissionFactor.create({ data: { name: 'Office Paper', scope: 'Scope 3', unit: 'kg', factor: 0.9, keywords: ['paper', 'printing'] } })
  const efFlight = await prisma.emissionFactor.create({ data: { name: 'Business Flights', scope: 'Scope 3', unit: 'km', factor: 0.15, keywords: ['flight', 'air travel', 'plane'] } })
  const efGas = await prisma.emissionFactor.create({ data: { name: 'Natural Gas', scope: 'Scope 1', unit: 'kWh', factor: 0.2, keywords: ['gas', 'heating'] } })
  const efWaste = await prisma.emissionFactor.create({ data: { name: 'General Waste', scope: 'Scope 3', unit: 'kg', factor: 0.5, keywords: ['waste', 'trash'] } })

  // 5. Carbon Transactions
  for (let i = 0; i < 20; i++) {
    const isEng = i % 2 === 0
    await prisma.carbonTransaction.create({
      data: {
        source: ['PURCHASE', 'EXPENSE', 'FLEET'][i % 3],
        description: `Carbon Entry ${i}`,
        quantity: 100 + i * 10,
        emissionFactorId: isEng ? efElec.id : efDiesel.id,
        co2e: (100 + i * 10) * (isEng ? efElec.factor : efDiesel.factor),
        departmentId: isEng ? eng.id : ops.id,
      }
    })
  }

  // 6. Goals
  await prisma.environmentalGoal.create({ data: { title: 'Reduce Data Center Energy', metric: 'kWh', baseline: 10000, target: 8000, current: 9500, deadline: new Date('2026-12-31'), departmentId: eng.id } })
  await prisma.environmentalGoal.create({ data: { title: 'Fleet Electrification', metric: 'Diesel L', baseline: 5000, target: 1000, current: 4000, deadline: new Date('2027-06-30'), departmentId: ops.id } })
  await prisma.environmentalGoal.create({ data: { title: 'Paperless Office', metric: 'kg paper', baseline: 500, target: 50, current: 200, deadline: new Date('2026-09-30') } })

  // 7. Policies
  const pol1 = await prisma.eSGPolicy.create({ data: { title: 'Code of Conduct', body: 'Standard code of conduct...', mandatory: true } })
  const pol2 = await prisma.eSGPolicy.create({ data: { title: 'Supplier Diversity', body: 'We prioritize diverse suppliers...', mandatory: true } })
  const pol3 = await prisma.eSGPolicy.create({ data: { title: 'Remote Work Policy', body: 'Remote work guidelines...', mandatory: false } })

  // Acks
  await prisma.policyAcknowledgement.create({ data: { policyId: pol1.id, employeeId: employees[0].id } })
  await prisma.policyAcknowledgement.create({ data: { policyId: pol2.id, employeeId: employees[0].id } })
  await prisma.policyAcknowledgement.create({ data: { policyId: pol1.id, employeeId: employees[1].id } })

  // 8. Categories
  const catCsr = await prisma.category.create({ data: { name: 'Volunteering', type: CategoryType.CSR_ACTIVITY } })
  const catChal = await prisma.category.create({ data: { name: 'Eco Habits', type: CategoryType.CHALLENGE } })

  // 9. CSR Activities
  const csr1 = await prisma.cSRActivity.create({ data: { title: 'Beach Cleanup', description: 'Clean local beach', points: 50, date: new Date(), categoryId: catCsr.id } })
  const csr2 = await prisma.cSRActivity.create({ data: { title: 'Food Bank', description: 'Serve food', points: 30, date: new Date(), categoryId: catCsr.id } })
  
  await prisma.employeeParticipation.create({ data: { employeeId: employees[0].id, activityId: csr1.id, approval: ApprovalStatus.APPROVED, pointsEarned: 50 } })
  await prisma.employeeParticipation.create({ data: { employeeId: employees[1].id, activityId: csr1.id, approval: ApprovalStatus.PENDING } })

  // 10. Challenges
  const cActive = await prisma.challenge.create({ data: { title: 'Bike to Work', description: 'Commute via bike', xp: 100, difficulty: Difficulty.MEDIUM, deadline: new Date('2026-08-01'), status: ChallengeStatus.ACTIVE, categoryId: catChal.id } })
  const cDraft = await prisma.challenge.create({ data: { title: 'Meatless Mondays', description: 'No meat', xp: 50, difficulty: Difficulty.EASY, deadline: new Date('2026-10-01'), status: ChallengeStatus.DRAFT, categoryId: catChal.id } })
  
  await prisma.challengeParticipation.create({ data: { challengeId: cActive.id, employeeId: employees[0].id, progress: 100, approval: ApprovalStatus.APPROVED, xpAwarded: 100 } })

  // 11. Audits & Issues (crucial for demo)
  const audit = await prisma.audit.create({ data: { title: 'Q3 ESG Compliance', scope: 'Engineering', auditorId: auditor.id, date: new Date() } })
  
  // Overdue issue for Engineering (important for Advisor AI prompt)
  await prisma.complianceIssue.create({
    data: {
      auditId: audit.id,
      severity: Severity.HIGH,
      description: 'Missing supplier carbon reports in contractor portal',
      ownerId: mgrEng.id,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      status: IssueStatus.OPEN,
      overdue: true
    }
  })
  
  // Open issue, not overdue
  await prisma.complianceIssue.create({
    data: {
      auditId: audit.id,
      severity: Severity.MEDIUM,
      description: 'Incomplete employee diversity survey',
      ownerId: mgrEng.id, // wait, hr is department. We need a user. Let's use mgrEng for simplicity
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: IssueStatus.OPEN,
    }
  })
  // Let's re-assign to mgrOps
  await prisma.complianceIssue.updateMany({ where: { description: 'Incomplete employee diversity survey' }, data: { ownerId: mgrOps.id } })

  // 12. Badges
  await prisma.badge.create({ data: { name: 'Eco Warrior', description: 'Complete 5 eco habits', icon: '🌿', unlockRule: { type: "CHALLENGES_COMPLETED", threshold: 5 } } })
  await prisma.badge.create({ data: { name: 'Carbon Saver', description: 'Earn 1000 XP', icon: '⚡', unlockRule: { type: "XP", threshold: 1000 } } })

  // 13. Rewards
  await prisma.reward.create({ data: { name: '$10 Coffee Card', description: 'Gift card', pointsRequired: 100, stock: 50 } })
  await prisma.reward.create({ data: { name: 'Extra PTO Day', description: '1 day off', pointsRequired: 500, stock: 5 } })

  // 14. Department Scores
  await prisma.departmentScore.create({ data: { departmentId: eng.id, envScore: 65, socialScore: 80, govScore: 40, totalScore: 61 } }) // low gov score for the demo
  await prisma.departmentScore.create({ data: { departmentId: ops.id, envScore: 45, socialScore: 70, govScore: 90, totalScore: 68 } })
  await prisma.departmentScore.create({ data: { departmentId: hr.id, envScore: 80, socialScore: 95, govScore: 85, totalScore: 86 } })
  await prisma.departmentScore.create({ data: { departmentId: mkt.id, envScore: 75, socialScore: 85, govScore: 90, totalScore: 83 } })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
