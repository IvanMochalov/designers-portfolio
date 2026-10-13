import { assetUrl } from "../data/assets";
import { useLightbox } from "./Lightbox";

type ZoomImageProps = {
  src: string;
  alt: string;
  caption?: string;
};

export function ZoomImage({ src, alt, caption }: ZoomImageProps) {
  const lightbox = useLightbox();
  const url = assetUrl(src);

  return (
    <figure className="zoom-figure">
      <button type="button" className="zoom-button" onClick={() => lightbox.open({ src: url, alt })}>
        <img src={url} alt={alt} />
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
