import { useState } from "react";
import { cn } from "@/lib/utils";

type PetImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

const FALLBACK =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=600&fit=crop";

export function PetImage({ src, alt, className, fallbackClassName }: PetImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? FALLBACK : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("block", className, failed && fallbackClassName)}
    />
  );
}
