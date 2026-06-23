'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { db, PmPlan } from '@/lib/pmDataLayer'

const freqColor: Record<string, string> = {
  'รายวัน': '#ef4444', 'รายสัปดาห์': '#f59e0b',
  'รายเดือน': '#3b82f6', 'รายไตรมาส': '#22c55e', 'รายปี': '#a855f7',
}
const priorityColor: Record<string, string> = {
  High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e',
}

const seedPlans: PmPlan[] = [
  { id: '1', pm_no: 'PM-EL-001', machine_name: 'หม้อแปลง TR-01', dept: 'Electrical', frequency: 'รายเดือน', priority: 'High', owner: 'สมชาย ก.', next_due: '2026-06-22', progress: 60, is_paused: false, created_at: '', updated_at: '' },
  { id: '2', pm_no: 'PM-ME-014', machine_name: 'คอมเพรสเซอร์ CP-201', dept: 'Mechanical', frequency: 'รายสัปดาห์', priority: 'Medium', owner: 'วิชัย ส.', next_due: '2026-06-25', progress: 30, is_paused: false, created_at: '', updated_at: '' },
  { id: '3', pm_no: 'PM-WT-003', machine_name: 'ปั๊มน้ำ P-102', dept: 'Water System', frequency: 'รายไตรมาส', priority: 'High', owner: 'อนุชา ป.', next_due: '2026-06-23', progress: 0, is_paused: false, created_at: '', updated_at: '' },
  { id: '4', pm_no: 'PM-WT-009', machine_name: 'ระบบ Softener SF-401', dept: 'Water System', frequency: 'รายเดือน', priority: 'High', owner: 'อนุชา ป.', next_due: '2026-06-20', progress: 0, is_paused: true, created_at: '', updated_at: '' },
]

function daysUntil(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function dueBadge(dateStr: string, isPaused: boolean) {
  if (isPaused) return { text: 'พักใช้งาน', color: '#736e63', bg: '#37322a' }
  const d = daysUntil(dateStr)
  if (d < 0) return { text: `เกิน ${Math.abs(d)} วัน`, color: '#ef4444', bg: '#ef444420' }
  if (d === 0) return { text: 'วันนี้', color: '#ef4444', bg: '#ef444420' }
  if (d <= 5) return { text: `อีก ${d} วัน`, color: '#f59e0b', bg: '#f59e0b20' }
  return { text: `อีก ${d} วัน`, color: '#22c55e', bg: '#22c55e20' }
}

export default function PmPlansPage() {
  const [plans, setPlans] = useState<PmPlan[]>(seedPlans)
  const [q, setQ] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newPlan, setNewPlan] = useState({
    pm_no: '', machine_name: '', dept: 'Electrical', frequency: 'รายเดือน',
    priority: 'Medium' as PmPlan['priority'], owner: '', next_due: '', description: '',
  })

  useEffect(() => {
    db.listPlans().then(setPlans).catch(() => {})
  }, [])

  const filtered = plans.filter((p) =>
    !q || p.pm_no.toLowerCase().includes(q.toLowerCase()) || p.machine_name.toLowerCase().includes(q.toLowerCase())
  )

  async function togglePause(id: string, paused: boolean) {
    try {
      const updated = await db.setPlanPaused(id, paused)
      setPlans((prev) => prev.map((p) => p.id === id ? updated : p))
    } catch {
      setPlans((prev) => prev.map((p) => p.id === id ? { ...p, is_paused: paused } : p))
    }
  }

  async function handleClone(plan: PmPlan) {
    const clone = { ...plan, id: undefined, pm_no: plan.pm_no + '-CLONE', progress: 0, is_paused: false }
    try {
      const added = await db.addPlan(clone)
      setPlans((prev) => [added, ...prev])
    } catch {
      setPlans((prev) => [{ ...clone, id: Date.now().toString(), created_at: '', updated_at: '' }, ...prev])
    }
  }

  async function handleAdd() {
    if (!newPlan.pm_no || !newPlan.machine_name) return
    try {
      const p = await db.addPlan({ ...newPlan, progress: 0, is_paused: false })
      setPlans((prev) => [p, ...prev])
    } catch {
      setPlans((prev) => [{ ...newPlan, id: Date.now().toString(), progress: 0, is_paused: false, created_at: '', updated_at: '' }, ...prev])
    }
    setNewPlan({ pm_no: '', machine_name: '', dept: 'Electrical', frequency: 'รายเดือน', priority: 'Medium', owner: '', next_due: '', description: '' })
    setShowAdd(false)
  }

  const inputStyle: React.CSSProperties = {
    background: '#16140f', border: '1px solid #2b2720', borderRadius: 8,
    color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 13,
    padding: '8px 12px', outline: 'none', width: '100%',
  }

  return (
    <>
      <Header titleTh="แผน PM" titleEn="PM Plans" onCreatePm={() => setShowAdd(true)} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#211e18', border: '1px solid #2b2720', borderRadius: 9, padding: '9px 13px', width: 300 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#736e63" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา เลขแผน / เครื่องจักร"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 12, color: '#736e63', fontFamily: 'IBM Plex Mono', marginLeft: 'auto' }}>{filtered.length} แผน</span>
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map((p) => {
            const badge = dueBadge(p.next_due, p.is_paused)
            return (
              <div key={p.id} style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 12, padding: '17px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#f97316', fontFamily: 'IBM Plex Mono', letterSpacing: '0.04em', marginBottom: 3 }}>{p.pm_no}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.machine_name}</div>
                    <div style={{ fontSize: 11.5, color: '#736e63', marginTop: 2 }}>{p.dept}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: badge.bg, color: badge.color, fontFamily: 'IBM Plex Mono', flexShrink: 0 }}>{badge.text}</span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: `${freqColor[p.frequency] || '#3b82f6'}20`, color: freqColor[p.frequency] || '#3b82f6', fontFamily: 'IBM Plex Mono' }}>{p.frequency}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: `${priorityColor[p.priority]}20`, color: priorityColor[p.priority] }}>{p.priority}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#37322a', color: '#a59f92' }}>👤 {p.owner}</span>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <span style={{ color: '#736e63' }}>ความคืบหน้า</span>
                    <span style={{ fontFamily: 'IBM Plex Mono', color: '#f5f1e8' }}>{p.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#16140f', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${p.progress}%`, background: 'linear-gradient(90deg,#f97316,#ea580c)' }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 7, borderTop: '1px solid #2b2720', paddingTop: 13 }}>
                  <button style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid #2b2720', background: 'transparent', color: '#a59f92', cursor: 'pointer', fontSize: 12, fontFamily: 'IBM Plex Sans Thai' }}>แก้ไข</button>
                  <button onClick={() => handleClone(p)} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid #2b2720', background: 'transparent', color: '#a59f92', cursor: 'pointer', fontSize: 12, fontFamily: 'IBM Plex Sans Thai' }}>Clone</button>
                  <button onClick={() => togglePause(p.id, !p.is_paused)} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid #2b2720', background: p.is_paused ? '#22c55e20' : 'transparent', color: p.is_paused ? '#22c55e' : '#f59e0b', cursor: 'pointer', fontSize: 12, fontFamily: 'IBM Plex Sans Thai' }}>
                    {p.is_paused ? 'เปิดใช้' : 'พัก'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 14, padding: '28px 32px', maxWidth: 520, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>สร้างแผน PM ใหม่</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'เลขแผน PM *', key: 'pm_no', placeholder: 'เช่น PM-EL-002', col: 1 },
                { label: 'ชื่อเครื่องจักร *', key: 'machine_name', placeholder: 'เช่น หม้อแปลง TR-03', col: 1 },
                { label: 'ผู้รับผิดชอบ', key: 'owner', placeholder: 'เช่น สมชาย ก.', col: 1 },
                { label: 'วันครบกำหนดถัดไป', key: 'next_due', placeholder: 'YYYY-MM-DD', col: 1 },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>{label}</div>
                  <input value={(newPlan as Record<string, string>)[key]} onChange={(e) => setNewPlan((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>แผนก</div>
                <select value={newPlan.dept} onChange={(e) => setNewPlan((p) => ({ ...p, dept: e.target.value }))} style={inputStyle}>
                  {['Electrical', 'Mechanical', 'Water System', 'Safety'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>ความถี่</div>
                <select value={newPlan.frequency} onChange={(e) => setNewPlan((p) => ({ ...p, frequency: e.target.value }))} style={inputStyle}>
                  {['รายวัน', 'รายสัปดาห์', 'รายเดือน', 'รายไตรมาส', 'รายปี'].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>ความสำคัญ</div>
                <select value={newPlan.priority} onChange={(e) => setNewPlan((p) => ({ ...p, priority: e.target.value as PmPlan['priority'] }))} style={inputStyle}>
                  {['High', 'Medium', 'Low'].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>รายละเอียดงาน</div>
              <textarea value={newPlan.description} onChange={(e) => setNewPlan((p) => ({ ...p, description: e.target.value }))}
                placeholder="อธิบายงานที่ต้องทำ..."
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #2b2720', background: 'transparent', color: '#a59f92', cursor: 'pointer', fontFamily: 'IBM Plex Sans Thai' }}>ยกเลิก</button>
              <button onClick={handleAdd} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', cursor: 'pointer', fontFamily: 'IBM Plex Sans Thai', fontWeight: 600 }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
