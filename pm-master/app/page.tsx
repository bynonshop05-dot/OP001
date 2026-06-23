'use client'
import Header from '@/components/Header'

const kpis = [
  { en: 'TOTAL MACHINES', th: 'เครื่องจักรทั้งหมด', val: '325', unit: 'เครื่อง', color: '#3b82f6' },
  { en: 'ACTIVE PLANS', th: 'แผน PM ที่ใช้งาน', val: '48', unit: 'แผน', color: '#f97316' },
  { en: 'PENDING ORDERS', th: 'ใบสั่งงานรอดำเนินการ', val: '12', unit: 'ใบ', color: '#f59e0b' },
  { en: 'OVERDUE', th: 'เกินกำหนด', val: '3', unit: 'ใบ', color: '#ef4444' },
  { en: 'COMPLETED TODAY', th: 'เสร็จวันนี้', val: '7', unit: 'งาน', color: '#22c55e' },
  { en: 'PM RATE', th: 'อัตราสำเร็จ', val: '96', unit: '%', color: '#a855f7' },
]

const trend = [
  { m: 'ม.ค.', h: 90 }, { m: 'ก.พ.', h: 75 }, { m: 'มี.ค.', h: 110 },
  { m: 'เม.ย.', h: 85 }, { m: 'พ.ค.', h: 120 }, { m: 'มิ.ย.', h: 95 },
  { m: 'ก.ค.', h: 130 }, { m: 'ส.ค.', h: 100 }, { m: 'ก.ย.', h: 115 },
  { m: 'ต.ค.', h: 80 }, { m: 'พ.ย.', h: 140 }, { m: 'ธ.ค.', h: 125 },
]

const breakdown = [
  { label: 'Electrical', pct: 42, pctLabel: '42%', color: '#3b82f6' },
  { label: 'Mechanical', pct: 31, pctLabel: '31%', color: '#f97316' },
  { label: 'Water System', pct: 18, pctLabel: '18%', color: '#22c55e' },
  { label: 'Safety', pct: 9, pctLabel: '9%', color: '#a855f7' },
]

const alerts = [
  { th: 'PM-WT-003 ปั๊มน้ำ P-102 ครบกำหนดวันนี้', meta: 'WT-003 · วันนี้ 08:00', dot: '#ef4444' },
  { th: 'WO-2406-019 ยังไม่มีช่างรับงาน', meta: 'WO-2406-019 · 2 ชม.ที่แล้ว', dot: '#f59e0b' },
  { th: 'PM-EL-001 หม้อแปลง TR-01 จะครบใน 2 วัน', meta: 'EL-001 · พรุ่งนี้', dot: '#3b82f6' },
  { th: 'ใบสั่งงาน 3 ใบเกินกำหนดแล้ว', meta: 'ระบบ · อัตโนมัติ', dot: '#ef4444' },
]

const card: React.CSSProperties = {
  background: '#211e18', border: '1px solid #2b2720', borderRadius: 12, padding: '18px 20px',
}

export default function DashboardPage() {
  return (
    <>
      <Header titleTh="แดชบอร์ด" titleEn="Dashboard" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {kpis.map((k) => (
            <div key={k.en} style={{ ...card, flex: 1, minWidth: 158, padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: k.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: '#a59f92', fontFamily: 'IBM Plex Mono', letterSpacing: '0.02em' }}>{k.en}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{k.val}</span>
                <span style={{ fontSize: 11.5, color: '#736e63' }}>{k.unit}</span>
              </div>
              <span style={{ fontSize: 11.5, color: '#a59f92' }}>{k.th}</span>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>แนวโน้ม PM รายเดือน</div>
                  <div style={{ fontSize: 11, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>Monthly PM Completion Trend</div>
                </div>
                <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'IBM Plex Mono', background: '#22c55e1a', padding: '4px 9px', borderRadius: 6 }}>▲ +5.2%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 150, paddingTop: 8 }}>
                {trend.map((t) => (
                  <div key={t.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', maxWidth: 24, borderRadius: '5px 5px 2px 2px', background: 'linear-gradient(#fb923c,#c2410c)', height: t.h }} />
                    <span style={{ fontSize: 9, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>{t.m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>วิเคราะห์สาเหตุ Breakdown</div>
                <div style={{ fontSize: 11, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>Breakdown Analysis by System</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {breakdown.map((b) => (
                  <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#cabfa9' }}>{b.label}</span>
                      <span style={{ fontFamily: 'IBM Plex Mono' }}>{b.pctLabel}</span>
                    </div>
                    <div style={{ height: 9, background: '#16140f', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 5, width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, alignSelf: 'flex-start' }}>อัตราความสำเร็จ PM</div>
              <div style={{ fontSize: 11, color: '#736e63', fontFamily: 'IBM Plex Mono', alignSelf: 'flex-start', marginBottom: 6 }}>PM Completion Rate</div>
              <div style={{ position: 'relative', width: 150, height: 150, margin: '6px 0' }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="60" fill="none" stroke="#2b2720" strokeWidth="14" />
                  <circle cx="75" cy="75" r="60" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray="377" strokeDashoffset="15" transform="rotate(-90 75 75)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 34, fontWeight: 600, lineHeight: 1 }}>96%</span>
                  <span style={{ fontSize: 10.5, color: '#736e63', marginTop: 3 }}>เป้าหมาย 95%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 600, color: '#3b82f6' }}>185</span>
                  <span style={{ fontSize: 10.5, color: '#736e63' }}>MTBF (ชม.)</span>
                </div>
                <div style={{ width: 1, background: '#2b2720' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 600, color: '#22c55e' }}>2.3</span>
                  <span style={{ fontSize: 10.5, color: '#736e63' }}>MTTR (ชม.)</span>
                </div>
              </div>
            </div>

            <div style={{ ...card, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>แจ้งเตือนล่าสุด</span>
                <span style={{ fontSize: 11, color: '#f97316', fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}>ดูทั้งหมด</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, padding: '10px 8px', borderRadius: 8, cursor: 'pointer' }}>
                    <span style={{ width: 9, height: 9, flexShrink: 0, marginTop: 4, borderRadius: '50%', background: a.dot }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                      <span style={{ fontSize: 12.5, color: '#e8e2d6', lineHeight: 1.35 }}>{a.th}</span>
                      <span style={{ fontSize: 10.5, color: '#736e63', fontFamily: 'IBM Plex Mono' }}>{a.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
