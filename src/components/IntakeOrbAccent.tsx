type IntakeOrbAccentProps = {
  /** Header wash vs a quiet section-band mark. Never a logo or CTA. */
  size?: "header" | "band";
};

/**
 * Decorative listening-cue glow. CSS-only — no client island.
 * Not a brand mark, not a conversion control, not on /create.
 */
export function IntakeOrbAccent({ size = "band" }: IntakeOrbAccentProps) {
  return (
    <span
      className={`intake-orb-accent intake-orb-accent--${size}`}
      aria-hidden="true"
    />
  );
}
