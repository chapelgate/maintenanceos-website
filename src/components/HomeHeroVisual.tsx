import { HomePhoto } from "@/components/HomePhoto";
import { SiriOrbCloud } from "@/components/SiriOrbCloud";
import { HOME_MEDIA } from "@/content/home-media";

/**
 * Home hero visual — UK street photograph + secondary intake orb.
 * Create CTA stays in the copy column. The labelled shell sits below the hero.
 */
export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage">
      <figure className="home-photo-frame home-photo-frame--lead">
        <HomePhoto
          src={HOME_MEDIA.terrace.src}
          alt={HOME_MEDIA.terrace.alt}
          width={HOME_MEDIA.terrace.width}
          height={HOME_MEDIA.terrace.height}
          priority
          className="home-photo-motion"
        />
      </figure>
      <div className="home-hero-orb">
        <SiriOrbCloud />
      </div>
    </div>
  );
}
