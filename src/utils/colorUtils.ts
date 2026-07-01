export function getTaskColor(hue: number, progress: number): string {
  if (progress === 101) {
    return `hsl(0, 0%, 75%)`;
  }

  if (progress === -1) {
    return `hsl(${hue}, 65%, 55%)`;
  }

  const saturation = Math.max(5, 100 - (progress / 100) * 85);
  const lightness = 55 - (progress / 100) * 10;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getTaskBackgroundColor(hue: number, progress: number): string {
  if (progress === 101) {
    return `hsl(0, 0%, 93%)`;
  }

  if (progress === -1) {
    return `hsla(${hue}, 55%, 60%, 0.18)`;
  }

  const saturation = Math.max(5, 100 - (progress / 100) * 85);
  return `hsla(${hue}, ${saturation}%, 60%, 0.15)`;
}
