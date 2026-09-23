type HomePhotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

/**
 * Static-export photograph. Width/height reserved for CLS.
 * Raw <img> keeps next/image off the home First Load graph (≤110 kB).
 * Only the true LCP candidate gets fetchPriority=high; others lazy-load.
 */
export function HomePhoto({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: HomePhotoProps) {
  return (
    // next/image would add ~5 kB to home First Load; export is unoptimized anyway.
    // eslint-disable-next-line @next/next/no-img-element -- static export + JS budget
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      {...(priority
        ? { fetchPriority: "high" as const }
        : { loading: "lazy" as const })}
      className={className}
    />
  );
}
