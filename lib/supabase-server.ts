// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Generic helper – call this in Server Components, Route Handlers, etc.
export const supabaseServer = () => {
  // next/headers gives you access to the request/response cookies
  const storePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /** read every cookie Supabase needs */
        getAll: async () => {
          const store = await storePromise;
          return store.getAll().map(({ name, value }) => ({ name, value }));
        },

        /** write *all* cookies Supabase wants to set */
        setAll: async (cookieList) => {
          const store = await storePromise;
          cookieList.forEach(({ name, value, ...options }) => {
            // options is fully typed (Path, Secure, SameSite, Expires, etc.)
            store.set({ name, value, ...options } as CookieOptions & {
              name: string;
              value: string;
            });
          });
        },
      },
    }
  );
};
