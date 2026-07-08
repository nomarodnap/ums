const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../lib/generated/prisma');

const pool = new Pool({ connectionString: "postgresql://tong:qwerqwer1234@192.168.171.98:5432/ums" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    {
      email: 'admin@fisheries.go.th',
      password_hash: '$2b$10$2L947vvhtpn4nXwJtv5GFOOjTU3HyXmDOCC9/acrTRKamYy2i5rwG', // admin123
      short_name: 'ผู้ดูแลระบบ',
      department: 'สำนักบริหารทั่วไป',
      role: 'ADMIN',
      cost_center: '00000',
      status: 'VERIFIED',
      is_active: true
    },
    {
      email: 'staff@fisheries.go.th',
      password_hash: '$2b$10$bWrpjl.oCts1GVgVLJR5U.1vMz0V.4dMM.PSStQj5wDff7DXOZxzO', // staff123
      short_name: 'สมชาย ใจดี',
      department: 'กลุ่มงานการเงินและบัญชี',
      role: 'STAFF',
      cost_center: '00001',
      status: 'VERIFIED',
      is_active: true
    },
    {
      email: 'user@fisheries.go.th',
      password_hash: '$2b$10$P497bVwGROrW7S7258FUd.8lSMtD6rhNfBsZAlt2cbv1Q7dLxwA0O', // user123
      short_name: 'สมหญิง ขยันงาน',
      department: 'กลุ่มงานพัสดุ',
      role: 'USER',
      cost_center: '00002',
      status: 'VERIFIED',
      is_active: true
    }
  ];

  for (const u of users) {
    const payload = { ...u, updated_at: new Date() };
    await prisma.users.upsert({
      where: { email: u.email },
      update: payload,
      create: payload
    });
  }
  console.log('Seed 3 users successfully!');
}

main()
  .catch(e => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
