"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, AlignStartVertical } from "lucide-react";
import { MenuBar } from "@/components/ui/glow-menu";

const menuItems = [
  {
    icon: Home,
    label: "Home",
    href: "/", // 👈 real route
    gradient:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: AlignStartVertical,
    label: "Stats",
    href: "/stats",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
];

export default function MenuBarDemo() {
  const pathname = usePathname();
  const router = useRouter();

  // helper to derive label from current pathname
  const deriveActive = () => {
    const match = menuItems.find((m) =>
      m.href !== "/" ? pathname.startsWith(m.href) : pathname === "/",
    );
    return match?.label ?? "Home";
  };

  const [activeItem, setActiveItem] = useState<string>(deriveActive);

  // Update when the route changes (e.g., via back/forward browser nav)
  useEffect(() => {
    setActiveItem(deriveActive());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // When a user taps a tab
  const handleItemClick = (label: string) => {
    const item = menuItems.find((m) => m.label === label);
    if (!item) return;

    setActiveItem(label);
    if (pathname !== item.href) router.push(item.href);
  };

  return (
    <MenuBar items={menuItems} activeItem={activeItem} onItemClick={handleItemClick} />
  );
}
