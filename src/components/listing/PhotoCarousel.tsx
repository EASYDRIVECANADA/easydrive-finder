import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;
  const go = (delta: number) => setIdx((i) => (i + delta + total) % total);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
        <img src={images[idx]} alt={alt} className="h-full w-full object-cover" />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">
              {idx + 1} / {total}
            </div>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              type="button"
              key={src + i}
              onClick={() => setIdx(i)}
              className={cn(
                "h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition",
                i === idx ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
