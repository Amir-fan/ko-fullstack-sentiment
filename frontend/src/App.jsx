import React, { useEffect, useMemo, useState } from 'react'
import logo from '../images/ko-logo.png'

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
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`Kayit basarisiz: ${res.status} ${errText}`)
      }
      const data = await res.json()
      localStorage.setItem('userId', String(data.userId))
      localStorage.setItem('nickname', data.nickname)
      onReady({ userId: data.userId, nickname: data.nickname })
    } catch (err) {
      console.error('register_error', err)
      setError('Kayit edilemedi. Lutfen tekrar deneyiniz.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="field">
      <input
        className="input"
        placeholder="Rumuz"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Bekleyin...' : 'Giris'}</button>
      {error && <span className="error">{error}</span>}
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

  function handleLogout() {
    try {
      localStorage.removeItem('userId')
      localStorage.removeItem('nickname')
    } catch {}
    setMessages([])
    setUser(null)
  }

  if (!user) {
    return (
      <div className="app" style={{alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>
        <div className="card">
          <div className="brand" style={{marginBottom:12}}>
            <img src={logo} alt="Konuşarak Öğren" style={{height:36}} />
            <div>
              <div className="card-title">Konuşarak Öğren</div>
              <div className="card-sub">Basit chat • Anlık duygu analizi</div>
            </div>
          </div>
          <NicknameGate onReady={setUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <img src={logo} alt="Konuşarak Öğren" style={{height:28}} />
          <strong className="brand-title">Konuşarak Öğren • Sentiment Chat</strong>
        </div>
        <div className="brand">
          <span className="nickname">@{user.nickname}</span>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">Cikis</button>
        </div>
      </header>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className="message-row">
            <span className="message-text">{m.text}</span>
            <small className={`badge ${m.sentiment?.label==='positive'?'pos':m.sentiment?.label==='negative'?'neg':'neu'}`}>
              {m.sentiment?.label} {typeof m.sentiment?.score === 'number' ? `(${m.sentiment.score.toFixed(2)})` : ''}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="compose">
        <input
          className="input"
          placeholder="Mesaj yazın"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={sending}>Gönder</button>
      </form>
      {error && <span className="error">{error}</span>}
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
  ghostButton: { background: 'transparent', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' },
}


