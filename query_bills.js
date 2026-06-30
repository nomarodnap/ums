const { prisma } = require('./lib/db')

async function main() {
  const count = await prisma.utility_bills.count()
  console.log('Total bills in DB:', count)
  
  const sample = await prisma.utility_bills.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  })
  console.log('Recent 5 bills:', JSON.stringify(sample, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
