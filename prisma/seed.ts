import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
    },
  })

  const menuItems = [
    { nama: 'Nasi Kucing', kategori: 'makanan', harga: 3000 },
    { nama: 'Sate Telur Puyuh', kategori: 'makanan', harga: 1000 },
    { nama: 'Sate Usus', kategori: 'makanan', harga: 1000 },
    { nama: 'Tahu Goreng', kategori: 'makanan', harga: 2000 },
    { nama: 'Tempe Goreng', kategori: 'makanan', harga: 2000 },
    { nama: 'Mie Goreng', kategori: 'makanan', harga: 5000 },
    { nama: 'Cilok', kategori: 'makanan', harga: 3000 },
    { nama: 'Batagor', kategori: 'makanan', harga: 5000 },
    { nama: 'Tahu Bulat', kategori: 'makanan', harga: 2000 },
    { nama: 'Pisang Goreng', kategori: 'makanan', harga: 3000 },
    { nama: 'Es Teh', kategori: 'minuman', harga: 3000 },
    { nama: 'Teh Hangat', kategori: 'minuman', harga: 2000 },
    { nama: 'Es Jeruk', kategori: 'minuman', harga: 4000 },
    { nama: 'Jeruk Hangat', kategori: 'minuman', harga: 3000 },
    { nama: 'Kopi Hitam', kategori: 'minuman', harga: 3000 },
    { nama: 'Kopi Susu', kategori: 'minuman', harga: 5000 },
    { nama: 'Jahe Hangat', kategori: 'minuman', harga: 3000 },
    { nama: 'Susu Jahe', kategori: 'minuman', harga: 5000 },
    { nama: 'Es Campur', kategori: 'minuman', harga: 5000 },
    { nama: 'Wedang Ronde', kategori: 'minuman', harga: 5000 },
  ]

  for (const item of menuItems) {
    await prisma.menu.create({ data: item })
  }

  console.log('Seed berhasil!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
