-- ============================================================
--  Energy Dashboard — Seed Data (ตัวอย่างข้อมูลเริ่มต้น)
-- ============================================================
--  รันหลังจาก schema.sql เพื่อใส่ข้อมูลตัวอย่างให้ dashboard มีอะไรแสดง
--  เมื่อมีข้อมูลจริงแล้วสามารถลบส่วนนี้ออกได้
-- ============================================================

-- ---------- ประเภทสาธารณูปโภค ----------
insert into utilities (id, name, color, rate, rate_unit, unit, sort_order) values
  ('electricity', 'Electricity', '#22d3ee', 3.00, '/kWh', 'kWh', 1),
  ('water',       'Water',       '#5eead4', 2.50, '/m³',  'm³',  2),
  ('gas',         'Gas',         '#fbbf24', 1.85, '/m³',  'm³',  3)
on conflict (id) do nothing;

-- ---------- มิเตอร์ตัวอย่าง (ไฟฟ้า แยกตามพื้นที่) ----------
insert into meters (utility_id, name, tag, color) values
  ('electricity', 'Meter 001', 'Kitchen',     '#22d3ee'),
  ('electricity', 'Meter 002', 'Living Room', '#5eead4'),
  ('electricity', 'Meter 003', 'Bedroom',     '#818cf8'),
  ('electricity', 'Meter 004', 'Bathroom',    '#fbbf24'),
  ('electricity', 'Meter 005', 'Garage',      '#22d3ee'),
  ('electricity', 'Meter 006', 'Garden',      '#5eead4');

-- ---------- ค่าอ่านมิเตอร์ย้อนหลัง 7 วัน (สุ่มแบบสมจริง) ----------
-- ใส่ค่าให้ทุกมิเตอร์ ทุกวัน ในช่วง 7 วันล่าสุด
insert into readings (meter_id, reading_date, value)
select
  m.id,
  d::date,
  round((10 + random() * 25)::numeric, 1)
from meters m
cross join generate_series(current_date - 6, current_date, interval '1 day') as d;
