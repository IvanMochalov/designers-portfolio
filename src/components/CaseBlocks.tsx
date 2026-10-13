import { assetUrl } from "../data/assets";
import { content } from "../data/content";
import type { Block } from "../data/types";
import { ZoomImage } from "./ZoomImage";

function TextBlockView({ block }: { block: Extract<Block, { type: "text" }> }) {
  return (
    <div className="prose">
      {block.heading ? <h3>{block.heading}</h3> : null}
      <p>{block.body}</p>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "text") return <TextBlockView block={block} />;
  if (block.type === "image") {
    return <ZoomImage src={block.src} alt={block.alt} caption={block.caption} />;
  }
  if (block.type === "gallery") {
    return (
      <div className="gallery">
        {block.images.map((image) => (
          <ZoomImage key={image.src} src={image.src} alt={image.alt} caption={image.caption} />
        ))}
      </div>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote>
        <p>{block.text}</p>
        <footer>
          {block.author}
          {block.role ? <span>{block.role}</span> : null}
        </footer>
      </blockquote>
    );
  }
  if (block.type === "list") {
    return (
      <ol className="point-list">
        {block.items.map((item) => (
          <li key={item.label}>
            <strong>{item.label}</strong>
            {item.text ? <span>{item.text}</span> : null}
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === "video") {
    return (
      <figure className="zoom-figure">
        <video src={assetUrl(block.src)} poster={block.poster ? assetUrl(block.poster) : undefined} controls />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <div className="nda">
      <p>{block.body}</p>
      <a href={`mailto:${content.profile.email}`}>{content.profile.email}</a>
    </div>
  );
}

export function CaseBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="case-blocks">
      {blocks.map((block, index) => (
        <BlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}
