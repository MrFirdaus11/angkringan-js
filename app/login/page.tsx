'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) router.push('/dashboard')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Username atau password salah!')
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <body className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="login-card">
        <div className="login-icon">🏮</div>
        <h1>Angkringan Ajai</h1>
        <p>Dashboard Penjual</p>

        <div className={'login-error' + (error ? ' show' : '')} id="login-error">
          {error || ''}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <span className="form-icon">👤</span>
              <input type="text" name="username" placeholder="Masukkan username" required
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <span className="form-icon">🔒</span>
              <input type="password" name="password" placeholder="Masukkan password" required
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            <span>{loading ? 'Memproses...' : 'Masuk'}</span>
            <span className="btn-arrow">→</span>
          </button>
        </form>
      </div>
    </body>
  )
}
