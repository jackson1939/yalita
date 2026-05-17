"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HandCoins, History, User } from "lucide-react";
import { useQuipuStore } from "@/stores/quipu.store";

export function BottomTabBar() {
  const pathname = usePathname();
  const activeLoan = useQuipuStore((s) => s.activeLoan);

  // Hide on splash screen and onboarding flow
  if (pathname === "/" || pathname.startsWith("/onboarding")) {
    return null;
  }

  const hasActiveLoan = activeLoan && activeLoan.status === "active";

  const prestamosHref = hasActiveLoan
    ? "/prestamos/activo"
    : "/prestamos/calculadora";

  const tabs = [
    { name: "Inicio", href: "/dashboard", icon: Home },
    { name: "Préstamos", href: prestamosHref, icon: HandCoins },
    { name: "Historial", href: "/historial", icon: History },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto safe-area-pb z-50"
      style={{
        background: "var(--y-surface)",
        borderTop: "1px solid var(--y-border)",
      }}
    >
      <nav className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/") ||
            (tab.name === "Préstamos" && pathname.startsWith("/prestamos"));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
              style={{
                color: isActive ? "var(--y-primary)" : "var(--y-text-tertiary)",
              }}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"}
                />
                {/* Badge for active loan */}
                {tab.name === "Préstamos" && hasActiveLoan && (
                  <span
                    className="absolute -top-1.5 -right-2.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--y-primary)",
                      color: "#FFFFFF",
                    }}
                  >
                    1
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? "var(--y-primary)" : "var(--y-text-tertiary)",
                }}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
