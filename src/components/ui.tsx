import type { ButtonHTMLAttributes, ReactNode } from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

const PATHS: Record<string, ReactNode> = {
  mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></>,
  micOff: <><line x1="2" x2="22" y1="2" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" /><path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" x2="12" y1="19" y2="22" /></>,
  video: <><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  videoOff: <><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196" /><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" /><path d="m2 2 20 20" /></>,
  captions: <><rect width="18" height="14" x="3" y="5" rx="2" /><path d="M7 15h4M15 15h2M7 11h2M13 11h4" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></>,
  arrowLeft: <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  file: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></>,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  rotate: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  grid: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
  headphones: <><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /></>,
  hand: <><path d="M18 11V6a2 2 0 0 0-4 0v1" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></>,
};
export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cx("shrink-0", className)}>{PATHS[name]}</svg>;
}

export function Spinner() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" /><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "lime" | "secondary" | "ghost" | "danger"; icon?: IconName; iconRight?: IconName; busy?: boolean };
const VARIANTS = {
  primary: "bg-forest text-cream hover:bg-forest-2",
  lime: "bg-lime text-ink hover:brightness-95",
  secondary: "bg-paper text-ink ring-1 ring-inset ring-ink/20 hover:ring-ink/50",
  ghost: "text-ink-2 hover:text-ink hover:bg-ink/5",
  danger: "text-bad ring-1 ring-inset ring-bad/40 hover:bg-bad/10",
};
export function Button({ variant = "primary", icon, iconRight, busy, className, children, disabled, ...p }: BtnProps) {
  return (
    <button {...p} disabled={disabled || busy} aria-busy={busy || undefined}
      className={cx("inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40", VARIANTS[variant], className)}>
      {busy ? <Spinner /> : icon && <Icon name={icon} />}{children}{!busy && iconRight && <Icon name={iconRight} />}
    </button>
  );
}

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => <div className={cx("rounded-3xl bg-paper p-5 sm:p-6", className)}>{children}</div>;
export const FIELD = "w-full min-h-12 rounded-2xl bg-paper px-4 py-3 text-base text-ink ring-1 ring-inset ring-ink/20 placeholder:text-ink-2/70 focus-visible:ring-2 focus-visible:ring-forest";

/** Selectable tile. Selection is shown by a filled check AND a forest edge, never colour alone. */
export function Choice({ selected, onClick, title, sub, className }: { selected: boolean; onClick: () => void; title: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cx("flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-left transition", selected ? "bg-lime-soft ring-2 ring-inset ring-forest" : "bg-paper ring-1 ring-inset ring-ink/15 hover:ring-ink/40", className)}>
      <span><span className="block text-[16px] font-bold leading-tight">{title}</span>{sub && <span className="mt-0.5 block text-[13.5px] text-ink-2">{sub}</span>}</span>
      <span aria-hidden="true" className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full", selected ? "bg-forest text-lime" : "ring-1 ring-inset ring-ink/30")}>{selected && <Icon name="check" className="h-3.5 w-3.5" />}</span>
    </button>
  );
}

export const Label = ({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: string }) => (
  <div className="mb-2"><label htmlFor={htmlFor} className="text-[15px] font-bold">{children}</label>{hint && <p className="text-[13.5px] text-ink-2">{hint}</p>}</div>
);

/** Fixed bottom bar for the main action on every step (thumb-reachable on phones). */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-cream/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-8">{children}</div>
    </div>
  );
}

export const ErrorBox = ({ children }: { children: ReactNode }) => <div role="alert" className="rounded-2xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">{children}</div>;
export const Avatar = ({ name, className = "h-10 w-10 text-base" }: { name: string; className?: string }) => <span aria-hidden="true" className={cx("grid shrink-0 place-items-center rounded-full bg-lime font-display text-forest", className)}>{(name || "?").charAt(0).toUpperCase()}</span>;

/** Hotseat mark: a speech bubble on forest. The product is a conversation. */
export function Mark({ className = "h-10 w-10", dark }: { className?: string; dark?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={cx("shrink-0", className)}>
      <rect width="40" height="40" rx="12" fill={dark ? "#c8f560" : "#0d3b2e"} />
      <path d="M11 12.5A3.5 3.5 0 0 1 14.5 9h11a3.5 3.5 0 0 1 3.5 3.5v8a3.5 3.5 0 0 1-3.5 3.5H20l-5.5 5v-5h0A3.5 3.5 0 0 1 11 20.5Z" fill={dark ? "#0d3b2e" : "#c8f560"} />
      <rect x="15" y="14" width="2.2" height="5" rx="1.1" fill={dark ? "#c8f560" : "#0d3b2e"} /><rect x="19" y="12.5" width="2.2" height="8" rx="1.1" fill={dark ? "#c8f560" : "#0d3b2e"} /><rect x="23" y="14.5" width="2.2" height="4" rx="1.1" fill={dark ? "#c8f560" : "#0d3b2e"} />
    </svg>
  );
}
export const Wordmark = ({ className = "text-2xl" }: { className?: string }) => <span className={cx("font-display font-extrabold", className)}>Hotseat</span>;

export type Who = "friendly" | "balanced" | "strict";
const SKIN: Record<Who, string> = { friendly: "#c68b64", balanced: "#b57b56", strict: "#a56b49" };
const BG: Record<Who, string> = { friendly: "#ffd66b", balanced: "#a8e6c3", strict: "#ffc9b8" };
const MOUTH = "#5a1e12";

/** The three interviewers, drawn flat. The mouth moves while they speak. */
export function Portrait({ who, speaking, className, round = true }: { who: Who; speaking?: boolean; className?: string; round?: boolean }) {
  const skin = SKIN[who];
  return (
    <svg role="img" aria-label={who === "friendly" ? "Priya" : who === "balanced" ? "Arjun" : "Mr. Kapoor"} viewBox="0 0 120 120" className={cx("shrink-0 overflow-hidden", round ? "rounded-full" : "rounded-3xl", className)}>
      <rect width="120" height="120" fill={BG[who]} />
      {who === "friendly" && <path d="M36 54C33 30 47 21 60 21s27 9 24 33l5 36c-9 4-15-9-17-20H48c-2 11-8 24-17 20Z" fill="#2b1810" />}
      <path d="M16 124c0-26 20-37 44-37s44 11 44 37Z" fill={who === "friendly" ? "#ff7a59" : who === "balanced" ? "#1e3a5f" : "#2a2f3a"} />
      <rect x="52" y="68" width="16" height="22" rx="7" fill={skin} />
      {who !== "friendly" && <path d="M48 87l12 15 12-15-6-3h-12Z" fill="#fff" />}
      {who === "strict" && <path d="M57 90h6l3 20-6 7-6-7Z" fill="#c4361b" />}
      {who === "friendly" && <path d="M50 88c4 8 16 8 20 0-4-3-16-3-20 0Z" fill={skin} />}
      {who !== "friendly" && <><circle cx="40" cy="55" r="4.5" fill={skin} /><circle cx="80" cy="55" r="4.5" fill={skin} /></>}
      <ellipse cx="60" cy="52" rx="20" ry="23" fill={skin} />
      {who === "friendly" && <><path d="M39 48c1-15 13-21 24-19 11 1 17 9 18 19-8-8-26-10-42 0Z" fill="#2b1810" /><circle cx="60" cy="41" r="1.7" fill="#c4361b" /><circle cx="39" cy="62" r="2.4" fill="#f2b632" /><circle cx="81" cy="62" r="2.4" fill="#f2b632" /></>}
      {who === "balanced" && <path d="M39 47c-2-18 12-23 23-22 13 1 20 10 18 22-4-9-12-12-21-12s-16 3-20 12Z" fill="#1e1410" />}
      {who === "strict" && <><path d="M41 44c3-12 35-12 38 0-8-6-30-6-38 0Z" fill="#cfcfcf" /><path d="M39 52c-3-3-3-9 0-12M81 52c3-3 3-9 0-12" stroke="#cfcfcf" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="51" cy="52" r="6.5" fill="none" stroke="#222" strokeWidth="1.8" /><circle cx="69" cy="52" r="6.5" fill="none" stroke="#222" strokeWidth="1.8" /><path d="M57.5 51.5h5" stroke="#222" strokeWidth="1.8" /></>}
      <circle cx="52" cy="52" r="2.1" fill="#1a1a1a" /><circle cx="68" cy="52" r="2.1" fill="#1a1a1a" />
      <path d={who === "strict" ? "M44 44l8 2M76 44l-8 2" : "M45 44q7-3 13 0M62 44q7-3 13 0"} stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
      {who === "strict" && <path d="M49 62q11-4 22 0 0 3-11 2.5T49 62Z" fill="#9a9a9a" />}
      {speaking ? <ellipse cx="60" cy={who === "strict" ? 69 : 65} rx="5.5" ry="4" fill={MOUTH} className="talk" /> : <path d={who === "strict" ? "M54 69q6 2 12 0" : "M53 64q7 6 14 0"} stroke={MOUTH} strokeWidth="2.2" strokeLinecap="round" fill="none" />}
    </svg>
  );
}

/** Voice bars. `level` (0..1) drives them for the mic; `active` animates them for the interviewer. */
export function Bars({ active, level, n = 11, className = "h-10 text-lime" }: { active?: boolean; level?: number; n?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("flex items-center justify-center gap-[5px]", className)}>
      {Array.from({ length: n }, (_, i) => {
        const base = 0.25 + 0.75 * Math.abs(Math.sin((i + 1) * 1.7));
        return <span key={i} className={cx("h-full w-[5px] rounded-full bg-current", active && "bar")}
          style={active ? { animationDelay: `${(i * 90) % 700}ms` } : { transform: `scaleY(${Math.max(0.12, Math.min(1, (level ?? 0) * 2.2 * base))})`, transformOrigin: "center", transition: "transform 80ms" }} />;
      })}
    </span>
  );
}
