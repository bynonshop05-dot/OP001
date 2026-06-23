'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { db, WorkOrder, ChecklistItem, Comment } from '@/lib/pmDataLayer'

const statusConfig = {
  pending: { label: 'รอดำเนินการ', color: '#a59f92', bg: '#37322a' },
  progress: { label: 'กำลังทำ', color: '#3b82f6', bg: '#3b82f620' },
  completed: { label: 'เสร็จแล้ว', color: '#22c55e', bg: '#22c55e20' },
  overdue: { label: 'เกินกำหนด', color: '#ef4444', bg: '#ef444420' },
}

const priorityColor: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }

const seedOrders: WorkOrder[] = [
  { id: '1', wo_no: 'WO-2406-019', plan_id: '1', pm_no: 'PM-EL-001', machine_name: 'หม้อแปลง TR-01', dept: 'Electrical', priority: 'High', status: 'progress', assignee: 'สมชาย ก.', due_date: '2026-06-23', is_auto: false, created_at: '' },
  { id: '2', wo_no: 'WO-2406-020', plan_id: '3', pm_no: 'PM-WT-003', machine_name: 'ปั๊มน้ำ P-102', dept: 'Water System', priority: 'High', status: 'pending', assignee: 'อนุชา ป.', due_date: '2026-06-23', is_auto: true, created_at: '' },
  { id: '3', wo_no: 'WO-2406-018', plan_id: '2', pm_no: 'PM-ME-014', machine_name: 'คอมเพรสเซอร์ CP-201', dept: 'Mechanical', priority: 'Medium', status: 'overdue', assignee: 'วิชัย ส.', due_date: '2026-06-20', is_auto: false, created_at: '' },
  { id: '4', wo_no: 'WO-2406-017', pm_no: 'PM-EL-002', machine_name: 'เครื่องกำเนิดไฟฟ้า GEN-01', dept: 'Electrical', priority: 'Medium', status: 'completed', assignee: 'สมชาย ก.', due_date: '2026-06-21', is_auto: false, created_at: '', completed_at: '2026-06-21' },
]

const columns: { key: WorkOrder['status']; label: string }[] = [
  { key: 'pending', label: 'รอดำเนินการ' },
  { key: 'progress', label: 'กำลังทำ' },
  { key: 'completed', label: 'เสร็จแล้ว' },
  { key: 'overdue', label: 'เกินกำหนด' },
]

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>(seedOrders)
  const [selected, setSelected] = useState<WorkOrder | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    db.listWorkOrders().then(setOrders).catch(() => {})
  }, [])

  async function openDrawer(wo: WorkOrder) {
    setSelected(wo)
    try {
      const [cl, cm] = await Promise.all([db.listChecklist(wo.id), db.listComments(wo.id)])
      setChecklist(cl)
      setComments(cm)
    } catch {
      setChecklist([
        { id: 'c1', wo_id: wo.id, label: 'ตรวจสอบระดับน้ำมัน', is_checked: true, sort_order: 0 },
        { id: 'c2', wo_id: wo.id, label: 'ทดสอบการทำงาน', is_checked: false, sort_order: 1 },
        { id: 'c3', wo_id: wo.id, label: 'บันทึกค่าอุณหภูมิ', is_checked: false, sort_order: 2 },
      ])
      setComments([])
    }
  }

  async function toggleCheck(item: ChecklistItem) {
    const updated = { ...item, is_checked: !item.is_checked }
    setChecklist((prev) => prev.map((c) => c.id === item.id ? updated : c))
    try { await db.toggleChecklist(item.id, updated.is_checked) } catch {}
  }

  async function addComment() {
    if (!commentText.trim() || !selected) return
    const c: Comment = { id: Date.now().toString(), wo_id: selected.id, author: 'ไมตรี รุ่งเรืองศรี', text: commentText, created_at: new Date().toISOString() }
    setComments((prev) => [...prev, c])
    setCommentText('')
    try { await db.addComment(selected.id, 'ไมตรี รุ่งเรืองศรี', commentText) } catch {}
  }

  async function changeStatus(woId: string, status: WorkOrder['status']) {
    setOrders((prev) => prev.map((o) => o.id === woId ? { ...o, status } : o))
    if (selected?.id === woId) setSelected((prev) => prev ? { ...prev, status } : prev)
    try { await db.updateWorkOrder(woId, { status }) } catch {}
  }

  return (
    <>
      <Header titleTh="ใบสั่งงาน" titleEn="Work Orders" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px' }}>
        {/* Kanban */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, minHeight: '60vh' }}>
          {columns.map(({ key, label }) => {
            const col = orders.filter((o) => o.status === key)
            const cfg = statusConfig[key]
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px 10px', borderBottom: `2px solid ${cfg.color}40` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', background: cfg.bg, color: cfg.color, padding: '2px 7px', borderRadius: 5 }}>{col.length}</span>
                </div>
                {col.map((wo) => (
                  <div key={wo.id} onClick={() => openDrawer(wo)} style={{
                    background: '#211e18', border: '1px solid #2b2720', borderRadius: 10, padding: '13px 14px',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 9,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10.5, color: '#f97316', fontFamily: 'IBM Plex Mono' }}>{wo.wo_no}</span>
                      <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 5, background: `${priorityColor[wo.priority]}20`, color: priorityColor[wo.priority], fontWeight: 600 }}>{wo.priority}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{wo.machine_name}</div>
                    <div style={{ fontSize: 11.5, color: '#736e63' }}>{wo.pm_no}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#736e63' }}>
                      <span>👤 {wo.assignee}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono' }}>📅 {wo.due_date}</span>
                    </div>
                    {wo.is_auto && (
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#3b82f620', color: '#3b82f6', alignSelf: 'flex-start' }}>AUTO</span>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="drawer-anim" style={{ width: 440, background: '#1b1813', borderLeft: '1px solid #2b2720', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Drawer Header */}
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #2b2720', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: '#f97316', fontFamily: 'IBM Plex Mono', marginBottom: 4 }}>{selected.wo_no}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{selected.machine_name}</div>
                <div style={{ fontSize: 12, color: '#736e63', marginTop: 2 }}>{selected.pm_no} · {selected.dept}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#736e63', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* Status Change */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #2b2720', display: 'flex', gap: 8 }}>
              {columns.map(({ key, label }) => (
                <button key={key} onClick={() => changeStatus(selected.id, key)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 7, cursor: 'pointer',
                  fontSize: 11.5, fontFamily: 'IBM Plex Sans Thai', fontWeight: selected.status === key ? 600 : 400,
                  background: selected.status === key ? statusConfig[key].bg : 'transparent',
                  color: selected.status === key ? statusConfig[key].color : '#736e63',
                  border: selected.status === key ? `1px solid ${statusConfig[key].color}40` : '1px solid #2b2720',
                }}>{label}</button>
              ))}
            </div>

            {/* Checklist */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #2b2720' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checklist.map((item) => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div onClick={() => toggleCheck(item)} style={{
                      width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${item.is_checked ? '#f97316' : '#37322a'}`,
                      background: item.is_checked ? '#f97316' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {item.is_checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="m5 13 4 4L19 7"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: item.is_checked ? '#736e63' : '#f5f1e8', textDecoration: item.is_checked ? 'line-through' : 'none' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #2b2720' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>รูปภาพ Before / After</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['before', 'after'].map((kind) => (
                  <div key={kind} style={{ border: '1.5px dashed #2b2720', borderRadius: 9, padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#736e63" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
                    <span style={{ fontSize: 12, color: '#736e63' }}>{kind === 'before' ? 'ก่อนทำงาน' : 'หลังทำงาน'}</span>
                    <span style={{ fontSize: 11, color: '#5c5648' }}>คลิกเพื่ออัปโหลด</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>ความคิดเห็น / บันทึก</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ background: '#16140f', borderRadius: 8, padding: '10px 13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316' }}>{c.author}</span>
                      <span style={{ fontSize: 10.5, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>{c.created_at.slice(0, 10)}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#e8e2d6' }}>{c.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  placeholder="เพิ่มความคิดเห็น..." style={{
                    flex: 1, background: '#16140f', border: '1px solid #2b2720', borderRadius: 8,
                    color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 13, padding: '9px 12px', outline: 'none',
                  }} />
                <button onClick={addComment} style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>ส่ง</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
