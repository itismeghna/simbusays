import PawIcon from "./PawIcon";

export default function Footer() {
  return (
    <footer className="mt-16 bg-cream-deep">
      <div className="mx-auto max-w-5xl px-5 py-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-caramel">
          <PawIcon className="w-4 h-4 -rotate-12" />
          <PawIcon className="w-4 h-4 rotate-6" />
          <PawIcon className="w-4 h-4 -rotate-3" />
        </div>
        <p className="text-sm text-caramel-deep/80 font-medium">
          Simbu Says &middot; curated adventures, told with a mane full of enthusiasm.
        </p>
        <p className="text-xs text-caramel-deep/50">
          &copy; {new Date().getFullYear()} Meghna Mane
        </p>
      </div>
    </footer>
  );
}
