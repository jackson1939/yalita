import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export const metadata = { title: "Nosotros" };

export default function NosotrosPage() {
  return (
    <>
      <MarketingNavbar />
      <main className="pt-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
          <h1 className="text-5xl font-black">El equipo Yalita</h1>
          <p className="text-neutral-300 text-lg leading-relaxed">
            Somos 4 builders construyendo la capa de identidad financiera para Latinoamérica.
            Creemos que los 210M de personas sin acceso a crédito formal no son un problema de fraude
            — son un problema de medición. Tienen historial. Solo no está siendo escuchado.
          </p>
          <p className="text-neutral-400 leading-relaxed">
            Yalita existe para escuchar ese historial — el de los pagos QR, las billeteras móviles,
            los cobros del mercado — y traducirlo a algo que el sistema financiero pueda entender.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
