export const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#808080" },
  { name: "Cream", hex: "#f2ead3" },
  { name: "Beige", hex: "#d6c4a1" },
  { name: "Brown", hex: "#6b4423" },
  { name: "Tan", hex: "#b98a5a" },
  { name: "Red", hex: "#c0392b" },
  { name: "Pink", hex: "#e8a0b4" },
  { name: "Orange", hex: "#e67e22" },
  { name: "Yellow", hex: "#f1c40f" },
  { name: "Green", hex: "#1e8449" },
  { name: "Olive", hex: "#6b6b2f" },
  { name: "Blue", hex: "#2e6db4" },
  { name: "Navy", hex: "#1b2a49" },
  { name: "Purple", hex: "#7d4fa3" },
];

export function swatchColor(color) {
  return color.hex || color.name.toLowerCase().replace(/\s+/g, "");
}