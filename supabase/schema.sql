-- ============================================================
--  Energy Dashboard — Database Schema (Supabase / PostgreSQL)
-- ============================================================
--  วิธีใช้: เปิด Supabase Dashboard → SQL Editor → New query
--           วางสคริปต์นี้ทั้งหมด แล้วกด Run
-- ============================================================

-- ---------- ตารางประเภทสาธารณูปโภค (ไฟฟ้า / น้ำ / แก๊ส) ----------
create table if not exists utilities (
  id         text primary key,            -- 'electricity' | 'water' | 'gas'
  name       text        not null,
  color      text        not null,        -- สีบนหน้าเว็บ เช่น #22d3ee
  rate       numeric     not null,        -- ค่าบริการต่อหน่วย
  rate_unit  text        not null,        -- เช่น /kWh , /m³
  unit       text        not null,        -- หน่วยการใช้ เช่น kWh , m³
  sort_order int         default 0
);

-- ---------- ตารางมิเตอร์ ----------
create table if not exists meters (
  id          uuid primary key default gen_random_uuid(),
  utility_id  text references utilities(id) on delete cascade,
  name        text not null,
  tag         text,                        -- พื้นที่/ห้อง เช่น Kitchen
  color       text,
  created_at  timestamptz default now()
);

-- ---------- ตารางค่าที่อ่านได้จากมิเตอร์ (ข้อมูลจริงที่บันทึกเข้ามา) ----------
create table if not exists readings (
  id            uuid primary key default gen_random_uuid(),
  meter_id      uuid references meters(id) on delete cascade,
  reading_date  date    not null,
  value         numeric not null,          -- ปริมาณการใช้ของช่วงนั้น
  created_at    timestamptz default now()
);

create index if not exists idx_readings_meter_date on readings (meter_id, reading_date);
create index if not exists idx_meters_utility       on meters (utility_id);

-- ============================================================
--  Row Level Security (RLS)
-- ------------------------------------------------------------
--  เปิด RLS แล้วอนุญาตให้ผู้ใช้ทั่วไป (anon) "อ่าน" ได้
--  สำหรับหน้า dashboard ที่แสดงผลอย่างเดียว
--  หากต้องการให้หน้า Meter Entry บันทึกข้อมูลได้ ให้เปิด policy insert
--  ด้านล่าง (พิจารณาความปลอดภัยก่อนใช้งานจริง — แนะนำใส่ Auth)
-- ============================================================
alter table utilities enable row level security;
alter table meters     enable row level security;
alter table readings   enable row level security;

-- อ่านได้แบบสาธารณะ (read-only dashboard)
drop policy if exists "public read utilities" on utilities;
create policy "public read utilities" on utilities for select to anon using (true);

drop policy if exists "public read meters" on meters;
create policy "public read meters" on meters for select to anon using (true);

drop policy if exists "public read readings" on readings;
create policy "public read readings" on readings for select to anon using (true);

-- (ทางเลือก) อนุญาตให้ anon เพิ่มค่าอ่านมิเตอร์ได้ — เปิดใช้เมื่อทำหน้า Meter Entry
-- drop policy if exists "public insert readings" on readings;
-- create policy "public insert readings" on readings for insert to anon with check (true);
