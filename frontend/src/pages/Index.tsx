import Navbar from "@/components/agnes/Navbar";
import Hero from "@/components/agnes/Hero";
import ZodiacWidget from "@/components/agnes/ZodiacWidget";
import Services from "@/components/agnes/Services";
import Pricing from "@/components/agnes/Pricing";
import Faq from "@/components/agnes/Faq";
import Footer from "@/components/agnes/Footer";

const Index = () => {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground">
      <Navbar />
      <Hero />

      {/* Widget de tráfego: 12 signos + horóscopo do dia em pop-up */}
      <ZodiacWidget />

      {/* Serviços fora do SectionReveal: a lista agora tem botões interativos
          (setas que abrem o pop-up) e o reveal esconderia o conteúdo. */}
      <Services />

      {/* Preços fora do SectionReveal: os cards têm botões de checkout
          interativos e o reveal esconderia o conteúdo até o observer
          disparar, deixando a seção vazia. */}
      <Pricing />

      {/* FAQ fora do SectionReveal: o acordeão tem botões interativos e o
          reveal esconderia os triggers até o observer disparar. */}
      <Faq />

      <Footer />
    </main>
  );
};

export default Index;
