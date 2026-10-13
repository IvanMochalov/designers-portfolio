const files = import.meta.glob("../assets/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function assetUrl(path: string): string {
  const fileName = path.replace(/^assets\//, "");
  const match = Object.entries(files).find(([key]) => key.endsWith(`/${fileName}`));
  return match?.[1] ?? path;
}
