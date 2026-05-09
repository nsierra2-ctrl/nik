import { useState } from "react";
import { resolveImageUrl } from "@/lib/storage-url";

export default function ProductImage({
  imagePath,
  alt,
  className = "",
  testId,
  cacheBust,
}: {
  imagePath: string | null | undefined;
  alt: string;
  className?: string;
  testId?: string;
  cacheBust?: string | number | null;
}) {
  const [errored, setErrored] = useState(false);
  const url = resolveImageUrl(imagePath, { cacheBust });
  const showImage = url && !errored;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.12), transparent 55%), radial-gradient(circle at 70% 80%, rgba(0,229,255,0.1), transparent 55%), #0a0a14",
      }}
      data-testid={testId}
    >
      {showImage ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center grid-bg">
          <div className="text-center px-4">
            <div
              className="font-display text-3xl sm:text-4xl text-gradient leading-none mb-2"
              style={{ letterSpacing: "0.15em" }}
            >
              VPS
            </div>
            <div
              className="font-mono text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "var(--color-muted-2)" }}
            >
              {alt.length > 30 ? alt.slice(0, 30) + "…" : alt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
