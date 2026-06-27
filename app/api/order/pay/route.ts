import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesanan tidak valid' },
        { status: 400 }
      )
    }

    const pesanan = await prisma.pesanan.findUnique({ where: { id } })
    if (!pesanan) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.pesanan.update({
      where: { id },
      data: { statusBayar: pesanan.statusBayar === 1 ? 0 : 1 },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah status' },
      { status: 500 }
    )
  }
}
