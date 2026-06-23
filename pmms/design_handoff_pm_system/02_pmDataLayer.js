// ============================================================
// PM Master System — Data Access Layer (Supabase adapter)
// บริษัท เกษตรชล 2559 จำกัด
// ------------------------------------------------------------
// ไฟล์นี้คือ "ตัวกลาง" ระหว่างหน้าจอ (UI) กับฐานข้อมูล
// ต้นแบบเดิมเก็บข้อมูลใน localStorage — ไฟล์นี้แทนที่ด้วย Supabase
// เพื่อให้ทุกคนเห็นข้อมูลชุดเดียวกัน + มีระบบ login
//
// วิธีใช้ใน React/Next/Vite:
//   import { db, auth } from './pmDataLayer.js'
//   const machines = await db.listMachines()
//   await db.addMachine({ code, name, dept, area, model, status })
// ============================================================

import { createClient } from '@supabase/supabase-js';

// ---- 1) ใส่คีย์จาก Supabase project ของคุณ (Settings → API) ----
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR-ANON-PUBLIC-KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ============================================================
// AUTH — ระบบ login / สมัคร / ออกจากระบบ
// ============================================================
export const auth = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        initials: (fullName || '').trim().slice(0, 2),
        role: 'technician',
      });
    }
    return data.user;
  },
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async currentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  onChange(cb) {
    return supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null));
  },
};

// ============================================================
// DB — อ่าน/เขียนข้อมูล (แทน localStorage ทั้งหมด)
// ============================================================
export const db = {
  // ---------- เครื่องจักร ----------
  async listMachines() {
    const { data, error } = await supabase
      .from('machines').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addMachine(m) {
    const { data, error } = await supabase.from('machines').insert(m).select().single();
    if (error) throw error;
    return data;
  },
  async deleteMachine(id) {
    const { error } = await supabase.from('machines').delete().eq('id', id);
    if (error) throw error;
  },

  // ---------- แผน PM ----------
  async listPlans() {
    const { data, error } = await supabase
      .from('pm_plans').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addPlan(p) {
    const { data, error } = await supabase.from('pm_plans').insert(p).select().single();
    if (error) throw error;
    return data;
  },
  async updatePlan(id, patch) {
    const { data, error } = await supabase
      .from('pm_plans').update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async setPlanPaused(id, paused) {
    return this.updatePlan(id, { is_paused: paused });
  },

  // ---------- ใบสั่งงาน ----------
  async listWorkOrders() {
    const { data, error } = await supabase
      .from('work_orders').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  async addWorkOrder(w) {
    const { data, error } = await supabase.from('work_orders').insert(w).select().single();
    if (error) throw error;
    return data;
  },
  async updateWorkOrder(id, patch) {
    const { data, error } = await supabase
      .from('work_orders').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // ---------- Checklist ----------
  async listChecklist(woId) {
    const { data, error } = await supabase
      .from('wo_checklist').select('*').eq('wo_id', woId).order('sort_order');
    if (error) throw error;
    return data;
  },
  async toggleChecklist(itemId, checked) {
    const { error } = await supabase
      .from('wo_checklist').update({ is_checked: checked }).eq('id', itemId);
    if (error) throw error;
  },

  // ---------- ความคิดเห็น ----------
  async listComments(woId) {
    const { data, error } = await supabase
      .from('wo_comments').select('*').eq('wo_id', woId).order('created_at');
    if (error) throw error;
    return data;
  },
  async addComment(woId, author, text, authorId) {
    const { data, error } = await supabase
      .from('wo_comments').insert({ wo_id: woId, author, text, author_id: authorId })
      .select().single();
    if (error) throw error;
    return data;
  },

  // ---------- รูปภาพ Before/After (Supabase Storage) ----------
  async uploadPhoto(woId, kind, file) {
    const path = `${woId}/${kind}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('wo-photos').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('wo-photos').getPublicUrl(path);
    await this.updateWorkOrder(woId, { [`${kind}_photo`]: data.publicUrl });
    return data.publicUrl;
  },
};

// ============================================================
// กฎ "ส่งใบสั่งงานอัตโนมัติ ก่อนครบกำหนด 5 วัน"
// ------------------------------------------------------------
// เรียกฟังก์ชันนี้ตอนเปิดแอป หรือทำเป็น scheduled job
// (Supabase Edge Function + pg_cron) ให้รันทุกวันก็ได้
// ============================================================
export async function autoDispatchDueWork() {
  const plans = await db.listPlans();
  const orders = await db.listWorkOrders();
  const existingPm = new Set(orders.map((o) => o.pm_no));
  const today = new Date(); today.setHours(0, 0, 0, 0);

  for (const p of plans) {
    if (p.is_paused || !p.next_due) continue;
    const due = new Date(p.next_due);
    const days = Math.round((due - today) / 86400000);
    if (days <= 5 && !existingPm.has(p.pm_no)) {
      await db.addWorkOrder({
        wo_no: 'WO-AUTO-' + p.pm_no.replace(/[^0-9]/g, '').slice(-4),
        plan_id: p.id,
        pm_no: p.pm_no,
        machine_name: p.machine_name,
        dept: p.dept,
        priority: p.priority,
        status: days < 0 ? 'overdue' : 'pending',
        assignee: p.owner,
        due_date: p.next_due,
        is_auto: true,
      });
    }
  }
}
