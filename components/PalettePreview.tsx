interface ColorSwatch {
  name: string;
  hex: string;
  oklch: {
    lightness: number;
    chroma: number;
    hue: number;
  };
}

interface PalettePreviewProps {
  colorName: string;
  lightPalette: ColorSwatch[];
  darkPalette: ColorSwatch[];
  showDarkMode: boolean;
}

export function PalettePreview({
  colorName,
  lightPalette,
  darkPalette,
  showDarkMode,
}: PalettePreviewProps) {
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map((val) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getTextColor = (hex: string) => {
    const lum = getLuminance(hex);
    return lum > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Light Mode Preview */}
      <div>
        <h3 className="mb-2 text-[11px] text-[#666] uppercase tracking-wide">
          ☀️ Light Mode
        </h3>
        <div className="flex flex-wrap gap-1">
          {lightPalette.map((color) => (
            <div
              key={color.name}
              className="flex flex-col items-center"
              style={{ width: "48px" }}
            >
              <div
                className="w-12 h-12 rounded border border-[#e5e5e5] flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={`${colorName}-${color.name}\n${color.hex}\nOKLCH: ${color.oklch.lightness.toFixed(1)}% ${color.oklch.chroma.toFixed(3)} ${color.oklch.hue.toFixed(1)}`}
              >
                <span
                  className="text-[10px]"
                  style={{ color: getTextColor(color.hex) }}
                >
                  {color.name}
                </span>
              </div>
              <span className="text-[9px] text-[#999] mt-1">{color.hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Mode Preview */}
      {showDarkMode && darkPalette.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] text-[#666] uppercase tracking-wide">
            🌙 Dark Mode
          </h3>
          <div className="rounded bg-[#121212] p-3">
            <div className="flex flex-wrap gap-1">
              {darkPalette.map((color) => (
                <div
                  key={color.name}
                  className="flex flex-col items-center"
                  style={{ width: "48px" }}
                >
                  <div
                    className="w-12 h-12 rounded border border-[#333] flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                    title={`${colorName}-dark-${color.name}\n${color.hex}\nOKLCH: ${color.oklch.lightness.toFixed(1)}% ${color.oklch.chroma.toFixed(3)} ${color.oklch.hue.toFixed(1)}`}
                  >
                    <span
                      className="text-[10px]"
                      style={{ color: getTextColor(color.hex) }}
                    >
                      {color.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#666] mt-1">
                    {color.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
