export default function PawIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="15" ry="13" />
      <ellipse cx="14" cy="24" rx="7" ry="9" />
      <ellipse cx="30" cy="14" rx="7.5" ry="9.5" />
      <ellipse cx="47" cy="16" rx="7" ry="9" />
      <ellipse cx="58" cy="32" rx="6" ry="8" />
    </svg>
  );
}
