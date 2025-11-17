const COLORS: string[] = [
  "#e41a1c", // red
  "#377eb8", // blue
  "#4daf4a", // green
  "#984ea3", // purple
  "#ff7f00", // orange
  "#d4aa00", // dark yellow (better contrast)
  "#a65628", // brown
  "#b03060", // dark pink
  "#666666", // dark grey
  "#1f78b4", // deep blue
];

const nextColorForKey: { [key: string]: number } = {};

export function getColor(key: string): string {
  if (!(key in nextColorForKey)) {
    nextColorForKey[key] = COLORS.length - 1;
  }

  nextColorForKey[key] = (nextColorForKey[key] + 1) % COLORS.length;
  return COLORS[nextColorForKey[key]];
}
