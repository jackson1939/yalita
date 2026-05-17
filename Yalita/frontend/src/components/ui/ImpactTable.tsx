import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { Users, Watch, Landmark, Zap, ShieldCheck } from "lucide-react";

export function ImpactTable({ monto, plazo }: { monto: number; plazo: number }) {
  const tasaPrestamista = 0.15;
  const tasaEmpeno = 0.08;
  const tasaBanco = 0.045;
  const tasaQuipu = 0.015;

  const calcTotal = (tasa: number) => Math.round(monto + (monto * tasa * plazo));

  const totalPrestamistaRaw = calcTotal(tasaPrestamista);
  const totalEmpenoRaw = calcTotal(tasaEmpeno);
  const totalBancoRaw = calcTotal(tasaBanco);
  const totalQuipuRaw = calcTotal(tasaQuipu);
  const ahorroRaw = totalPrestamistaRaw - totalQuipuRaw;

  const totalPrestamista = useAnimatedNumber(totalPrestamistaRaw);
  const totalEmpeno = useAnimatedNumber(totalEmpenoRaw);
  const totalBanco = useAnimatedNumber(totalBancoRaw);
  const totalQuipu = useAnimatedNumber(totalQuipuRaw);
  const ahorro = useAnimatedNumber(ahorroRaw);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm animate-fadeIn"
      style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ background: "var(--y-surface-alt)", borderBottom: "1px solid var(--y-border)" }}>
            <th className="p-3"></th>
            <th className="p-3 text-center">
              <div className="flex flex-col items-center">
                <Users size={18} style={{ color: "var(--y-text-secondary)" }} className="mb-1" />
                <span className="text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--y-text-secondary)" }}>Prestamista</span>
              </div>
            </th>
            <th className="p-3 text-center">
              <div className="flex flex-col items-center">
                <Watch size={18} style={{ color: "var(--y-text-tertiary)" }} className="mb-1" />
                <span className="text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--y-text-tertiary)" }}>Empeño</span>
              </div>
            </th>
            <th className="p-3 text-center">
              <div className="flex flex-col items-center">
                <Landmark size={18} style={{ color: "var(--y-text-primary)" }} className="mb-1" />
                <span className="text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--y-text-primary)" }}>Bancos</span>
              </div>
            </th>
            <th className="p-3 text-center rounded-t-lg" style={{ background: "var(--y-primary)" }}>
              <div className="flex flex-col items-center">
                <Zap size={20} className="mb-1" style={{ color: "var(--y-text-on-primary)", fill: "rgba(var(--y-aqua-rgb), 0.3)" }} />
                <span className="text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--y-text-on-primary)" }}>⚡ Yalita</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="text-[11px] font-medium">
          <tr style={{ borderBottom: "1px solid var(--y-border)" }}>
            <td className="p-3" style={{ color: "var(--y-text-secondary)" }}>Tasa mensual</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>15.0%</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>8.0%</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>4.5%</td>
            <td className="p-3 text-center font-bold" style={{ color: "var(--y-green)", background: "rgba(44,180,98,0.05)", borderLeft: "1px solid var(--y-border)", borderRight: "1px solid var(--y-border)" }}>1.5%</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--y-border)" }}>
            <td className="p-3" style={{ color: "var(--y-text-secondary)" }}>Tiempo espera</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>Hoy mismo</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>Hoy mismo</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>7-15 días</td>
            <td className="p-3 text-center font-bold" style={{ color: "var(--y-green)", background: "rgba(44,180,98,0.05)", borderLeft: "1px solid var(--y-border)", borderRight: "1px solid var(--y-border)" }}>1 min</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--y-border)" }}>
            <td className="p-3 flex items-center gap-1" style={{ color: "var(--y-text-secondary)" }}>
              <ShieldCheck size={12} /> Seguridad
            </td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>Baja</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>Media</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-primary)" }}>Alta</td>
            <td className="p-3 text-center font-bold" style={{ color: "var(--y-green)", background: "rgba(44,180,98,0.05)", borderLeft: "1px solid var(--y-border)", borderRight: "1px solid var(--y-border)" }}>Alta</td>
          </tr>
          <tr className="font-bold" style={{ background: "var(--y-surface-alt)" }}>
            <td className="p-3 text-sm" style={{ color: "var(--y-text-primary)" }}>Pagas en total</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-secondary)" }}>Bs {totalPrestamista.toLocaleString()}</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-secondary)" }}>Bs {totalEmpeno.toLocaleString()}</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-secondary)" }}>Bs {totalBanco.toLocaleString()}</td>
            <td className="p-3 text-center text-lg" style={{ color: "var(--y-green)", background: "rgba(44,180,98,0.05)", borderLeft: "1px solid var(--y-green)", borderRight: "1px solid var(--y-green)", boxShadow: "0 0 0 1px var(--y-green)" }}>
              Bs {totalQuipu.toLocaleString()} ✨
            </td>
          </tr>
          <tr style={{ background: "var(--y-green-light)" }}>
            <td className="p-3 font-bold text-sm" style={{ color: "var(--y-text-primary)" }}>Ahorras con Yalita</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-tertiary)" }}>—</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-tertiary)" }}>—</td>
            <td className="p-3 text-center" style={{ color: "var(--y-text-tertiary)" }}>—</td>
            <td className="p-3 text-center font-bold text-lg rounded-b-lg" style={{ color: "var(--y-green)", background: "rgba(44,180,98,0.05)", borderLeft: "1px solid var(--y-green)", borderRight: "1px solid var(--y-green)" }}>
              ⚡ Bs {ahorro.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
