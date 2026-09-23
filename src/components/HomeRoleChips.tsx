/**
 * Compact role chips — scan only, existing /industries/* routes, no new claims.
 * Hub keeps eight UK verticals equal-weight; chips are a skim entry, not a collapse.
 */
const ROLE_CHIPS = [
  { href: "/industries/landlords/", label: "Landlords", scan: "landlord" },
  { href: "/industries/letting-agents/", label: "Letting agents", scan: "agent" },
  {
    href: "/industries/property-managers/",
    label: "Property managers",
    scan: "PM",
  },
] as const;

export function HomeRoleChips() {
  return (
    <nav
      aria-label="Roles"
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      <p className="w-full text-xs font-medium uppercase tracking-wide text-muted sm:w-auto sm:mr-1">
        Built for
      </p>
      {ROLE_CHIPS.map((role) => (
        <a
          key={role.href}
          href={role.href}
          className="home-role-chip"
        >
          <span className="sr-only">{role.label}</span>
          <span aria-hidden="true">{role.scan}</span>
        </a>
      ))}
      <a href="/industries/" className="home-role-chip home-role-chip--all">
        All 8 UK verticals
      </a>
    </nav>
  );
}
