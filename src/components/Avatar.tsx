const TINTS = [
  "bg-[#f3e6dc] text-[#8a4b27]",
  "bg-[#e5ece4] text-[#3d5a44]",
  "bg-[#e4e9f0] text-[#3b5068]",
  "bg-[#efe6ef] text-[#6a4a6b]",
  "bg-[#f2ecda] text-[#6f5b23]",
];

function tintFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export default function Avatar({
  name,
  size = "w-8 h-8 text-xs",
}: {
  name: string;
  size?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${tintFor(name)}`}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}
