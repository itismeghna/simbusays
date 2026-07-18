export default function Whiskers({
  side = "left",
  className = "",
}: {
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <span
      className={`whiskers ${side === "right" ? "whiskers-right" : ""} ${className}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}
