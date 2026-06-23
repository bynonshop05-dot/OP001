'use client'
import { useState } from 'react'

interface HeaderProps {
  titleTh: string
  titleEn: string
  onCreatePm?: () => void
}

export default function Header({ titleTh, titleEn, onCreatePm }: HeaderProps) {
  const [q, setQ] = useState('')
  return (
    <header style={{
      height: 64,
      flexShrink: 0,
      borderBottom: '1px solid #2b2720',
      background: '#1b1813',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '0 26px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>{titleTh}</h1>
        <span style={{ fontSize: 11, color: '#736e63', fontFamily: 'IBM Plex Mono', letterSpacing: '0.04em' }}>{titleEn}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#16140f', border: '1px solid #2b2720',
        borderRadius: 8, padding: '8px 12px', width: 240,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#736e63" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาเครื่องจักร, PM..."
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 12.5,
          }}
        />
      </div>
      <button style={{
        position: 'relative', width: 38, height: 38, borderRadius: 8,
        border: '1px solid #2b2720', background: '#16140f',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a59f92" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
        </svg>
        <span className="pulse-dot" style={{
          position: 'absolute', top: 6, right: 7,
          width: 8, height: 8, borderRadius: '50%',
          background: '#ef4444', border: '2px solid #1b1813',
        }} />
      </button>
      {onCreatePm && (
        <button onClick={onCreatePm} style={{
          height: 38, padding: '0 16px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff',
          fontFamily: 'IBM Plex Sans Thai', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 3px 12px rgba(249,115,22,.3)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          สร้าง PM
        </button>
      )}
    </header>
  )
}
