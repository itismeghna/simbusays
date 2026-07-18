import Image from "next/image";

type MediaItem = { id: string; url: string; type: string };

export default function MediaGallery({ media }: { media: MediaItem[] }) {
  if (media.length === 0) return null;

  return (
    <div
      className={`grid gap-3 mb-8 ${
        media.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {media.map((item) => (
        <div
          key={item.id}
          className="relative rounded-2xl overflow-hidden bg-honey/30 aspect-[4/3]"
        >
          {item.type === "video" ? (
            <video src={item.url} className="w-full h-full object-cover" controls />
          ) : (
            <Image
              src={item.url}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}
