import HeroSection from "../components/HeroSection";
import ProjectsPreview from "../components/ProjectsPreview";
import DatasetsPreview from "../components/DatasetsPreview";
import ResearchSection from "../components/ResearchSection";
import GalleryCarousel from "../components/GalleryCarousel";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Projects Preview */}
      <ProjectsPreview />

      {/* Datasets Preview */}
      <DatasetsPreview />

      {/* Research Section */}
      <ResearchSection />

      {/* Gallery Carousel */}
      <GalleryCarousel />
    </div>
  );
}
