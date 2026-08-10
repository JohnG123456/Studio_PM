type IconProps = { className?: string; strokeWidth?: number };

const base = "currentColor";

export function IconDashboard({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.3" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.3" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.3" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.3" />
    </svg>
  );
}

export function IconBoard({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4" width="17" height="16" rx="1.6" />
      <path d="M9 4v16M15 4v16" />
    </svg>
  );
}

export function IconLink({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16 11.6" />
      <path d="M13 17.5 11.4 19.1a3.6 3.6 0 0 1-5.1-5.1L8 12.4" />
    </svg>
  );
}

export function IconTimeline({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="5" cy="18" r="1.8" />
      <path d="M8.5 6H20M8.5 12H20M8.5 18H20" />
    </svg>
  );
}

export function IconBook({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5h9.5a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H4Z" />
      <path d="M20 4.5h-3.5" />
      <path d="M20 4.5v13.5h-3" />
    </svg>
  );
}

export function IconDollar({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5v19" />
      <path d="M16.5 6.5c0-1.7-2-3-4.5-3S7.5 4.8 7.5 6.5s2 2.4 4.5 3.1 4.5 1.4 4.5 3.1-2 3.3-4.5 3.3-4.5-1.3-4.5-3" />
    </svg>
  );
}

export function IconPlus({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconTrash({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
    </svg>
  );
}

export function IconClipboard({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="4.5" width="13" height="16" rx="1.8" />
      <rect x="9" y="3" width="6" height="3.4" rx="1" />
      <path d="M8.5 12h7M8.5 16h5" />
    </svg>
  );
}

export function IconAlert({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 21 19.5H3Z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="0.9" fill={base} stroke="none" />
    </svg>
  );
}

export function IconSettings({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.3.9a7 7 0 0 0-1.9-1.1L14.3 3H9.7l-.4 2.4a7 7 0 0 0-1.9 1.1l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .7.1 1.1l-2 1.5 2 3.4 2.3-.9c.6.5 1.2.8 1.9 1.1l.4 2.4h4.6l.4-2.4c.7-.3 1.3-.6 1.9-1.1l2.3.9 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z" />
    </svg>
  );
}

export function IconChevronDown({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconX({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconLogOut({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4.5H7.5A1.5 1.5 0 0 0 6 6v12a1.5 1.5 0 0 0 1.5 1.5H15" />
      <path d="M20 12H10.5M20 12l-3.5-3.5M20 12l-3.5 3.5" />
    </svg>
  );
}

export function IconGear({ className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={base} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="10" rx="1.6" />
      <path d="M7.5 7V5.5M12 7V5.5M16.5 7V5.5" />
    </svg>
  );
}
