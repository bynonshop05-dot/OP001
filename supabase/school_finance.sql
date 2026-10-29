-- ============================================================
--  ระบบการเงินโรงเรียน (school-finance/) — ตารางเก็บข้อมูล
--  วางใน Supabase → SQL Editor → Run (รันซ้ำได้)
-- ============================================================
-- ข้อมูลทุกหมวด (ประเภทเงิน บัญชี รายการรับ-จ่าย ฎีกา ใบสั่งซื้อ ฯลฯ)
-- เก็บเป็นเอกสาร JSON แยกตาม col (หมวด) + id
create table if not exists public.sf_docs (
  col        text        not null,
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_by uuid        references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

-- เฉพาะผู้ที่ login แล้วเท่านั้นที่อ่าน/เขียนได้
alter table public.sf_docs enable row level security;

drop policy if exists "sf_docs read"   on public.sf_docs;
drop policy if exists "sf_docs insert" on public.sf_docs;
drop policy if exists "sf_docs update" on public.sf_docs;
drop policy if exists "sf_docs delete" on public.sf_docs;

create policy "sf_docs read"   on public.sf_docs for select to authenticated using (true);
create policy "sf_docs insert" on public.sf_docs for insert to authenticated with check (true);
create policy "sf_docs update" on public.sf_docs for update to authenticated using (true) with check (true);
create policy "sf_docs delete" on public.sf_docs for delete to authenticated using (true);

-- อัปเดตหน้าจออัตโนมัติเมื่อผู้ใช้คนอื่นแก้ข้อมูล (Realtime)
do $$ begin
  alter publication supabase_realtime add table public.sf_docs;
exception when duplicate_object then null; end $$;
