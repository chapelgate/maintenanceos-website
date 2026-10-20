import Link from "next/link";
import { notFound } from "next/navigation";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-ink mb-4">404</h1>
        <p className="text-muted mb-8 max-w-md">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 min-h-6 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-on-accent"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}