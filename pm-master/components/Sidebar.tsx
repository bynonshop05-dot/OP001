'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/',
    th: 'แดชบอร์ด',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/machines',
    th: 'เครื่องจักร',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    href: '/pm-plans',
    th: 'แผน PM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/work-orders',
    th: 'ใบสั่งงาน',
    badge: 3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/calendar',
    th: 'ปฏิทิน',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/reports',
    th: 'รายงาน',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 236,
      flexShrink: 0,
      background: '#1b1813',
      borderRight: '1px solid #2b2720',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 14px',
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 6px 18px' }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
          background: '#f97316', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.35)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.01em', color: '#f5f1e8' }}>เกษตรชล 2559</span>
          <span style={{ fontSize: 9.5, color: '#736e63', fontFamily: 'IBM Plex Mono', letterSpacing: '0.04em' }}>PM MASTER SYSTEM</span>
        </div>
      </div>

      <div style={{ fontSize: 10, color: '#5c5648', letterSpacing: '0.12em', padding: '8px 10px 6px', fontWeight: 600 }}>
        เมนูหลัก / MENU
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/' || pathname === ''
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 12px',
                borderRadius: 9,
                textDecoration: 'none',
                background: isActive ? '#2e2a22' : 'transparent',
                color: isActive ? '#f97316' : '#a59f92',
                transition: 'background 0.15s, color 0.15s',
                border: isActive ? '1px solid #3d3830' : '1px solid transparent',
              }}
            >
              <span style={{ width: 18, height: 18, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 13.5, fontFamily: 'IBM Plex Sans Thai' }}>{item.th}</span>
              {item.badge && (
                <span style={{
                  fontSize: 11, fontFamily: 'IBM Plex Mono', fontWeight: 600,
                  background: '#ef444420', color: '#ef4444',
                  padding: '2px 7px', borderRadius: 6,
                }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid #2b2720',
        paddingTop: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
          background: '#37322a', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, color: '#f5f1e8', fontWeight: 600,
        }}>มร</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#f5f1e8' }}>ไมตรี รุ่งเรืองศรี</span>
          <span style={{ fontSize: 10.5, color: '#736e63' }}>Engineering Manager</span>
        </div>
      </div>
    </aside>
  )
}
