"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: (a: boolean) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
    </svg>
  )},
  { href: "/score", label: "Mi Score", icon: (a: boolean) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <path d="M6 9.5l2 2 4-4" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
  { href: "/credito", label: "Crédito", icon: (a: boolean) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.75" y="4.75" width="14.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <path d="M1.75 8h14.5" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
    </svg>
  )},
  { href: "/repagar", label: "Repagar", icon: (a: boolean) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 9a6 6 0 1 1 12 0" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} strokeLinecap="round" />
      <path d="M15 9l-3-3M15 9l-3 3" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  )},
  { href: "/perfil", label: "Perfil", icon: (a: boolean) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="6" r="3.25" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} />
      <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth={a ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  )},
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, user } = usePrivy();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-neutral-950 border-r border-white/8 z-40">
      <div className="px-5 h-16 flex items-center border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 font-black text-lg">
          <span className="w-7 h-7 rounded-md bg-quipu-500 flex items-center justify-center text-white text-xs font-black">Q</span>
          <span className="text-white">Yalita</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-quipu-500/10 text-quipu-500" : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={active ? "text-quipu-500" : "text-neutral-500"}>{item.icon(active)}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-quipu-500/20 flex items-center justify-center text-quipu-500 text-xs font-bold flex-shrink-0">
            {user?.phone?.number?.slice(-2) ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.phone?.number ?? user?.email?.address ?? "Usuario"}
            </p>
            <p className="text-neutral-600 text-xs">Activo</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 14H2.5A1.5 1.5 0 0 1 1 12.5v-9A1.5 1.5 0 0 1 2.5 2H6M11 11l4-4-4-4M15 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
