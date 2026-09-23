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
