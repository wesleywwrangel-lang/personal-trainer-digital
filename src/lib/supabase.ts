import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || supabaseUrl.includes('your-') || !supabaseUrl.startsWith('http')) {
  throw new Error('Supabase URL não configurada. Configure NEXT_PUBLIC_SUPABASE_URL no arquivo .env.local com uma URL válida do Supabase.')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-')) {
  throw new Error('Supabase Anon Key não configurada. Configure NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local com a chave anônima do Supabase.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)