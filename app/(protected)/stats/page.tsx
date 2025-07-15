// app/(protected)/stats/page.tsx
import { supabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ChartLineInteractive } from "@/components/ChartLineInteractive"

export default async function Stats() {
  const supabase = supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">User Statistics</h1>
        <p className="text-muted-foreground">Welcome, {session.user.email}!</p>
        <p className="text-sm text-muted-foreground">
          Current Learning: <span className="font-semibold">Spanish (Mexican) 🇲🇽</span>
        </p>
      </header>

      {/* Interactive chart */}
      <ChartLineInteractive />
    </div>
  )
}
