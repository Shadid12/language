// app/(protected)/stats/page.tsx  -- **Server Component** by default
import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Stats() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // Fetch any RLS‑protected data here…

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Statistics</h1>
      <p>Welcome, {session.user.email}!</p>
      {/* Display user statistics or any other relevant data here */}
    </div>
  )
}
