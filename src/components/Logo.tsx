export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="8" stroke={dark ? "#0f6e6e" : "#7fd1c7"} strokeWidth="2" />
        <path d="M16 8v16M8 16h16" stroke={dark ? "#0f6e6e" : "#7fd1c7"} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className={`text-lg font-bold ${dark ? "text-ink" : "text-white"}`}>Acredit</span>
        <span className={`text-xs ${dark ? "text-slate-600" : "text-slate-300"}`}>pregătire ANMCS</span>
      </div>
    </div>
  );
}
