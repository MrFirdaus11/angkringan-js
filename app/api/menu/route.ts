import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kategori = searchParams.get('kategori')
  const all = searchParams.get('all')

  const where: Record<string, unknown> = {}
  if (kategori && ['makanan', 'minuman'].includes(kategori)) {
    where.kategori = kategori
  }

  const menu = await prisma.menu.findMany({
    where: all ? {} : where,
    orderBy: [{ kategori: 'asc' }, { nama: 'asc' }],
  })

  return NextResponse.json(menu)
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { nama, kategori, harga, foto } = await request.json()

    if (!nama || !kategori || !harga) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    await prisma.menu.create({
      data: { nama, kategori, harga: parseInt(harga), foto: foto || null },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Gagal menambah menu' }, { status: 500 })
  }
}
