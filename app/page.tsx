import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import Stats from "@/components/stats/Stats";
import About from "@/components/about/About";
import Footer from "@/components/layout/Footer";
import Stages from "@/components/stages/Stages";
import Features from "@/components/features/Features";
import Roadmap from "@/components/roadmap/Roadmap";
export default function Home() {
  return (
    
    <>
  <Navbar />
  <Hero />
  <Stats />
  <About />
  <Stages />
  <Features />
  <Roadmap />
  <Footer />
</>
    
  );
}