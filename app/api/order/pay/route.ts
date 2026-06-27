import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah status' },
      { status: 500 }
    )
  }
}
