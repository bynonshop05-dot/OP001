import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const isConfigured =
  url.startsWith('https://') &&
  !url.includes('YOUR-PROJECT') &&
  key.length > 20 &&
  !key.includes('YOUR-ANON')

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isConfigured) return null
  if (!_client) _client = createClient(url, key)
  return _client
}

// backward-compat shim — pages that import { supabase } still compile
export const supabase = isConfigured ? createClient(url, key) : null as unknown as SupabaseClient
