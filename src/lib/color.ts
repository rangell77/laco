function luminance(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Razão de contraste WCAG entre duas cores hex (1 a 21). */
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Cor de texto legível sobre um fundo hex (#rrggbb): tinta escura ou papel claro. */
export function readableOn(hex: string, dark = "#181715", light = "#f7f6f2") {
  if (!/^#?[0-9a-f]{6}$/i.test(hex)) return light;
  return contrast(hex, light) >= contrast(hex, dark) ? light : dark;
}
