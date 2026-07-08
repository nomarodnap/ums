const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../lib/generated/prisma');

const pool = new Pool({ connectionString: "postgresql://tong:qwerqwer1234@192.168.171.98:5432/ums" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const utilityTypes = [
    {
      code: '5104020101',
      name_th: 'ค่าไฟฟ้า',
      name_en: 'Electricity',
      unit: 'หน่วย (kWh)',
      icon: 'zap',
      color: 'chart-1'
    },
    {
      code: '5104020103',
      name_th: 'ค่าประปา&น้ำบาดาล',
      name_en: 'Water Supply',
      unit: 'ลูกบาศก์เมตร',
      icon: 'droplet',
      color: 'chart-2'
    },
    {
      code: '5104020105',
      name_th: 'ค่าโทรศัพท์',
      name_en: 'Telephone',
      unit: 'นาที',
      icon: 'phone',
      color: 'chart-3'
    },
    {
      code: '5104020106',
      name_th: 'ค่าสื่อสาร&โทรคมนาคม',
      name_en: 'Communication',
      unit: 'เดือน',
      icon: 'wifi',
      color: 'chart-4'
    },
    {
      code: '5104020107',
      name_th: 'ค่าบริการไปรษณีย์',
      name_en: 'Postal Services',
      unit: 'ชิ้น',
      icon: 'mail',
      color: 'chart-5'
    }
  ];

  for (const ut of utilityTypes) {
    await prisma.utility_types.upsert({
      where: { code: ut.code },
      update: ut,
      create: ut
    });
  }
  
  console.log('Seed 5 utility types successfully!');
}

main()
  .catch(e => {
    console.error('Error seeding utility types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
