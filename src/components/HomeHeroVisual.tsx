import { HomePhoto } from "@/components/HomePhoto";
import { ProductUiShell } from "@/components/ProductUiShell";
import { SiriOrbCloud } from "@/components/SiriOrbCloud";
import { HOME_MEDIA, HOME_MEDIA_HONESTY } from "@/content/home-media";

/**
 * Home hero visual — photographic cluster + labelled UNDER TEST shell +
 * secondary intake orb. Create CTA stays in the copy column, not here.
 */
export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage">
      <div className="home-hero-photos">
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
        <figure className="home-photo-frame home-photo-frame--phone">
          <HomePhoto
            src={HOME_MEDIA.phone.src}
            alt={HOME_MEDIA.phone.alt}
            width={HOME_MEDIA.phone.width}
            height={HOME_MEDIA.phone.height}
            className="home-photo-motion"
          />
        </figure>
        <figure className="home-photo-frame home-photo-frame--trade">
          <HomePhoto
            src={HOME_MEDIA.trade.src}
            alt={HOME_MEDIA.trade.alt}
            width={HOME_MEDIA.trade.width}
            height={HOME_MEDIA.trade.height}
            className="home-photo-motion"
          />
        </figure>
      </div>

      <div className="home-hero-orb">
        <SiriOrbCloud />
      </div>

      <div className="home-hero-shell">
        <ProductUiShell />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        {HOME_MEDIA_HONESTY}. Licensed stills from Unsplash and Pexels — not
        RelicVault assets, not invented social proof.
      </p>
    </div>
  );
}
