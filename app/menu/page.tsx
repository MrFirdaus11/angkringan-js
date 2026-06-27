'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function rupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

interface MenuItem {
  id: number
  nama: string
  kategori: string
  harga: number
  foto: string | null
}

export default function MenuPage() {
  const router = useRouter()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [nama, setNama] = useState('')
  const [kategori, setKategori] = useState('makanan')
  const [harga, setHarga] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/menu?all=1').then(r => {
      if (r.status === 401) { router.push('/login'); return }
      return r.json()
    }).then(setMenu).catch(() => router.push('/login'))
  }, [router])

  async function loadMenu() {
    const res = await fetch('/api/menu?all=1')
    const data = await res.json()
    setMenu(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess('')

      let foto: string | null = null
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        if (file.type.startsWith('image/')) {
          const formData = new FormData()
          formData.append('file', file)
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
          const uploadData = await uploadRes.json()
          if (uploadData.filename) foto = uploadData.filename
        }
      }
    }

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, kategori, harga: parseInt(harga), foto }),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess('Menu berhasil ditambahkan!')
      setNama('')
      setHarga('')
      setFile(null)
      loadMenu()
    }
    setSaving(false)
  }

  async function hapusMenu(id: number) {
    if (!confirm('Hapus menu ini?')) return
    const res = await fetch('/api/menu/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.success) {
      loadMenu()
    } else {
      alert(data.error || 'Gagal menghapus')
    }
  }

  return (
    <body className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-brand">
          <span className="brand-icon">🏮</span>
          <span>Angkringan Ajai</span>
        </div>
        <div className="dashboard-nav-menu">
          <a href="/dashboard">
            <span className="nav-icon">📋</span><span>Pesanan</span>
          </a>
          <a href="/menu" className="active">
            <span className="nav-icon">🍽</span><span>Menu</span>
          </a>
          <a href="/qr" target="_blank">
            <span className="nav-icon">📱</span><span>QR</span>
          </a>
          <a href="/api/auth/logout" className="nav-logout"
            onClick={async (e) => { e.preventDefault(); await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }}>
            <span className="nav-icon">🚪</span><span>Keluar</span>
          </a>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="section-header">
          <h2>🍽 Atur Menu</h2>
        </div>

        <div className="menu-management">
          <div className="menu-form-card">
            <h3><span className="form-title-icon">➕</span>Tambah Menu Baru</h3>
            {success && <div className="alert-success">✅ {success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Menu</label>
                <input type="text" name="nama" placeholder="Contoh: Nasi Kucing" required
                  value={nama} onChange={e => setNama(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select name="kategori" required value={kategori}
                  onChange={e => setKategori(e.target.value)}>
                  <option value="makanan">🍜 Makanan</option>
                  <option value="minuman">🥤 Minuman</option>
                </select>
              </div>
              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" name="harga" placeholder="Contoh: 5000" min={0} required
                  value={harga} onChange={e => setHarga(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Foto (opsional)</label>
                <input type="file" name="foto" accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <button type="submit" name="simpan" className="btn-submit" disabled={saving}>
                <span>💾</span>
                <span>{saving ? 'Menyimpan...' : 'Simpan Menu'}</span>
              </button>
            </form>
          </div>

          <div className="menu-table-card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Foto</th>
                    <th>Nama</th>
                    <th style={{ width: 90 }}>Kategori</th>
                    <th style={{ width: 90 }}>Harga</th>
                    <th style={{ width: 70 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody id="menu-table-body">
                  {menu.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                      {menu === null ? 'Memuat data...' : 'Belum ada menu'}
                    </td></tr>
                  ) : (
                    menu.map((item, i) => (
                      <tr key={item.id} className="table-row-animate" style={{ animationDelay: i * 0.03 + 's' }}>
                        <td>
                          {item.foto ? (
                            <img src={'/uploads/menu/' + item.foto} className="menu-thumb" alt={item.nama} />
                          ) : (
                            <div className="menu-thumb-placeholder"
                              style={{ background: item.kategori === 'makanan' ? 'rgba(255,107,53,0.15)' : 'rgba(100,181,246,0.15)' }}>
                              {item.kategori === 'makanan' ? '🍜' : '🥤'}
                            </div>
                          )}
                        </td>
                        <td><strong>{item.nama}</strong></td>
                        <td>
                          <span className={'badge ' + (item.kategori === 'makanan' ? 'badge-success' : 'badge-danger')}>
                            {item.kategori}
                          </span>
                        </td>
                        <td><span className="price-tag">{rupiah(item.harga)}</span></td>
                        <td>
                          <button className="btn-action danger" onClick={() => hapusMenu(item.id)}>🗑 Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </body>
  )
}
