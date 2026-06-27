'use client'

import { useState, useEffect, useCallback } from 'react'

interface MenuItem {
  id: number
  nama: string
  kategori: string
  harga: number
  foto: string | null
}

interface CartItem extends MenuItem {
  qty: number
}

function rupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function CustomerPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Record<number, CartItem>>({})
  const [kategori, setKategori] = useState('semua')
  const [nama, setNama] = useState('')
  const [toast, setToast] = useState('')
  const [toastError, setToastError] = useState(false)
  const [sending, setSending] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const url = kategori !== 'semua' ? '/api/menu?kategori=' + kategori : '/api/menu?all=1'
    fetch(url).then(r => r.json()).then(setMenu)
  }, [kategori])

  const showToast = useCallback((msg: string, isError = false) => {
    setToast(msg)
    setToastError(isError)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const cartItems = Object.values(cart).filter(i => i.qty > 0)
  const total = cartItems.reduce((s, i) => s + i.harga * i.qty, 0)
  const count = cartItems.reduce((s, i) => s + i.qty, 0)

  function addToCart(id: number) {
    setCart(prev => {
      const item = menu.find(m => m.id === id)
      if (!item) return prev
      const existing = prev[id]
      return { ...prev, [id]: { ...item, qty: (existing?.qty || 0) + 1 } }
    })
    setCartOpen(true)
  }

  function changeQty(id: number, delta: number) {
    setCart(prev => {
      const item = prev[id]
      if (!item) return prev
      const newQty = item.qty + delta
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev
        if (Object.keys(rest).length === 0) setCartOpen(false)
        return rest
      }
      return { ...prev, [id]: { ...item, qty: newQty } }
    })
  }

  async function submitOrder() {
    if (!nama.trim() || cartItems.length === 0) return
    setSending(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pemesan: nama,
          items: cartItems.map(i => ({ menu_id: i.id, qty: i.qty })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Pesanan berhasil dikirim!')
        setCart({})
        setNama('')
        setCartOpen(false)
      } else {
        showToast('❌ ' + (data.error || 'Gagal memesan'), true)
      }
    } catch {
      showToast('❌ Gagal terhubung ke server', true)
    } finally {
      setSending(false)
    }
  }

  return (
    <body className="customer-page">
      <header className="hero">
        <div className="hero-particles">
          {Array.from({ length: 10 }).map((_, i) => <span key={i}></span>)}
        </div>
        <div className="hero-content">
          <div className="hero-icon">🏮</div>
          <h1>Angkringan Ajai</h1>
          <p>Pesan makanan & minuman, langsung dibuatkan!</p>
        </div>
      </header>

      <div className="nama-section">
        <div className="nama-card">
          <label>Atas Nama</label>
          <div className="nama-input-wrapper">
            <span className="input-icon">👤</span>
            <input type="text" id="nama_pemesan" placeholder="Masukkan nama kamu..." autoComplete="off"
              value={nama} onChange={e => setNama(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="kategori-tabs">
        {[
          { key: 'semua', icon: '🍽', label: 'Semua' },
          { key: 'makanan', icon: '🍜', label: 'Makanan' },
          { key: 'minuman', icon: '🥤', label: 'Minuman' },
        ].map(t => (
          <button key={t.key}
            className={'tab' + (kategori === t.key ? ' active' : '')}
            onClick={() => setKategori(t.key)}>
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="menu-grid" id="menu-grid">
        {menu.map((item, index) => (
          <div key={item.id} className="menu-card"
            onClick={() => addToCart(item.id)}
            style={{ animationDelay: index * 0.05 + 's' }}>
            {item.foto ? (
              <div className="menu-img-wrapper">
                <img src={'/uploads/menu/' + item.foto} alt={item.nama}
                  className="menu-img" loading="lazy" />
                <div className="menu-img-overlay"></div>
              </div>
            ) : (
              <div className={'menu-img-placeholder ' + item.kategori}>
                <span className="placeholder-emoji">
                  {item.kategori === 'makanan' ? '🍜' : '🥤'}
                </span>
              </div>
            )}
            <div className="menu-info">
              <div className="menu-nama">{item.nama}</div>
              <div className="menu-card-footer">
                <div className="menu-harga">{rupiah(item.harga)}</div>
                <button className="menu-tambah"
                  onClick={e => { e.stopPropagation(); addToCart(item.id) }}
                  aria-label={'Tambah ' + item.nama}>
                  <span className="tambah-icon">+</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {menu.length === 0 && (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="menu-card skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className={'floating-cart' + (cartOpen ? ' open' : '')} id="floating-cart">
        <div className="cart-handle" onClick={() => { if (count > 0) setCartOpen(!cartOpen) }}></div>
        <div className="cart-header" onClick={() => { if (count > 0) setCartOpen(!cartOpen) }}>
          <div className="cart-header-left">
            <span className="cart-icon-wrapper">🛒</span>
            <span>Pesanan Saya</span>
          </div>
          <span className={'cart-count' + (count > 0 ? ' pulse' : '')} id="cart-count">{count}</span>
        </div>
        <div className="cart-items" id="cart-items">
          {cartItems.length === 0 ? (
            <p className="cart-empty">Belum ada pesanan</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-nama">{item.nama}</div>
                  <div className="cart-item-harga">{rupiah(item.harga)}</div>
                </div>
                <div className="cart-item-qty">
                  <button className="qty-btn minus" onClick={() => changeQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn plus" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
                <div className="cart-item-subtotal">{rupiah(item.harga * item.qty)}</div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">Total Pembayaran</span>
            <span className="cart-total-value" id="cart-total">{rupiah(total)}</span>
          </div>
          <button className="btn-pesan" id="btn-pesan"
            disabled={count === 0 || !nama.trim() || sending}
            onClick={submitOrder}>
            <span className="btn-pesan-icon">{sending ? '⏳' : '🚀'}</span>
            <span>{sending ? 'Mengirim...' : 'Pesan Sekarang'}</span>
          </button>
        </div>
      </div>

      <div className={'cart-overlay' + (cartOpen ? ' show' : '')}
        onClick={() => { setCartOpen(false) }}></div>

      {toast && (
        <div className={'toast' + (toast ? ' show' : '') + (toastError ? ' error' : '')}>
          {toast}
        </div>
      )}
    </body>
  )
}
