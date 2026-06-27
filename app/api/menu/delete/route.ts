import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      )
    }

    const used = await prisma.detailPesanan.count({ where: { menuId: id } })
    if (used > 0) {
      return NextResponse.json(
        { success: false, error: 'Menu sedang digunakan di pesanan, tidak bisa dihapus' },
        { status: 400 }
      )
    }

    const menu = await prisma.menu.findUnique({ where: { id } })
    if (menu?.foto) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'menu', path.basename(menu.foto))
        await unlink(filePath)
      } catch { }
    }

    await prisma.menu.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus menu' },
      { status: 500 }
    )
  }
}
