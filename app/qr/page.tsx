'use client'

import { useState } from 'react'

export default function QRPage() {
  const [url] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin + '/' : ''
  )

  return (
    <body className="qr-page" style={{ background: 'var(--bg)' }}>
      <div className="qr-card">
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏮</div>
        <h1>Angkringan Ajai</h1>
        <p>Scan QR untuk pesan online</p>

        {url && (
          <img
            src={'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(url)}
            alt="QR Code"
            className="qr-img"
            id="qr-img"
            onError={(e) => {
              const target = e.currentTarget
              target.parentElement!.innerHTML += '<div style="color:#FF5252;margin-top:12px;font-size:13px">Gagal memuat QR. Coba refresh halaman.</div>'
            }}
          />
        )}

        <div className="qr-url">{url}</div>

        <button className="btn-cetak no-print" onClick={() => window.print()}>
          🖨 Cetak QR
        </button>
      </div>
    </body>
  )
}
