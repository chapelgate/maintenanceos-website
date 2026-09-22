import { PRODUCT_TOUR } from "@/lib/product-tour";

/**
 * Claims-safe, click-to-play product tour. Server component — starts only
 * after the visitor presses play. Sound stays available. No hero JS.
 */
export function ProductTour() {
  return (
    <figure className="product-tour-card">
      <video
        controls
        playsInline
        preload="none"
        poster={PRODUCT_TOUR.poster}
        width={PRODUCT_TOUR.width}
        height={PRODUCT_TOUR.height}
        aria-label={PRODUCT_TOUR.caption}
      >
        <source src={PRODUCT_TOUR.src} type="video/mp4" />
        <track
          kind="captions"
          srcLang="en-GB"
          label="English (UK)"
          src={PRODUCT_TOUR.captions}
          default
        />
      </video>
      <figcaption>{PRODUCT_TOUR.caption}</figcaption>
    </figure>
  );
}

/** Compact home link — quieter than CtaPair. Not a play control. */
export function ProductTourWatchLink({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-muted ${className}`.trim()}>
      <a
        href={PRODUCT_TOUR.watchHref}
        className="font-normal text-muted underline-offset-4 hover:text-accent hover:underline"
      >
        {PRODUCT_TOUR.watchLabel}
      </a>
    </p>
  );
}
