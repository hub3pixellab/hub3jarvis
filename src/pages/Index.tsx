import Navbar from "@/components/museum/Navbar";
import HeroScroll from "@/components/museum/HeroScroll";
import CurrentExhibition from "@/components/museum/CurrentExhibition";
import ExhibitionHalls from "@/components/museum/ExhibitionHalls";
import Experience from "@/components/museum/Experience";
import Curator from "@/components/museum/Curator";
import LabArchive from "@/components/museum/LabArchive";
import Footer from "@/components/museum/Footer";
import StackedPanel from "@/components/museum/StackedPanel";
import SectionReveal from "@/components/museum/SectionReveal";

const Index = () => {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground">
      <Navbar />

      {/* Hero — keeps its own intro animation */}
      <HeroScroll />

      {/* Second screen gets pushed back as ExhibitionHalls slides up.
          CurrentExhibition has its own "gallery shutter" entrance,
          so it does NOT use SectionReveal. */}
      <StackedPanel index={0} total={2}>
        <CurrentExhibition />
      </StackedPanel>

      {/* Third screen — sliding cover, no reveal wrapper */}
      <ExhibitionHalls />

      {/* The rest — each animates in on scroll */}
      <SectionReveal>
        <Experience />
      </SectionReveal>
      <SectionReveal>
        <Curator />
      </SectionReveal>
      <SectionReveal>
        <LabArchive />
      </SectionReveal>
      <SectionReveal>
        <Footer />
      </SectionReveal>
    </main>
  );
};

export default Index;
