import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { nama_pemesan, items } = await request.json()

    if (!nama_pemesan || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nama dan pesanan harus diisi' },
        { status: 400 }
      )
    }

    let total = 0
    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: item.menu_id } })
      if (!menu) {
        return NextResponse.json(
          { success: false, error: 'Menu tidak ditemukan' },
          { status: 400 }
        )
      }
      total += menu.harga * item.qty
    }

    const pesanan = await prisma.pesanan.create({
      data: {
        namaPemesan: nama_pemesan,
        totalHarga: total,
        detail: {
          create: items.map((item: { menu_id: number; qty: number }) => ({
            menuId: item.menu_id,
            qty: item.qty,
            subtotal: 0,
          })),
        },
      },
      include: { detail: true },
    })

    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: item.menu_id } })
      if (menu) {
        await prisma.detailPesanan.updateMany({
          where: { pesananId: pesanan.id, menuId: item.menu_id },
          data: { subtotal: menu.harga * item.qty },
        })
      }
    }

    return NextResponse.json({ success: true, pesanan_id: pesanan.id })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses pesanan' },
      { status: 500 }
    )
  }
}
