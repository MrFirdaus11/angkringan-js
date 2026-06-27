'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function rupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function formatDateInfo(dateStr: string) {
  const parts = dateStr.split('-')
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  return { dayName: dayNames[d.getDay()], full: d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear() }
}

interface DashboardData {
  tanggal: string
  revenue_today: number
  total_orders: number
  pending_orders: number
  pesanan: Array<{
    id: number
    nama_pemesan: string
    total_harga: number
    status_bayar: number
    created_at: string
    items: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [date, setDate] = useState(todayStr)
  const [search, setSearch] = useState('')

  const isToday = date === todayStr()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/dashboard?tanggal=' + date)
        if (res.status === 401) { router.push('/login'); return }
        const d = await res.json()
        if (!cancelled) setData(d)
      } catch {}
    }

    load()

    if (isToday) {
      const id = setInterval(load, 10000)
      return () => { cancelled = true; clearInterval(id) }
    }

    return () => { cancelled = true }
  }, [date, isToday, router])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard?tanggal=' + date)
      if (res.status === 401) { router.push('/login'); return }
      const d = await res.json()
      setData(d)
    } catch { }
  }, [date, router])

  function goToday() {
    setDate(todayStr())
  }

  async function toggleBayar(id: number) {
    await fetch('/api/order/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  async function hapusPesanan(id: number) {
    if (!confirm('Hapus pesanan ini?')) return
    await fetch('/api/order/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  const info = data ? formatDateInfo(data.tanggal) : null

  const filteredOrders = data?.pesanan.filter(p =>
    p.nama_pemesan.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <body className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-brand">
          <span className="brand-icon">🏮</span>
          <span>Angkringan Ajai</span>
        </div>
        <div className="dashboard-nav-menu">
          <a href="/dashboard" className="active">
            <span className="nav-icon">📋</span><span>Pesanan</span>
          </a>
          <a href="/menu">
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
        <div className="date-filter-bar">
          <div className="date-filter-group">
            <label htmlFor="filter-tanggal">📅 Pilih Tanggal</label>
            <div className="date-input-row">
              <input type="date" id="filter-tanggal" value={date}
                onChange={e => setDate(e.target.value)} />
              <button className="btn-today" id="btn-today" onClick={goToday}>Hari Ini</button>
            </div>
          </div>
          {info && (
            <div className="date-info" id="date-info">
              <span className="day-name" id="day-name">{info.dayName}</span>
              <span className="full-date" id="full-date">{info.full}</span>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-revenue">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-body">
              <div className="stat-label">{info ? 'Pendapatan ' + info.full : 'Pendapatan'}</div>
              <div className="stat-value revenue-value">{rupiah(data?.revenue_today || 0)}</div>
            </div>
          </div>
          <div className="stat-card stat-orders">
            <div className="stat-icon orders">📦</div>
            <div className="stat-body">
              <div className="stat-label">{info ? 'Total Pesanan ' + info.full : 'Total Pesanan'}</div>
              <div className="stat-value">{data?.total_orders || 0}</div>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-body">
              <div className="stat-label">{info ? 'Belum Bayar ' + info.full : 'Belum Bayar'}</div>
              <div className="stat-value">{data?.pending_orders || 0}</div>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h2>
            📋 Pesanan Masuk
            <span className="badge-count" id="order-count-badge">{data?.total_orders || 0}</span>
          </h2>
          {isToday && (
            <span className="auto-refresh-label">
              <span className="pulse-dot"></span>
              Auto-refresh tiap 10 detik
            </span>
          )}
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" className="search-input" placeholder="Cari nama pemesan..." autoComplete="off"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>No</th>
                <th style={{ width: 120 }}>Nama</th>
                <th>Pesanan</th>
                <th style={{ width: 100 }}>Total</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 70 }}>Aksi</th>
              </tr>
            </thead>
            <tbody id="orders-table-body">
              {!data ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Memuat data...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div>{search ? 'Tidak ada hasil untuk "' + search + '"' : 'Belum ada pesanan di tanggal ini'}</div>
                </td></tr>
              ) : (
                filteredOrders.map((p, i) => (
                  <tr key={p.id} className="table-row-animate" style={{ animationDelay: i * 0.05 + 's' }}>
                    <td>{i + 1}</td>
                    <td><strong>{p.nama_pemesan}</strong></td>
                    <td style={{ fontSize: 12, maxWidth: 200 }}>
                      {p.items.split(', ').map((item, idx) => <div key={idx}>{item}</div>)}
                    </td>
                    <td><span className="price-tag">{rupiah(p.total_harga)}</span></td>
                    <td>
                      <button className={'btn-toggle ' + (p.status_bayar ? 'paid' : 'unpaid')}
                        onClick={() => toggleBayar(p.id)}>
                        {p.status_bayar ? '✓ Lunas' : '○ Belum'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-action danger" onClick={() => hapusPesanan(p.id)}>🗑 Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </body>
  )
}
