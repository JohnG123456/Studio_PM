export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.4}
    >
      <rect x="14" y="14" width="68" height="68" rx="10" />
      <path d="M28 66V44M48 66V30M68 66V50" strokeLinecap="round" />
      <circle cx="28" cy="38" r="4" fill="var(--accent)" stroke="none" />
      <circle cx="48" cy="24" r="4" fill="var(--accent)" stroke="none" />
      <circle cx="68" cy="44" r="4" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
