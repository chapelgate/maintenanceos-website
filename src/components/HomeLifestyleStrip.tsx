import { HomePhoto } from "@/components/HomePhoto";
import { HOME_MEDIA, HOME_MEDIA_HONESTY } from "@/content/home-media";

/**
 * Lifestyle stills under the H1 — people / phones / site work.
 * Licensed stock only. Never framed as customers, quotes, or social proof.
 */
export function HomeLifestyleStrip() {
  return (
    <figure className="home-lifestyle-strip">
      <div className="home-lifestyle-strip-grid">
        <div className="home-photo-frame home-photo-frame--strip">
          <HomePhoto
            src={HOME_MEDIA.phone.src}
            alt={HOME_MEDIA.phone.alt}
            width={HOME_MEDIA.phone.width}
            height={HOME_MEDIA.phone.height}
            className="home-photo-motion"
          />
        </div>
        <div className="home-photo-frame home-photo-frame--strip">
          <HomePhoto
            src={HOME_MEDIA.trade.src}
            alt={HOME_MEDIA.trade.alt}
            width={HOME_MEDIA.trade.width}
            height={HOME_MEDIA.trade.height}
            className="home-photo-motion"
          />
        </div>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted">
        {HOME_MEDIA_HONESTY}. People on phones and a site moment — licensed
        stills, not testimonials.
      </figcaption>
    </figure>
  );
}
