import { SiriOrbCloud } from "@/components/SiriOrbCloud";

/**
 * Home hero visual — paper / soft-gradient stage for the intake orb.
 * No luxury house still. Create CTA stays in the copy column.
 * The labelled UNDER TEST shell sits below the hero.
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
