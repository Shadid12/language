import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LanguageScenariosPageClient from '@/components/LanguageScenariosPage'

export default async function LanguageScenariosPage() {
  const supabase = supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 🚫 Not logged in? Kick to /login
  if (!session) redirect('/login')

  // ✅ Logged in – render the interactive client UI
  return <LanguageScenariosPageClient />
}
