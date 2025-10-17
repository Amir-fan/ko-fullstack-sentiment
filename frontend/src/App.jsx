import React, { useEffect, useMemo, useState } from 'react'

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function NicknameGate({ onReady }) {
  const [nickname, setNickname] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    const name = nickname.trim()
    if (!name) {
      setError('Lütfen bir rumuz giriniz.')
      return
    }
    setPending(true)
    try {
      const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: name }),
      })
      if (!res.ok) throw new Error('Kayıt başarısız')
      const data = await res.json()
      localStorage.setItem('userId', String(data.userId))
      localStorage.setItem('nickname', data.nickname)
      onReady({ userId: data.userId, nickname: data.nickname })
    } catch (err) {
      console.error(err)
      setError('Kayıt edilemedi. Tekrar deneyiniz.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Rumuz"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button type="submit" disabled={pending}>Giriş</button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </form>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('userId')
    const nickname = localStorage.getItem('nickname')
    return id ? { userId: Number(id), nickname } : null
  })
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const res = await fetch(`${apiBase}/messages?userId=${user.userId}`)
        if (!res.ok) return
        const data = await res.json()
        setMessages(data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [user])

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    const content = text.trim()
    if (!content || !user) return
    setSending(true)
    try {
      const res = await fetch(`${apiBase}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, text: content }),
      })
      if (!res.ok) throw new Error('Gönderilemedi')
      const saved = await res.json()
      setMessages((prev) => [...prev, saved])
      setText('')
    } catch (err) {
      console.error(err)
      setError('Gönderilemedi. Tekrar deneyiniz.')
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h3>KO Sentiment Chat</h3>
        <NicknameGate onReady={setUser} />
      </div>
    )
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3>Merhaba, {user.nickname}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 200, border: '1px solid #ccc', padding: 8 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span>{m.text}</span>
            <small style={{ opacity: 0.7 }}>{m.sentiment?.label} ({typeof m.sentiment?.score === 'number' ? m.sentiment.score.toFixed(2) : '-'})</small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Mesaj yazın"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={sending}>Gönder</button>
      </form>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  )
}


