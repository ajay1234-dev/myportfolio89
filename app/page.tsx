import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";

const AboutSection = dynamic(() => import("@/components/sections/AboutSection"));
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"));
const SkillsSection = dynamic(() => import("@/components/sections/SkillsSection"), { ssr: false });
const ExperienceSection = dynamic(() => import("@/components/sections/ExperienceSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ExperienceSection />
      <ContactSection />
    </main>
  );
}

