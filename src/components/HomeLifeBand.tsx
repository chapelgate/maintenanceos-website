import { HomePhoto } from "@/components/HomePhoto";
import { IntakeOrbAccent } from "@/components/IntakeOrbAccent";
import { HOME_MEDIA } from "@/content/home-media";

/**
 * Cinematic photographic band — atmosphere only.
 * Copy stays claims-safe: stock, not customers, not a live phone.
 */
export function HomeLifeBand() {
  return (
    <section
      className="home-life-band border-b border-border"
      aria-labelledby="home-life-heading"
    >
      <div className="home-life-band-frame">
        <HomePhoto
          src={HOME_MEDIA.row.src}
          alt={HOME_MEDIA.row.alt}
          width={HOME_MEDIA.row.width}
          height={HOME_MEDIA.row.height}
          className="home-photo-motion"
        />
      </div>
      <div className="home-life-band-copy mos-glass">
        <div className="section-band-head">
          <IntakeOrbAccent />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Stock photograph · UK street
            </p>
            <h2
              id="home-life-heading"
              className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
            >
              The same operation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Licensed stock of a UK street. Not a customer, and not a live job.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
