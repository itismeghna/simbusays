import Image from "next/image";

type MediaItem = { id: string; url: string; type: string };

export default function MediaGallery({ media }: { media: MediaItem[] }) {
  if (media.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 my-10">
      {media.map((item, i) =>
        item.type === "video" ? (
          <video
            key={item.id}
            src={item.url}
            controls
            playsInline
            className="w-full max-h-[80vh] rounded-xl bg-ink"
          />
        ) : (
          <Image
            key={item.id}
            src={item.url}
            alt=""
            width={0}
            height={0}
            sizes="(min-width: 768px) 720px, 100vw"
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-auto max-h-[85vh] object-contain rounded-xl bg-subtle"
          />
        )
      )}
    </div>
  );
}
