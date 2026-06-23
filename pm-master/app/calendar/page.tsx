'use client'
import { useState } from 'react'
import Header from '@/components/Header'

const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const pmEvents: Record<string, { label: string; color: string }[]> = {
  '2026-06-22': [{ label: 'PM-EL-001 หม้อแปลง TR-01', color: '#ef4444' }],
  '2026-06-23': [{ label: 'PM-WT-003 ปั๊มน้ำ P-102', color: '#f59e0b' }],
  '2026-06-25': [{ label: 'PM-ME-014 คอมเพรสเซอร์', color: '#3b82f6' }],
  '2026-06-28': [{ label: 'PM-EL-005 AHU-02', color: '#22c55e' }],
  '2026-07-05': [{ label: 'PM-WT-009 Softener', color: '#a855f7' }],
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
function pad2(n: number) { return String(n).padStart(2, '0') }

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const thaiYear = year + 543

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <>
      <Header titleTh="ปฏิทิน" titleEn="Calendar" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>
        <div style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 14, padding: '22px 24px' }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <button onClick={prevMonth} style={{ background: 'transparent', border: '1px solid #2b2720', color: '#a59f92', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>‹</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{thaiMonths[month]} {thaiYear}</div>
              <div style={{ fontSize: 11.5, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>{thaiMonths[month].toUpperCase()} {year}</div>
            </div>
            <button onClick={nextMonth} style={{ background: 'transparent', border: '1px solid #2b2720', color: '#a59f92', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>›</button>
          </div>

          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {thaiDays.map((d, i) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === 0 || i === 6 ? '#ef4444' : '#736e63', padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />
              const key = `${year}-${pad2(month + 1)}-${pad2(day)}`
              const events = pmEvents[key] || []
              const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate()
              return (
                <div key={key} style={{
                  minHeight: 72, padding: '8px 6px', borderRadius: 8,
                  background: isToday ? '#f9731620' : events.length ? '#211e18' : 'transparent',
                  border: isToday ? '1.5px solid #f97316' : events.length ? '1px solid #2b2720' : '1px solid transparent',
                  cursor: events.length ? 'pointer' : 'default',
                }}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? '#f97316' : '#f5f1e8', display: 'block', marginBottom: 4 }}>{day}</span>
                  {events.map((ev, i) => (
                    <div key={i} style={{ fontSize: 10.5, padding: '2px 5px', borderRadius: 4, background: `${ev.color}20`, color: ev.color, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.label}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[{ label: 'วันนี้', color: '#f97316' }, { label: 'PM ครบกำหนด', color: '#ef4444' }, { label: 'PM ใกล้ครบ', color: '#f59e0b' }, { label: 'PM ปกติ', color: '#22c55e' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a59f92' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
