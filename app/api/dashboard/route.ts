import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    let tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0]

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      tanggal = new Date().toISOString().split('T')[0]
    }

    const [y, m, d] = tanggal.split('-').map(Number)
    const tzOffset = parseInt(searchParams.get('tz') || '0')

    const startDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0))
    startDate.setUTCMinutes(startDate.getUTCMinutes() + tzOffset)

    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

    const [revenueResult, totalOrdersResult, pendingOrdersResult, pesanan] =
      await Promise.all([
        prisma.pesanan.aggregate({
          _sum: { totalHarga: true },
          where: {
            createdAt: { gte: startDate, lte: endDate },
            statusBayar: 1,
          },
        }),
        prisma.pesanan.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        prisma.pesanan.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            statusBayar: 0,
          },
        }),
        prisma.pesanan.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          include: {
            detail: {
              include: { menu: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

    const pesananFormatted = pesanan.map((p: {
      id: number; namaPemesan: string; totalHarga: number; statusBayar: number; createdAt: Date;
      detail: Array<{ qty: number; menu: { nama: string } }>
    }) => ({
      id: p.id,
      nama_pemesan: p.namaPemesan,
      total_harga: p.totalHarga,
      status_bayar: p.statusBayar,
      created_at: p.createdAt.toISOString(),
      items: p.detail
        .map((d) => `${d.menu.nama} (${d.qty})`)
        .join(', '),
    }))

    return NextResponse.json({
      tanggal,
      revenue_today: revenueResult._sum.totalHarga || 0,
      total_orders: totalOrdersResult,
      pending_orders: pendingOrdersResult,
      pesanan: pesananFormatted,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 })
  }
}
