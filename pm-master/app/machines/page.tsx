'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { db, Machine } from '@/lib/pmDataLayer'

const statusColor: Record<string, string> = {
  Running: '#22c55e', Maintenance: '#f59e0b', Stopped: '#ef4444', Standby: '#3b82f6',
}
const statusLabel: Record<string, string> = {
  Running: 'กำลังทำงาน', Maintenance: 'บำรุงรักษา', Stopped: 'หยุด', Standby: 'สแตนด์บาย',
}

const seedMachines: Machine[] = [
  { id: '1', code: 'TR-01', name: 'หม้อแปลงไฟฟ้า 1250kVA', dept: 'Electrical', area: 'Substation A', model: 'ABB RESIBLOC', status: 'Running', created_at: '', updated_at: '' },
  { id: '2', code: 'TR-02', name: 'หม้อแปลงไฟฟ้า 800kVA', dept: 'Electrical', area: 'Substation B', model: 'Siemens GEAFOL', status: 'Running', created_at: '', updated_at: '' },
  { id: '3', code: 'MP-101', name: 'มอเตอร์ปั๊มหลัก', dept: 'Mechanical', area: 'Pump Room', model: 'WEG W22', status: 'Running', created_at: '', updated_at: '' },
  { id: '4', code: 'P-102', name: 'ปั๊มน้ำหล่อเย็น', dept: 'Water System', area: 'Cooling', model: 'Grundfos CR-64', status: 'Maintenance', created_at: '', updated_at: '' },
  { id: '5', code: 'CP-201', name: 'คอมเพรสเซอร์อากาศ', dept: 'Mechanical', area: 'Utility', model: 'Atlas Copco GA-75', status: 'Running', created_at: '', updated_at: '' },
  { id: '6', code: 'CH-301', name: 'เครื่องทำน้ำเย็น Chiller', dept: 'Water System', area: 'Chiller Plant', model: 'Carrier 30XA', status: 'Running', created_at: '', updated_at: '' },
  { id: '7', code: 'SF-401', name: 'ระบบ Softener', dept: 'Water System', area: 'Water Treatment', model: 'Pentair', status: 'Stopped', created_at: '', updated_at: '' },
  { id: '8', code: 'CV-501', name: 'สายพานลำเลียง', dept: 'Mechanical', area: 'Production 1', model: 'Custom', status: 'Running', created_at: '', updated_at: '' },
  { id: '9', code: 'GEN-01', name: 'เครื่องกำเนิดไฟฟ้าสำรอง', dept: 'Electrical', area: 'Generator', model: 'Cummins C1100', status: 'Standby', created_at: '', updated_at: '' },
  { id: '10', code: 'AHU-02', name: 'เครื่องส่งลมเย็น', dept: 'Mechanical', area: 'HVAC', model: 'Daikin', status: 'Running', created_at: '', updated_at: '' },
]

const depts = ['ทั้งหมด', 'Electrical', 'Mechanical', 'Water System', 'Safety']

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(seedMachines)
  const [q, setQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('ทั้งหมด')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newMachine, setNewMachine] = useState({ code: '', name: '', dept: 'Electrical', area: '', model: '', status: 'Running' as Machine['status'] })

  useEffect(() => {
    db.listMachines().then(setMachines).catch(() => {})
  }, [])

  const filtered = machines.filter((m) => {
    const matchQ = !q || m.code.toLowerCase().includes(q.toLowerCase()) || m.name.toLowerCase().includes(q.toLowerCase())
    const matchDept = deptFilter === 'ทั้งหมด' || m.dept === deptFilter
    return matchQ && matchDept
  })

  async function handleDelete(id: string) {
    try {
      await db.deleteMachine(id)
      setMachines((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setMachines((prev) => prev.filter((m) => m.id !== id))
    }
    setDeleteConfirm(null)
  }

  async function handleAdd() {
    if (!newMachine.code || !newMachine.name) return
    try {
      const m = await db.addMachine(newMachine)
      setMachines((prev) => [m, ...prev])
    } catch {
      setMachines((prev) => [{ ...newMachine, id: Date.now().toString(), created_at: '', updated_at: '' }, ...prev])
    }
    setNewMachine({ code: '', name: '', dept: 'Electrical', area: '', model: '', status: 'Running' })
    setShowAdd(false)
  }

  const card: React.CSSProperties = { background: '#211e18', border: '1px solid #2b2720', borderRadius: 9 }
  const inputStyle: React.CSSProperties = {
    background: '#16140f', border: '1px solid #2b2720', borderRadius: 8,
    color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 13,
    padding: '8px 12px', outline: 'none', width: '100%',
  }

  return (
    <>
      <Header titleTh="เครื่องจักร" titleEn="Machines" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#211e18', border: '1px solid #2b2720', borderRadius: 9, padding: '9px 13px', width: 300 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#736e63" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา รหัส / ชื่อ / แผนก"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f5f1e8', fontFamily: 'IBM Plex Sans Thai', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {depts.map((d) => (
              <button key={d} onClick={() => setDeptFilter(d)} style={{
                padding: '7px 13px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5,
                fontFamily: 'IBM Plex Sans Thai',
                background: deptFilter === d ? '#f97316' : '#211e18',
                color: deptFilter === d ? '#fff' : '#a59f92',
                border: `1px solid ${deptFilter === d ? '#f97316' : '#2b2720'}`,
              }}>{d}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>{filtered.length} เครื่อง</span>
          <button onClick={() => setShowAdd(true)} style={{
            height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff',
            fontFamily: 'IBM Plex Sans Thai', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            เพิ่มเครื่องจักร
          </button>
        </div>

        {/* Table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2b2720' }}>
                {['รหัส', 'ชื่อเครื่องจักร', 'แผนก', 'พื้นที่', 'รุ่น', 'สถานะ', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#736e63', fontWeight: 500, fontFamily: 'IBM Plex Mono', fontSize: 11, letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #2b2720' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono', fontSize: 12.5, color: '#f97316' }}>{m.code}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.name}</td>
                  <td style={{ padding: '12px 16px', color: '#a59f92', fontSize: 12.5 }}>{m.dept}</td>
                  <td style={{ padding: '12px 16px', color: '#a59f92', fontSize: 12.5 }}>{m.area}</td>
                  <td style={{ padding: '12px 16px', color: '#736e63', fontSize: 12.5 }}>{m.model}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 6,
                      background: `${statusColor[m.status]}20`, color: statusColor[m.status],
                    }}>{statusLabel[m.status] || m.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setDeleteConfirm(m.id)} style={{
                      padding: '5px 10px', borderRadius: 6, border: '1px solid #2b2720',
                      background: 'transparent', color: '#736e63', cursor: 'pointer', fontSize: 12,
                    }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 14, padding: '28px 32px', maxWidth: 380, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>ยืนยันการลบ</div>
            <div style={{ color: '#a59f92', fontSize: 13.5, marginBottom: 24 }}>ต้องการลบเครื่องจักรนี้ออกจากระบบใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #2b2720', background: 'transparent', color: '#a59f92', cursor: 'pointer', fontFamily: 'IBM Plex Sans Thai' }}>ยกเลิก</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'IBM Plex Sans Thai', fontWeight: 600 }}>ลบเครื่องจักร</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Machine Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 14, padding: '28px 32px', maxWidth: 480, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>เพิ่มเครื่องจักรใหม่</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'รหัสเครื่องจักร *', key: 'code', placeholder: 'เช่น TR-03' },
                { label: 'ชื่อเครื่องจักร *', key: 'name', placeholder: 'เช่น หม้อแปลงไฟฟ้า' },
                { label: 'พื้นที่', key: 'area', placeholder: 'เช่น Substation C' },
                { label: 'รุ่น/Model', key: 'model', placeholder: 'เช่น ABB RESIBLOC' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>{label}</div>
                  <input value={(newMachine as Record<string, string>)[key]} onChange={(e) => setNewMachine((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 12, color: '#736e63', marginBottom: 6 }}>แผนก</div>
                <select value={newMachine.dept} onChange={(e) => setNewMachine((p) => ({ ...p, dept: e.target.value }))} style={inputStyle}>
                  {['Electrical', 'Mechanical', 'Water System', 'Safety'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
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
