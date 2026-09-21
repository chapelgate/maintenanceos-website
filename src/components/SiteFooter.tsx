import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-dusk text-on-dusk">
      <div className="mx-auto grid max-w-[70rem] gap-10 px-4 py-12 md:px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg text-on-dusk" aria-label={siteConfig.name}>
            <span className="font-medium">Maintenance</span>
            <span className="font-semibold">OS</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Built for UK maintenance operations. Pre-launch — not commercially
            generally available.
          </p>
        </div>
        {(
          [
            ["Product", footerNav.product],
            ["Company", footerNav.company],
            ["Legal", footerNav.legal],
          ] as const
        ).map(([title, links]) => (
          <div key={title}>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {title}
            </p>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-200 transition-colors hover:text-white"
                  >
                    {link.label}
                    {title === "Legal" ? (
                      <span className="ml-1 text-xs text-slate-400">
                        (draft)
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-700 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[70rem] flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Chapelgate · MaintenanceOS</p>
          <div className="flex flex-wrap gap-4">
            {footerNav.convert.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
