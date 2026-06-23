import { supabase } from './supabase'

export type MachineStatus = 'Running' | 'Maintenance' | 'Stopped' | 'Standby'
export type Priority = 'High' | 'Medium' | 'Low'
export type WoStatus = 'pending' | 'progress' | 'completed' | 'overdue'

export interface Machine {
  id: string
  code: string
  name: string
  dept: string
  area: string
  model: string
  status: MachineStatus
  created_at: string
  updated_at: string
}

export interface PmPlan {
  id: string
  pm_no: string
  machine_id?: string
  machine_name: string
  dept: string
  frequency: string
  priority: Priority
  owner: string
  description?: string
  next_due: string
  progress: number
  is_paused: boolean
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  id: string
  wo_no: string
  plan_id?: string
  pm_no: string
  machine_name: string
  dept: string
  priority: Priority
  status: WoStatus
  assignee: string
  due_date: string
  is_auto: boolean
  before_photo?: string
  after_photo?: string
  created_at: string
  completed_at?: string
}

export interface ChecklistItem {
  id: string
  wo_id: string
  label: string
  is_checked: boolean
  sort_order: number
}

export interface Comment {
  id: string
  wo_id: string
  author: string
  author_id?: string
  text: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  role: string
  initials: string
  created_at: string
}

export const auth = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        initials: (fullName || '').trim().slice(0, 2),
        role: 'technician',
      })
    }
    return data.user
  },
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  },
  async signOut() {
    await supabase.auth.signOut()
  },
  async currentUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  },
  onChange(cb: (user: unknown) => void) {
    return supabase.auth.onAuthStateChange((_e, session) => cb(session?.user || null))
  },
}

export const db = {
  async listMachines(): Promise<Machine[]> {
    const { data, error } = await supabase
      .from('machines').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  async addMachine(m: Partial<Machine>): Promise<Machine> {
    const { data, error } = await supabase.from('machines').insert(m).select().single()
    if (error) throw error
    return data
  },
  async updateMachine(id: string, patch: Partial<Machine>): Promise<Machine> {
    const { data, error } = await supabase
      .from('machines').update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async deleteMachine(id: string) {
    const { error } = await supabase.from('machines').delete().eq('id', id)
    if (error) throw error
  },

  async listPlans(): Promise<PmPlan[]> {
    const { data, error } = await supabase
      .from('pm_plans').select('*').order('next_due', { ascending: true })
    if (error) throw error
    return data || []
  },
  async addPlan(p: Partial<PmPlan>): Promise<PmPlan> {
    const { data, error } = await supabase.from('pm_plans').insert(p).select().single()
    if (error) throw error
    return data
  },
  async updatePlan(id: string, patch: Partial<PmPlan>): Promise<PmPlan> {
    const { data, error } = await supabase
      .from('pm_plans').update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async setPlanPaused(id: string, paused: boolean) {
    return db.updatePlan(id, { is_paused: paused })
  },
  async deletePlan(id: string) {
    const { error } = await supabase.from('pm_plans').delete().eq('id', id)
    if (error) throw error
  },

  async listWorkOrders(): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders').select('*').order('due_date', { ascending: true })
    if (error) throw error
    return data || []
  },
  async addWorkOrder(w: Partial<WorkOrder>): Promise<WorkOrder> {
    const { data, error } = await supabase.from('work_orders').insert(w).select().single()
    if (error) throw error
    return data
  },
  async updateWorkOrder(id: string, patch: Partial<WorkOrder>): Promise<WorkOrder> {
    const { data, error } = await supabase
      .from('work_orders').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async listChecklist(woId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('wo_checklist').select('*').eq('wo_id', woId).order('sort_order')
    if (error) throw error
    return data || []
  },
  async toggleChecklist(itemId: string, checked: boolean) {
    const { error } = await supabase
      .from('wo_checklist').update({ is_checked: checked }).eq('id', itemId)
    if (error) throw error
  },
  async addChecklistItem(woId: string, label: string, sortOrder: number) {
    const { data, error } = await supabase
      .from('wo_checklist').insert({ wo_id: woId, label, sort_order: sortOrder })
      .select().single()
    if (error) throw error
    return data
  },

  async listComments(woId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('wo_comments').select('*').eq('wo_id', woId).order('created_at')
    if (error) throw error
    return data || []
  },
  async addComment(woId: string, author: string, text: string, authorId?: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('wo_comments').insert({ wo_id: woId, author, text, author_id: authorId })
      .select().single()
    if (error) throw error
    return data
  },

  async uploadPhoto(woId: string, kind: 'before' | 'after', file: File): Promise<string> {
    const path = `${woId}/${kind}-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('wo-photos').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('wo-photos').getPublicUrl(path)
    await db.updateWorkOrder(woId, { [`${kind}_photo`]: data.publicUrl })
    return data.publicUrl
  },
}

export async function autoDispatchDueWork() {
  const plans = await db.listPlans()
  const orders = await db.listWorkOrders()
  const existingPm = new Set(orders.map((o) => o.pm_no))
  const today = new Date(); today.setHours(0, 0, 0, 0)

  for (const p of plans) {
    if (p.is_paused || !p.next_due) continue
    const due = new Date(p.next_due)
    const days = Math.round((due.getTime() - today.getTime()) / 86400000)
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
      })
    }
  }
}
