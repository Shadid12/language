// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = supabaseServer();
  await supabase.auth.exchangeCodeForSession(request.url);
  return NextResponse.redirect(new URL('/', request.url));
}
