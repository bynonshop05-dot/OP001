# 🚀 คู่มือ Deploy & ตั้งค่าฐานข้อมูล (ฟรีทั้งหมด)

เว็บนี้ออกแบบให้ใช้งานได้ทันทีด้วย **ข้อมูลตัวอย่าง** และค่อย ๆ ต่อ **ฐานข้อมูลจริง** ภายหลังได้
สแต็กที่ใช้: **GitHub Pages** (โฮสต์) + **Supabase** (ฐานข้อมูล) — ทั้งคู่มี free tier

---

## ส่วนที่ 1 — Deploy เว็บขึ้น GitHub Pages

โปรเจกต์มี workflow `.github/workflows/deploy.yml` ที่ deploy ให้อัตโนมัติเมื่อ push เข้า `main`

ขั้นตอนที่ **คุณต้องทำเอง** (ครั้งเดียว):

1. ไปที่ repo บน GitHub → **Settings** → **Pages**
2. หัวข้อ **Build and deployment** → **Source** เลือก **GitHub Actions**
3. Merge PR #1 เข้า `main` (หรือ push โค้ดเข้า `main`)
4. แท็บ **Actions** จะรัน workflow "Deploy to GitHub Pages" — รอจนเป็นสีเขียว
5. เว็บจะออนไลน์ที่ `https://<username>.github.io/<repo>/`
   เช่น `https://bynonshop05-dot.github.io/OP001/`

> กดรันเองได้จากแท็บ **Actions** → เลือก workflow → **Run workflow**

---

## ส่วนที่ 2 — ตั้งค่าฐานข้อมูล Supabase

### 2.1 สร้างโปรเจกต์
1. สมัคร/เข้าสู่ระบบที่ <https://supabase.com> (ฟรี)
2. กด **New project** ตั้งชื่อ + รหัสผ่านฐานข้อมูล แล้วรอสร้างเสร็จ (~2 นาที)

### 2.2 สร้างตาราง
1. เปิด **SQL Editor** → **New query**
2. คัดลอกเนื้อหาจากไฟล์ [`supabase/schema.sql`](supabase/schema.sql) มาวาง แล้วกด **Run**
3. (ทางเลือก) วาง [`supabase/seed.sql`](supabase/seed.sql) เพื่อใส่ข้อมูลตัวอย่าง แล้วกด **Run**

### 2.3 เชื่อมเว็บกับฐานข้อมูล
1. ไปที่ **Project Settings** → **API** จะเห็น:
   - **Project URL**
   - **Project API keys → anon / public**
2. เปิดไฟล์ [`config.js`](config.js) แล้วกรอกค่า 2 บรรทัด:
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://xxxx.supabase.co",
     anonKey: "eyJhbGciOi...."   // anon / public key
   };
   ```
3. commit + push → GitHub Pages จะ deploy ใหม่อัตโนมัติ
4. เปิดเว็บ ถ้าเชื่อมสำเร็จ แถบสถานะจะขึ้น **"Live Data"** และดึงข้อมูลจริงจาก Supabase

> ⚠️ **ความปลอดภัย:** anon key ออกแบบมาให้เปิดเผยฝั่ง client ได้ แต่ความปลอดภัยจริงมาจาก
> **Row Level Security (RLS)** — schema นี้ตั้งให้ "อ่านได้สาธารณะ" เท่านั้น
> หากจะให้บันทึกข้อมูลจากหน้าเว็บ ควรเพิ่มระบบ **Auth** ของ Supabase ก่อน
> (ดู policy `insert` ที่คอมเมนต์ไว้ใน `schema.sql`)

---

## โครงสร้างข้อมูล

| ตาราง | หน้าที่ |
|---|---|
| `utilities` | ประเภทสาธารณูปโภค + อัตราค่าบริการ (ไฟฟ้า/น้ำ/แก๊ส) |
| `meters` | มิเตอร์แต่ละตัว ผูกกับประเภทและพื้นที่ |
| `readings` | ค่าการใช้ที่บันทึกเข้ามาต่อวัน (ข้อมูลจริง) |

เว็บจะรวมค่าจาก `readings` 7 วันล่าสุดมาคำนวณ KPI, กราฟ, ค่าใช้จ่าย และมุมมองมิเตอร์โดยอัตโนมัติ

---

## ทำงานแบบไหน (สรุป)

```
ไม่ได้ตั้งค่า config.js  →  แสดง "ข้อมูลตัวอย่าง" (เปิดดูได้ทันที)
ตั้งค่า config.js แล้ว   →  ดึงข้อมูลจริงจาก Supabase → แสดง "Live Data"
เชื่อมต่อไม่สำเร็จ        →  fallback กลับไปข้อมูลตัวอย่าง + เตือนบนแถบสถานะ
```
