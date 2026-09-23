import Image from "next/image";

type HomePhotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

/**
 * Static-export photograph (`images.unoptimized`). Width/height reserved for CLS.
 * Only the true LCP candidate is priority; others lazy-load.
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
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      decoding="async"
      priority={priority}
      className={className}
    />
  );
}
