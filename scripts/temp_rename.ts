import { prisma } from '../lib/db'

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users RENAME COLUMN short_name TO short_name;`)
    console.log("Renamed successfully")
  } catch (error) {
    console.error("Error:", error)
  }
}

main().finally(() => prisma.$disconnect())
