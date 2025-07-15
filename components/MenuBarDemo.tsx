"use client"

import { useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, AlignStartVertical, LogIn, LogOut } from "lucide-react"
import { MenuBar } from "@/components/ui/glow-menu"
import { SupabaseContext } from "@/components/SupabaseProvider"

/* -------- core items (always left‑aligned) ---------- */
const coreItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    gradient:
      "radial-gradient(circle,rgba(59,130,246,0.15)0%,rgba(37,99,235,0.06)50%,rgba(29,78,216,0)100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: AlignStartVertical,
    label: "Stats",
    href: "/stats",
    gradient:
      "radial-gradient(circle,rgba(34,197,94,0.15)0%,rgba(22,163,74,0.06)50%,rgba(21,128,61,0)100%)",
    iconColor: "text-green-500",
  },
]

export default function MenuBarDemo() {
  const { user, signOut } = useContext(SupabaseContext)
  const pathname = usePathname()
  const router = useRouter()

  /* -------- build full menu (adds auth button) ------- */
  const menuItems = useMemo(() => {
    const authItem = user
      ? {
          icon: LogOut,
          label: "Logout",
          href: "#logout",
          gradient:
            "radial-gradient(circle,rgba(239,68,68,0.15)0%,rgba(220,38,38,0.06)50%,rgba(185,28,28,0)100%)",
          iconColor: "text-red-500",
          className: "ml-auto", // ⬅️ pushes to the far right
        }
      : {
          icon: LogIn,
          label: "Login",
          href: "/login",
          gradient:
            "radial-gradient(circle,rgba(107,114,128,0.15)0%,rgba(107,114,128,0.06)50%,rgba(107,114,128,0)100%)",
          iconColor: "text-gray-500",
          className: "ml-auto", // ⬅️ pushes to the far right
        }

    return [...coreItems, authItem]
  }, [user])

  /* -------- active‑tab logic -------- */
  const deriveActive = () => {
    if (!user && pathname.startsWith("/login")) return "Login"
    const m = menuItems.find((i) =>
      i.href !== "/" ? pathname.startsWith(i.href) : pathname === "/",
    )
    return m?.label ?? "Home"
  }

  const [activeItem, setActiveItem] = useState<string>(deriveActive)
  useEffect(() => setActiveItem(deriveActive()), [pathname, user]) // eslint-disable-line

  /* -------- handle clicks -------- */
  const handleItemClick = async (label: string) => {
    const item = menuItems.find((m) => m.label === label)
    if (!item) return

    if (label === "Logout") {
      await signOut()
      router.push("/login")
      setActiveItem("Login")
      return
    }

    setActiveItem(label)
    if (pathname !== item.href) router.push(item.href)
  }

  return (
    <MenuBar
      items={menuItems}
      activeItem={activeItem}
      onItemClick={handleItemClick}
    />
  )
}
