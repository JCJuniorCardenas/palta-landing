import { AboutSection } from '@/components/landing/AboutSection';
import { ConservationSection } from '@/components/landing/ConservationSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { LocationSection } from '@/components/landing/LocationSection';
import { OrganicVisitSection } from '@/components/landing/OrganicVisitSection';
import { ProductionSection } from '@/components/landing/ProductionSection';
import { RecipesSection } from '@/components/landing/RecipesSection';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
import { StorySection } from '@/components/landing/StorySection';
import { storyScenes } from '@/content/story';

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip bg-[#FAF9F6] text-[#1F1F1C]">
        <HeroSection />
        <AboutSection />
        <StorySection scenes={storyScenes} />
        <ProductionSection />
        <ConservationSection />
        <RecipesSection />
        <ReviewsSection />
        <OrganicVisitSection />
        <LocationSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
