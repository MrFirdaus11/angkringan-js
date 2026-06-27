import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const filename = formData.get('filename') as string | null

    if (!file || !filename) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 })
    }

    const ext = filename.split('.').pop()?.toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json({ success: false, error: 'Ekstensi tidak diizinkan' }, { status: 400 })
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Tipe file tidak diizinkan' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'menu')
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({ success: true, filename })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal upload file' }, { status: 500 })
  }
}
