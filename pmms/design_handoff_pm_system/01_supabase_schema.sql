-- ============================================================
-- PM Master System — Supabase / PostgreSQL Schema
-- บริษัท เกษตรชล 2559 จำกัด
-- ============================================================
-- รันสคริปต์นี้ใน Supabase → SQL Editor → New query → Run
-- (หรือใช้กับ PostgreSQL ทั่วไปก็ได้ ตัดส่วน RLS/auth ออก)
-- ============================================================

-- ---------- ผู้ใช้งาน (เสริมจาก auth.users ของ Supabase) ----------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text default 'technician',   -- manager | engineer | technician
  initials    text,
  created_at  timestamptz default now()
);

-- ---------- เครื่องจักร (Machines) ----------
create table if not exists machines (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,          -- เช่น TR-01
  name        text not null,                 -- ชื่อเครื่องจักร
  dept        text,                          -- Electrical | Mechanical | Water System | Safety
  area        text,                          -- พื้นที่ / location
  model       text,                          -- รุ่น / model
  status      text default 'Running',        -- Running | Maintenance | Stopped | Standby
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- แผนบำรุงรักษา (PM Plans) ----------
create table if not exists pm_plans (
  id          uuid primary key default gen_random_uuid(),
  pm_no       text unique not null,          -- เช่น PM-EL-001
  machine_id  uuid references machines(id) on delete set null,
  machine_name text,                         -- denormalized เพื่อแสดงผลเร็ว
  dept        text,
  frequency   text,                          -- รายวัน | รายสัปดาห์ | รายเดือน | รายไตรมาส | รายปี
  priority    text default 'Medium',         -- High | Medium | Low
  owner       text,                          -- ผู้รับผิดชอบ
  description text,                           -- รายละเอียดงานที่ต้องทำ
  next_due    date,                          -- ครบกำหนดถัดไป
  progress    int default 0,                 -- 0-100
  is_paused   boolean default false,         -- พักใช้งาน
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- ใบสั่งงาน (Work Orders) ----------
create table if not exists work_orders (
  id          uuid primary key default gen_random_uuid(),
  wo_no       text unique not null,          -- เช่น WO-2406-019
  plan_id     uuid references pm_plans(id) on delete set null,
  pm_no       text,
  machine_name text,
  dept        text,
  priority    text default 'Medium',
  status      text default 'pending',        -- pending | progress | completed | overdue
  assignee    text,
  due_date    date,
  is_auto     boolean default false,         -- สร้างอัตโนมัติจากกฎ 5 วันหรือไม่
  before_photo text,                         -- URL ใน Supabase Storage
  after_photo  text,
  created_at  timestamptz default now(),
  completed_at timestamptz
);

-- ---------- รายการตรวจสอบในใบสั่งงาน (Checklist) ----------
create table if not exists wo_checklist (
  id          uuid primary key default gen_random_uuid(),
  wo_id       uuid references work_orders(id) on delete cascade,
  label       text not null,
  is_checked  boolean default false,
  sort_order  int default 0
);

-- ---------- ความคิดเห็น / บันทึก (Comments) ----------
create table if not exists wo_comments (
  id          uuid primary key default gen_random_uuid(),
  wo_id       uuid references work_orders(id) on delete cascade,
  author      text,
  author_id   uuid references profiles(id),
  text        text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) — ให้เฉพาะผู้ที่ login เข้าถึงได้
-- ============================================================
alter table machines     enable row level security;
alter table pm_plans     enable row level security;
alter table work_orders  enable row level security;
alter table wo_checklist enable row level security;
alter table wo_comments  enable row level security;
alter table profiles     enable row level security;

-- นโยบายแบบง่าย: ผู้ใช้ที่ login แล้วอ่าน/เขียนได้ทั้งหมด
-- (ปรับให้ละเอียดขึ้นตามสิทธิ์ role ภายหลังได้)
create policy "auth read"  on machines     for select using (auth.role() = 'authenticated');
create policy "auth write" on machines     for all    using (auth.role() = 'authenticated');
create policy "auth read"  on pm_plans     for select using (auth.role() = 'authenticated');
create policy "auth write" on pm_plans     for all    using (auth.role() = 'authenticated');
create policy "auth read"  on work_orders  for select using (auth.role() = 'authenticated');
create policy "auth write" on work_orders  for all    using (auth.role() = 'authenticated');
create policy "auth read"  on wo_checklist for select using (auth.role() = 'authenticated');
create policy "auth write" on wo_checklist for all    using (auth.role() = 'authenticated');
create policy "auth read"  on wo_comments  for select using (auth.role() = 'authenticated');
create policy "auth write" on wo_comments  for all    using (auth.role() = 'authenticated');
create policy "own profile" on profiles    for all    using (auth.uid() = id);

-- ============================================================
-- ข้อมูลตัวอย่าง (Seed) — ตรงกับที่อยู่ในต้นแบบ
-- ============================================================
insert into machines (code, name, dept, area, model, status) values
  ('TR-01','หม้อแปลงไฟฟ้า 1250kVA','Electrical','Substation A','ABB RESIBLOC','Running'),
  ('TR-02','หม้อแปลงไฟฟ้า 800kVA','Electrical','Substation B','Siemens GEAFOL','Running'),
  ('MP-101','มอเตอร์ปั๊มหลัก','Mechanical','Pump Room','WEG W22','Running'),
  ('P-102','ปั๊มน้ำหล่อเย็น','Water System','Cooling','Grundfos CR-64','Maintenance'),
  ('CP-201','คอมเพรสเซอร์อากาศ','Mechanical','Utility','Atlas Copco GA-75','Running'),
  ('CH-301','เครื่องทำน้ำเย็น Chiller','Water System','Chiller Plant','Carrier 30XA','Running'),
  ('SF-401','ระบบ Softener','Water System','Water Treatment','Pentair','Stopped'),
  ('CV-501','สายพานลำเลียง','Mechanical','Production 1','Custom','Running'),
  ('GEN-01','เครื่องกำเนิดไฟฟ้าสำรอง','Electrical','Generator','Cummins C1100','Standby'),
  ('AHU-02','เครื่องส่งลมเย็น','Mechanical','HVAC','Daikin','Running')
on conflict (code) do nothing;

insert into pm_plans (pm_no, machine_name, dept, frequency, priority, owner, next_due, progress, is_paused) values
  ('PM-EL-001','หม้อแปลง TR-01','Electrical','รายเดือน','High','สมชาย ก.','2026-06-22',60,false),
  ('PM-ME-014','คอมเพรสเซอร์ CP-201','Mechanical','รายสัปดาห์','Medium','วิชัย ส.','2026-06-25',30,false),
  ('PM-WT-003','ปั๊มน้ำ P-102','Water System','รายไตรมาส','High','อนุชา ป.','2026-06-23',0,false),
  ('PM-WT-009','ระบบ Softener SF-401','Water System','รายเดือน','High','อนุชา ป.','2026-06-20',0,true)
on conflict (pm_no) do nothing;
