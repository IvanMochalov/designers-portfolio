import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type LightboxItem = { src: string; alt: string };

type LightboxContextValue = {
  open: (item: LightboxItem) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item]);

  return (
    <LightboxContext.Provider value={{ open: setItem }}>
      {children}
      {item ? (
        <button
          type="button"
          className="lightbox"
          aria-label="Close image"
          onClick={() => setItem(null)}
        >
          <img src={item.src} alt={item.alt} />
        </button>
      ) : null}
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxContextValue {
  const value = useContext(LightboxContext);
  if (!value) throw new Error("Lightbox is missing");
  return value;
}
