/** Cor de texto legível sobre um fundo hex (#rrggbb): tinta escura ou papel claro. */
export function readableOn(hex: string, dark = "#181715", light = "#f7f6f2") {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return light;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  // contraste com branco vs. com preto
  return (1.05 / (lum + 0.05)) >= ((lum + 0.05) / 0.05) ? light : dark;
}
