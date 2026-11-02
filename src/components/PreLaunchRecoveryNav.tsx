type RecoveryLink = { href: string; label: string };

const DEFAULT_LINKS: RecoveryLink[] = [
  { href: "/help/", label: "Help" },
  { href: "/trust/", label: "Trust" },
  { href: "/security/", label: "Security" },
  { href: "/contact/", label: "Contact" },
];

type Props = {
  links?: RecoveryLink[];
  note?: string;
  className?: string;
};

export function PreLaunchRecoveryNav({
  links = DEFAULT_LINKS,
  note = "Documentation surfaces only — not a live support desk.",
  className = "text-sm text-muted",
}: Props) {
  return (
    <p className={className}>
      Related pre-launch pages:{" "}
      {links.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? " · " : null}
          <a
            href={link.href}
            className="font-medium text-accent underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
          >
            {link.label}
          </a>
        </span>
      ))}
      {". "}
      {note}
    </p>
  );
}
