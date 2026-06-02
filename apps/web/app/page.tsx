import {
  Navbar,
  Hero,
  Problem,
  Features,
  DashboardPreview,
  NewsCarousel,
  FaqAccordion,
  Cta,
  SmoothScroll,
} from "@workspace/modules/landing";

export default function Page() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen overflow-clip bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <Hero />
        <Problem />
        <Features />
        <DashboardPreview />
        <NewsCarousel />
        <FaqAccordion />
        <Cta />
      </div>
    </SmoothScroll>
  );
}
