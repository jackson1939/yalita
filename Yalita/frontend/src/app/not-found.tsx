import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-neutral-950">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-7xl font-black text-quipu-500">404</p>
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="text-neutral-400 text-sm">
          El enlace que seguiste no lleva a ningún lado. Pero tu crédito sí está a un click.
        </p>
        <Link href="/"><Button variant="primary" size="md">Volver al inicio →</Button></Link>
      </div>
    </main>
  );
}
