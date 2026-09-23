import { SiriOrbCloud } from "@/components/SiriOrbCloud";

/**
 * Home hero visual — paper stage; orb fills the old photo footprint.
 * No terrace still and no replacement stock in this slot.
 * Create CTA stays in the copy column. UNDER TEST shell sits below the hero.
 */
export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage">
      <div className="home-orb-stage">
        <SiriOrbCloud />
      </div>
    </div>
  );
}
