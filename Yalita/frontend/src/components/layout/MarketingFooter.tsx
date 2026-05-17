import Link from "next/link";

const COLUMNS = {
  Producto: [
    { href: "/como-funciona", label: "Cómo funciona" },
    { href: "/onboarding", label: "Empezar gratis" },
    { href: "/#comparativa", label: "Comparativa" },
  ],
  Protocolo: [
    { href: "#", label: "Documentación" },
    { href: "#", label: "Contratos" },
    { href: "#", label: "SDK" },
  ],
  Legal: [
    { href: "#", label: "Privacidad" },
    { href: "#", label: "Términos" },
    { href: "#", label: "Seguridad" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-neutral-950 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-black text-xl">
              <span className="w-8 h-8 rounded-lg bg-quipu-500 flex items-center justify-center text-white text-sm font-black">Q</span>
              <span className="text-white">Yalita</span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              La capa de identidad financiera para los 210M de latinos sin historial bancario.
            </p>
            <p className="text-neutral-600 text-xs">Construido en Avalanche ⛰️</p>
          </div>

          {Object.entries(COLUMNS).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-white font-semibold text-sm">{title}</h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-neutral-500 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© 2026 Yalita Protocol. Todos los derechos reservados.</p>
          <p>Avalanche Hackathon 2026 — DPI Track</p>
        </div>
      </div>
    </footer>
  );
}
