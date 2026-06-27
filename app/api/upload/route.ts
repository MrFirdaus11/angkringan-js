import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { requireAuth } from '@/lib/auth'
import path from 'path'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File terlalu besar (maks 5MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json({ success: false, error: 'Ekstensi tidak diizinkan' }, { status: 400 })
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Tipe file tidak diizinkan' }, { status: 400 })
    }

    const safeName = crypto.randomUUID() + '.' + ext
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'menu')
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    return NextResponse.json({ success: true, filename: safeName })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: 'Gagal upload file' }, { status: 500 })
  }
}
