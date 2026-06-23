'use client'
import Header from '@/components/Header'

const reports = [
  { id: 1, th: 'สรุปใบสั่งงานรายเดือน', en: 'Monthly Work Order Summary', icon: '📊', desc: 'รายงานสรุปจำนวน WO ที่สร้าง/เสร็จ/ค้าง รายแผนก', formats: ['Excel', 'PDF'] },
  { id: 2, th: 'ประวัติการบำรุงรักษา', en: 'Maintenance History', icon: '📋', desc: 'ประวัติ PM ทั้งหมดของเครื่องจักร พร้อมรูป Before/After', formats: ['Excel', 'PDF'] },
  { id: 3, th: 'รายงาน MTBF / MTTR', en: 'MTBF & MTTR Report', icon: '📈', desc: 'ค่าเฉลี่ยเวลาระหว่างขัดข้อง และเวลาซ่อมแซม', formats: ['Excel', 'PDF'] },
  { id: 4, th: 'แผน PM ที่ครบกำหนด', en: 'Due PM Plans Report', icon: '⏰', desc: 'รายการแผน PM ที่ครบกำหนดในช่วงที่เลือก', formats: ['Excel'] },
  { id: 5, th: 'วิเคราะห์ Breakdown', en: 'Breakdown Analysis', icon: '🔧', desc: 'สาเหตุและความถี่ของการ Breakdown แยกตามระบบ', formats: ['Excel', 'PDF'] },
  { id: 6, th: 'รายงานค่าใช้จ่าย PM', en: 'PM Cost Report', icon: '💰', desc: 'ต้นทุนการบำรุงรักษา แยกตามเครื่องจักรและแผนก', formats: ['Excel', 'PDF'] },
  { id: 7, th: 'สถิติช่างเทคนิค', en: 'Technician Performance', icon: '👨‍🔧', desc: 'ผลงาน/ภาระงานของช่างแต่ละคน', formats: ['Excel', 'PDF'] },
  { id: 8, th: 'รายงานมาตรฐาน ISO', en: 'ISO Compliance Report', icon: '🏆', desc: 'รายงานตามรูปแบบ ISO 9001/14001 สำหรับการตรวจสอบ', formats: ['PDF'] },
]

export default function ReportsPage() {
  return (
    <>
      <Header titleTh="รายงาน" titleEn="Reports" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#211e18', border: '1px solid #2b2720', borderRadius: 10, padding: '14px 18px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#736e63" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{ fontSize: 13, color: '#736e63' }}>ช่วงเวลา:</span>
          <input type="date" defaultValue="2026-06-01" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f5f1e8', fontFamily: 'IBM Plex Mono', fontSize: 13, cursor: 'pointer' }} />
          <span style={{ color: '#736e63' }}>—</span>
          <input type="date" defaultValue="2026-06-30" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f5f1e8', fontFamily: 'IBM Plex Mono', fontSize: 13, cursor: 'pointer' }} />
          <button style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 7, border: 'none', background: '#f97316', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'IBM Plex Sans Thai' }}>ยืนยัน</button>
        </div>

        {/* Report Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {reports.map((r) => (
            <div key={r.id} style={{ background: '#211e18', border: '1px solid #2b2720', borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{r.th}</div>
                  <div style={{ fontSize: 11.5, color: '#736e63', fontFamily: 'IBM Plex Mono', marginBottom: 8 }}>{r.en}</div>
                  <div style={{ fontSize: 12.5, color: '#a59f92', lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #2b2720', paddingTop: 14 }}>
                {r.formats.map((fmt) => (
                  <button key={fmt} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #2b2720', cursor: 'pointer',
                    fontFamily: 'IBM Plex Sans Thai', fontSize: 13, fontWeight: 600,
                    background: fmt === 'Excel' ? '#22c55e20' : '#3b82f620',
                    color: fmt === 'Excel' ? '#22c55e' : '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {fmt === 'Excel' ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    )}
                    ส่งออก {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
