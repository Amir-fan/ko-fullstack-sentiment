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
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src="/images/logo2024-1024x252.png" alt="Konuşarak Öğren" style={{height:28}} />
          <strong style={{color:'#1e3a8a'}}>Konuşarak Öğren • Sentiment Chat</strong>
        </div>
        <span style={styles.nickname}>@{user.nickname}</span>
      </header>
      <div style={styles.messages}>
        {messages.map((m) => (
          <div key={m.id} style={styles.messageRow}>
            <span style={styles.messageText}>{m.text}</span>
            <small style={{...styles.sentimentTag, ...(m.sentiment?.label === 'positive' ? styles.positive : m.sentiment?.label === 'negative' ? styles.negative : styles.neutral)}}>
              {m.sentiment?.label} {typeof m.sentiment?.score === 'number' ? `(${m.sentiment.score.toFixed(2)})` : ''}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={styles.compose}>
        <input
          style={styles.input}
          placeholder="Mesaj yazın"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button style={styles.button} type="submit" disabled={sending}>Gönder</button>
      </form>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  )
}

const styles = {
  page: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #eee' },
  nickname: { opacity: 0.7, fontSize: 12 },
  messages: { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 300, border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, background: '#fafafa' },
  messageRow: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' },
  messageText: { fontSize: 14 },
  sentimentTag: { fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#eee' },
  positive: { background: '#e8fff1', color: '#0a7a3e' },
  negative: { background: '#ffecec', color: '#b11616' },
  neutral: { background: '#f1f1f1', color: '#555' },
  compose: { display: 'flex', gap: 8 },
  input: { flex: 1, border: '1px solid #ccc', borderRadius: 6, padding: '8px 10px' },
  button: { background: '#1e3a8a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' },
  error: { color: 'red' },
}


