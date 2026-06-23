import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'PM Master System — เกษตรชล 2559',
  description: 'ระบบบริหารงานบำรุงรักษาเชิงป้องกัน บริษัท เกษตรชล 2559 จำกัด',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#16140f' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
