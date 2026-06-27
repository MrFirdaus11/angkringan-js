import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      )
    }

    await prisma.pesanan.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus' },
      { status: 500 }
    )
  }
}
