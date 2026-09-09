import Navbar from "@/components/agnes/Navbar";
import Hero from "@/components/agnes/Hero";
import Services from "@/components/agnes/Services";
import About from "@/components/agnes/About";
import Analysis from "@/components/agnes/Analysis";
import Terminal from "@/components/agnes/Terminal";
import Pricing from "@/components/agnes/Pricing";
import Footer from "@/components/agnes/Footer";
import SectionReveal from "@/components/museum/SectionReveal";

const Index = () => {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground">
      <Navbar />
      <Hero />

      <SectionReveal>
        <Services />
      </SectionReveal>

      <SectionReveal>
        <About />
      </SectionReveal>

      <SectionReveal>
        <Analysis />
      </SectionReveal>

      <SectionReveal>
        <Terminal />
      </SectionReveal>

      <SectionReveal>
        <Pricing />
      </SectionReveal>

      <Footer />
    </main>
  );
};

export default Index;
