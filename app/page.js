import HeroSection from "../components/HeroSection";
import FeatureCards from "../components/FeatureCards";
import ProjectsPreview from "../components/ProjectsPreview";
import DatasetsPreview from "../components/DatasetsPreview";
import ResearchSection from "../components/ResearchSection";
import GalleryCarousel from "../components/GalleryCarousel";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Overview */}
      <FeatureCards />
      
      {/* Projects Preview */}
      <ProjectsPreview />
      
      {/* Datasets Preview */}
      <DatasetsPreview />
      
      {/* Research Section */}
      <ResearchSection />
      
      {/* Gallery Carousel */}
      <GalleryCarousel />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
