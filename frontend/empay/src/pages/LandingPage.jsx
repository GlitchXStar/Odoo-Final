import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureMarquee from '../components/landing/FeatureMarquee';
import HowItWorks from '../components/landing/HowItWorks';
import Benefits from '../components/landing/Benefits';
import ModuleGrid from '../components/landing/ModuleGrid';
import CTABand from '../components/landing/CTABand';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureMarquee />
        <HowItWorks />
        <Benefits />
        <ModuleGrid />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
