"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const LINKS = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/sobre-nosotros", label: "Nosotros" },
  { href: "/#comparativa", label: "Comparativa" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <span className="w-8 h-8 rounded-lg bg-quipu-500 flex items-center justify-center text-white text-sm font-black">Q</span>
          <span className="text-white">Yalita</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/onboarding" className="text-sm text-neutral-400 hover:text-white transition-colors">Iniciar sesión</Link>
          <Link href="/onboarding">
            <Button variant="primary" size="sm">Empezar gratis →</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-neutral-400 hover:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open
              ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
          </svg>
        </button>
      </nav>

      <div className={cn("md:hidden border-t border-white/5 overflow-hidden transition-all duration-300", open ? "max-h-64" : "max-h-0")}>
        <div className="px-4 py-4 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href} href={l.href}
              className="block px-4 py-3 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/onboarding" className="block" onClick={() => setOpen(false)}>
            <Button variant="primary" size="md" fullWidth className="mt-2">Empezar gratis →</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
