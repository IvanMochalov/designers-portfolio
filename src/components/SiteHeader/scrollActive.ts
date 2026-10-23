export function scrollLeftToCenter(
  scrollWidth: number,
  clientWidth: number,
  itemOffset: number,
  itemWidth: number,
): number {
  const max = Math.max(0, scrollWidth - clientWidth);
  const target = itemOffset - (clientWidth - itemWidth) / 2;
  return Math.max(0, Math.min(max, target));
}
