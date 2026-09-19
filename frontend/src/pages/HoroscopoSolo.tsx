import ZodiacWidget from "@/components/agnes/ZodiacWidget";

/**
 * Página isolada do widget de horóscopo — pensada para ser embutida em outras
 * páginas/sites via <iframe src=".../horoscopo"> e trazer tráfego para os planos.
 * Renderiza apenas o widget, sem menu nem rodapé.
 */
export default function HoroscopoSolo() {
  return (
    <main className="min-h-screen w-full bg-navy-deep">
      <ZodiacWidget plansHref="/#pagamento" />
    </main>
  );
}
