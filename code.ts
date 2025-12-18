// Plugin code for Figma
// This runs in the Figma plugin sandbox

type NamingFormat = "kebab-case" | "camelCase" | "PascalCase" | "snake_case";

interface OKLCHColor {
  lightness: number;
  chroma: number;
  hue: number;
}

interface ColorInput {
  colorName: string;
  inputMode: "hex" | "oklch";
  hexColor?: string;
  oklch?: OKLCHColor;
  // Advanced options per color
  collectionName?: string;
  useDescription?: boolean;
  description?: string;
  codeSyntaxPlatform?: "WEB" | "ANDROID" | "iOS";
  useLightMode?: boolean;
  useDarkMode?: boolean;
  numberOfVariants?: number;
}

interface PaletteMessage {
  type: "generate-palette";
  colors: ColorInput[];
  namingFormat: NamingFormat;
  createComponents: boolean;
  createVariables: boolean;
}

// Color conversion utilities
function hexToOklch(hex: string): OKLCHColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const lightness = L * 100;
  const chroma = Math.sqrt(a * a + b_ * b_);
  let hue = (Math.atan2(b_, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return { lightness, chroma, hue };
}

function oklchToRgb(
  l: number,
  c: number,
  h: number
): { r: number; g: number; b: number } {
  const hRad = (h * Math.PI) / 180;
  const a_val = c * Math.cos(hRad);
  const b_val = c * Math.sin(hRad);

  const l_ = l / 100;
  const lms_l = l_ + 0.3963377774 * a_val + 0.2158037573 * b_val;
  const lms_m = l_ - 0.1055613458 * a_val - 0.0638541728 * b_val;
  const lms_s = l_ - 0.0894841775 * a_val - 1.291485548 * b_val;

  const l3 = lms_l * lms_l * lms_l;
  const m3 = lms_m * lms_m * lms_m;
  const s3 = lms_s * lms_s * lms_s;

  const r_lin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gammaCorrect = (c: number) => {
    const abs = Math.abs(c);
    if (abs > 0.0031308) {
      return Math.sign(c) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }
    return 12.92 * c;
  };

  let r = gammaCorrect(r_lin);
  let g = gammaCorrect(g_lin);
  let b = gammaCorrect(b_lin);

  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b = Math.max(0, Math.min(1, b));

  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Naming utilities
function formatColorName(
  colorName: string,
  shade: string,
  format: NamingFormat
): string {
  switch (format) {
    case "kebab-case":
      return `${colorName}-${shade}`;
    case "camelCase":
      return `${colorName}${shade}`;
    case "PascalCase":
      return `${colorName[0].toUpperCase()}${colorName.slice(1)}${shade}`;
    case "snake_case":
      return `${colorName}_${shade}`;
    default:
      return `${colorName}-${shade}`;
  }
}

// Accessibility contrast calculations
function getRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r;
  const gsRGB = g;
  const bsRGB = b;

  const RsRGB =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const GsRGB =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const BsRGB =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateWCAGContrast(bgRgb: { r: number; g: number; b: number }, fgRgb: { r: number; g: number; b: number }): number {
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgLum = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  return getContrastRatio(bgLum, fgLum);
}

function calculateAPCA(bgRgb: { r: number; g: number; b: number }, fgRgb: { r: number; g: number; b: number }): number {
  // Simplified APCA calculation
  const bgY = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgY = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  
  const clampY = (Y: number) => Math.max(Y, 0.0);
  const Ybg = clampY(bgY);
  const Yfg = clampY(fgY);
  
  const deltaYmin = 0.0005;
  const Yclamp = 1.414;
  
  if (Math.abs(Ybg - Yfg) < deltaYmin) return 0.0;
  
  let SAPC: number;
  if (Ybg > Yfg) {
    SAPC = (Math.pow(Ybg, 0.56) - Math.pow(Yfg, 0.57)) * Yclamp;
  } else {
    SAPC = (Math.pow(Ybg, 0.65) - Math.pow(Yfg, 0.62)) * Yclamp;
  }
  
  return Math.abs(SAPC * 100);
}

function getBestForeground(bgRgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };
  
  const contrastWhite = calculateWCAGContrast(bgRgb, white);
  const contrastBlack = calculateWCAGContrast(bgRgb, black);
  
  return contrastWhite > contrastBlack ? white : black;
}

// Palette generation with custom number of variants
function generatePalette(
  baseOklch: OKLCHColor, 
  isDarkMode: boolean = false,
  numberOfVariants: number = 9
): Array<{ name: string; hex: string; rgb: { r: number; g: number; b: number }; oklch: OKLCHColor }> {
  // Calculate lightness range based on mode
  // Light ramp should reach down to 5 (requested), dark ramp keeps its floor.
  const minLightness = isDarkMode ? 36.0 : 5.0;
  const maxLightness = isDarkMode ? 98.5 : 97.0;
  
  // Generate interpolated shades with smooth transitions
  // Always interpolate evenly from maxLightness to minLightness to avoid jumps
  const shades: Array<{ name: string; lightness: number; chromaFactor: number }> = [];
  
  for (let i = 0; i < numberOfVariants; i++) {
    const shadeNumber = i + 1;
    const name = `${shadeNumber}00`;
    
    // Calculate position in the range (0 to 1)
    // 0 = lightest (maxLightness), 1 = darkest (minLightness)
    const position = numberOfVariants === 1 ? 0.5 : i / (numberOfVariants - 1);
    
    // Interpolate lightness from max to min (smooth linear interpolation)
    // This ensures no jumps in the palette - smooth gradient
    const lightness = maxLightness - (position * (maxLightness - minLightness));
    
    // Interpolate chroma factor based on position
    // Use a curve that starts low, peaks in the middle, and ends slightly lower
    let chromaFactor: number;
    if (position < 0.5) {
      // First half: from 0.7-0.75 to 1.0 (increasing)
      chromaFactor = 0.7 + (position * 2) * 0.3;
    } else {
      // Second half: from 1.0 to 0.98-1.0 (slightly decreasing)
      chromaFactor = 1.0 - ((position - 0.5) * 2) * 0.02;
    }
    
    // Adjust chroma factor based on mode
    if (isDarkMode) {
      chromaFactor = chromaFactor * 0.95; // Slightly reduce chroma for dark mode
    }
    
    shades.push({
      name,
      lightness: Math.max(0, Math.min(100, lightness)),
      chromaFactor: Math.max(0.5, Math.min(1.1, chromaFactor)),
    });
  }

  return shades.map((shade) => {
    const chroma = baseOklch.chroma * shade.chromaFactor;
    const rgb = oklchToRgb(shade.lightness, chroma, baseOklch.hue);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    return {
      name: shade.name,
      hex,
      rgb,
      oklch: {
        lightness: shade.lightness,
        chroma,
        hue: baseOklch.hue,
      },
    };
  });
}

// Create parent component
async function createParentComponent(
  colorName: string,
  namingFormat: NamingFormat
): Promise<ComponentNode> {
  const componentName = formatColorName(colorName, "template", namingFormat);
  const component = figma.createComponent();
  component.name = componentName;
  component.resize(240, 400);

  // Load fonts first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  // Color name title (outside/above card)
  const nameLabel = figma.createText();
  nameLabel.characters = "color-500";
  nameLabel.fontSize = 16;
  nameLabel.fontName = { family: "Inter", style: "Semi Bold" };
  nameLabel.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
  nameLabel.x = 0;
  nameLabel.y = 0;
  nameLabel.name = "color-name";
  component.appendChild(nameLabel);

  // White container background (starts at y=32)
  const container = figma.createRectangle();
  container.resize(240, 360);
  container.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  container.cornerRadius = 12;
  container.y = 32;
  container.name = "container";
  component.appendChild(container);

  // Color swatch area (top half - 180px)
  const swatch = figma.createRectangle();
  swatch.resize(240, 180);
  swatch.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
  swatch.cornerRadius = 12;
  swatch.y = 32;
  swatch.name = "color-swatch";
  component.appendChild(swatch);

  // Sample text on swatch
  const sampleText = figma.createText();
  sampleText.characters = "Text";
  sampleText.fontSize = 72;
  sampleText.fontName = { family: "Inter", style: "Regular" };
  sampleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  sampleText.x = 16;
  sampleText.y = 80;
  sampleText.name = "sample-text";
  component.appendChild(sampleText);

  // Info section starts at y=228 (32 + 180 + 16)
  let yPos = 228;

  // HEX label + value
  const hexLabel = figma.createText();
  hexLabel.characters = "HEX: #4169E1";
  hexLabel.fontSize = 12;
  hexLabel.fontName = { family: "Inter", style: "Regular" };
  hexLabel.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
  hexLabel.x = 16;
  hexLabel.y = yPos;
  hexLabel.name = "hex-value";
  component.appendChild(hexLabel);

  yPos += 20;

  // OKLCH label + value
  const oklchText = figma.createText();
  oklchText.characters = "OKLCH: 60.5% 0.15 264.1";
  oklchText.fontSize = 12;
  oklchText.fontName = { family: "Inter", style: "Regular" };
  oklchText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
  oklchText.x = 16;
  oklchText.y = yPos;
  oklchText.name = "oklch-value";
  component.appendChild(oklchText);

  yPos += 28;

  // WCAG Container (for grouping)
  const wcagContainer = figma.createFrame();
  wcagContainer.resize(107, 51);
  wcagContainer.x = 16;
  wcagContainer.y = yPos;
  wcagContainer.name = "wcag-container";
  wcagContainer.fills = [];
  wcagContainer.clipsContent = false;
  component.appendChild(wcagContainer);

  // WCAG section title
  const wcagTitle = figma.createText();
  wcagTitle.characters = "WCAG 4.5:1";
  wcagTitle.fontSize = 13;
  wcagTitle.fontName = { family: "Inter", style: "Semi Bold" };
  wcagTitle.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  wcagTitle.x = 0;
  wcagTitle.y = 0;
  wcagTitle.name = "wcag-title";
  wcagContainer.appendChild(wcagTitle);

  // WCAG Text result
  const wcagText = figma.createText();
  wcagText.characters = "✓ Text: AAA (White)";
  wcagText.fontSize = 11;
  wcagText.fontName = { family: "Inter", style: "Medium" };
  wcagText.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.77, b: 0.29 } }];
  wcagText.x = 0;
  wcagText.y = 20;
  wcagText.name = "wcag-text";
  wcagContainer.appendChild(wcagText);

  // WCAG Large result
  const wcagLarge = figma.createText();
  wcagLarge.characters = "✓ Large: AAA";
  wcagLarge.fontSize = 11;
  wcagLarge.fontName = { family: "Inter", style: "Medium" };
  wcagLarge.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.77, b: 0.29 } }];
  wcagLarge.x = 0;
  wcagLarge.y = 38;
  wcagLarge.name = "wcag-large";
  wcagContainer.appendChild(wcagLarge);

  yPos += 62;

  // APCA Container (for grouping)
  const apcaContainer = figma.createFrame();
  apcaContainer.resize(103, 33);
  apcaContainer.x = 16;
  apcaContainer.y = yPos;
  apcaContainer.name = "apca-container";
  apcaContainer.fills = [];
  apcaContainer.clipsContent = false;
  component.appendChild(apcaContainer);

  // APCA section title
  const apcaTitle = figma.createText();
  apcaTitle.characters = "APCA Lc 75";
  apcaTitle.fontSize = 13;
  apcaTitle.fontName = { family: "Inter", style: "Semi Bold" };
  apcaTitle.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  apcaTitle.x = 0;
  apcaTitle.y = 0;
  apcaTitle.name = "apca-title";
  apcaContainer.appendChild(apcaTitle);

  // APCA Body result
  const apcaBody = figma.createText();
  apcaBody.characters = "✓ Readable (White)";
  apcaBody.fontSize = 11;
  apcaBody.fontName = { family: "Inter", style: "Regular" };
  apcaBody.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.77, b: 0.29 } }];
  apcaBody.x = 0;
  apcaBody.y = 20;
  apcaBody.name = "apca-body";
  apcaContainer.appendChild(apcaBody);

  // Add component properties
  // Text property for sample text
  const textProp = component.addComponentProperty("changeText", "TEXT", "Text");
  sampleText.componentPropertyReferences = { characters: textProp };

  // Boolean property to show/hide sample text
  const viewTextProp = component.addComponentProperty("viewText", "BOOLEAN", true);
  sampleText.componentPropertyReferences = { 
    ...sampleText.componentPropertyReferences,
    visible: viewTextProp 
  };

  // Boolean property to show/hide WCAG section
  const viewWcagProp = component.addComponentProperty("viewWcag", "BOOLEAN", true);
  wcagContainer.componentPropertyReferences = { visible: viewWcagProp };

  // Boolean property to show/hide APCA section
  const viewApcaProp = component.addComponentProperty("viewApca", "BOOLEAN", true);
  apcaContainer.componentPropertyReferences = { visible: viewApcaProp };

  return component;
}

// Create color instance
async function createColorInstance(
  parent: ComponentNode,
  colorName: string,
  shade: string,
  hex: string,
  oklch: OKLCHColor,
  namingFormat: NamingFormat,
  x: number,
  y: number,
  options?: {
    collectionName?: string;
    variableByName?: Map<string, Variable>;
  }
): Promise<InstanceNode> {
  const instance = parent.createInstance();
  const instanceName = formatColorName(colorName, shade, namingFormat);
  instance.name = instanceName;
  instance.x = x;
  instance.y = y;

  // Parse RGB from hex
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const bgRgb = { r, g, b };

  // Get best foreground color
  const fgRgb = getBestForeground(bgRgb);
  const fgColor = fgRgb.r === 1 ? "White" : "Black";

  // Calculate contrasts
  const wcagContrast = calculateWCAGContrast(bgRgb, fgRgb);
  const apcaContrast = calculateAPCA(bgRgb, fgRgb);

  // Determine WCAG levels (4.5 for normal, 3.0 for large)
  const wcagNormalPass = wcagContrast >= 4.5;
  const wcagLargePass = wcagContrast >= 3.0;

  // Determine APCA pass (60 Lc for body text)
  const apcaPass = Math.abs(apcaContrast) >= 60;

  // Update color name title
  const nameText = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "color-name"
  ) as TextNode;

  if (nameText) {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    nameText.characters = instanceName;
  }

  // Update color swatch
  const swatch = instance.findOne(
    (node) => node.type === "RECTANGLE" && node.name === "color-swatch"
  ) as RectangleNode;
  
  if (swatch) {
    const solidPaint: SolidPaint = { type: "SOLID", color: { r, g, b } };

    const collectionName = options?.collectionName;
    const variableByName = options?.variableByName;
    const varName =
      collectionName ? `${collectionName}/color/${colorName}/${shade}` : null;
    const variable = varName && variableByName ? variableByName.get(varName) : undefined;

    // Bind variable to the paint color when available (shows variable badge in UI)
    // Falls back to raw RGB if variable doesn't exist / variables not enabled.
    if (variable) {
      const bound = figma.variables.setBoundVariableForPaint(
        solidPaint,
        "color",
        variable
      );
      swatch.fills = [bound];
    } else {
      swatch.fills = [solidPaint];
    }
  }

  // Update "color" label
  const colorLabel = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "color-label"
  ) as TextNode;

  if (colorLabel) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    colorLabel.characters = colorName;
    colorLabel.fills = [{ type: "SOLID", color: fgRgb }];
  }

  // Update shade number
  const shadeNumber = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "shade-number"
  ) as TextNode;

  if (shadeNumber) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    shadeNumber.characters = shade;
    shadeNumber.fills = [{ type: "SOLID", color: fgRgb }];
  }

  // Update sample text
  const sampleText = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "sample-text"
  ) as TextNode;

  if (sampleText) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    sampleText.fills = [{ type: "SOLID", color: fgRgb }];
  }

  // Update HEX value
  const hexText = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "hex-value"
  ) as TextNode;

  if (hexText) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    hexText.characters = `HEX: ${hex}`;
  }

  // Update OKLCH value
  const oklchText = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "oklch-value"
  ) as TextNode;

  if (oklchText) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const oklchStr = `OKLCH: ${oklch.lightness.toFixed(1)}% ${oklch.chroma.toFixed(3)} ${oklch.hue.toFixed(1)}°`;
    oklchText.characters = oklchStr;
  }

  // Update WCAG title
  const wcagTitle = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "wcag-title"
  ) as TextNode;

  if (wcagTitle) {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    wcagTitle.characters = `WCAG ${wcagContrast.toFixed(1)}:1`;
  }

  // Update WCAG Normal Text result
  const wcagTextNode = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "wcag-text"
  ) as TextNode;

  if (wcagTextNode) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const icon = wcagNormalPass ? "✓" : "✗";
    wcagTextNode.characters = `${icon} Normal text (${fgColor})`;
    
    const textColor = wcagNormalPass 
      ? { r: 0.13, g: 0.77, b: 0.29 } 
      : { r: 0.9, g: 0.2, b: 0.2 };
    wcagTextNode.fills = [{ type: "SOLID", color: textColor }];
  }

  // Update WCAG Large result
  const wcagLargeNode = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "wcag-large"
  ) as TextNode;
  
  if (wcagLargeNode) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const icon = wcagLargePass ? "✓" : "✗";
    wcagLargeNode.characters = `${icon} Large text`;
    
    const largeColor = wcagLargePass 
      ? { r: 0.13, g: 0.77, b: 0.29 } 
      : { r: 0.9, g: 0.2, b: 0.2 };
    wcagLargeNode.fills = [{ type: "SOLID", color: largeColor }];
  }

  // Update APCA title
  const apcaTitle = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "apca-title"
  ) as TextNode;

  if (apcaTitle) {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    const apcaValue = Math.round(apcaContrast);
    apcaTitle.characters = `APCA Lc ${apcaValue}`;
  }

  // Update APCA Body result
  const apcaBodyNode = instance.findOne(
    (node) => node.type === "TEXT" && node.name === "apca-body"
  ) as TextNode;

  if (apcaBodyNode) {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    
    const icon = apcaPass ? "✓" : "✗";
    const status = apcaPass ? "Pass" : "Fail";
    const bodyColor = apcaPass 
      ? { r: 0.13, g: 0.77, b: 0.29 } 
      : { r: 0.9, g: 0.2, b: 0.2 };
    
    apcaBodyNode.characters = `${icon} Body text: ${status}`;
    apcaBodyNode.fills = [{ type: "SOLID", color: bodyColor }];
  }

  return instance;
}

// Create color variables with per-color options
async function createColorVariables(
  colorData: Array<{
    colorName: string;
    lightPalette: any[];
    darkPalette: any[];
    collectionName: string;
    useDescription: boolean;
    description: string;
    codeSyntaxPlatform?: "WEB" | "ANDROID" | "iOS";
    useLightMode: boolean;
    useDarkMode: boolean;
    useDefaultMode: boolean;
  }>
) {
  // Process each color with its own collection and options
  for (const { 
    colorName, 
    lightPalette, 
    darkPalette, 
    collectionName,
    useDescription,
    description,
    codeSyntaxPlatform,
    useLightMode,
    useDarkMode,
    useDefaultMode
  } of colorData) {
    // Get or create collection for this color
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find((c) => c.name === collectionName);
  
  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

    // Create modes based on options.
    // If neither Light nor Dark was selected, we create/use a single "Default" mode.
    let defaultModeId: string | null = null;
    let lightModeId: string | null = null;
    let darkModeId: string | null = null;

    if (useDefaultMode) {
      defaultModeId = collection.modes[0].modeId;
      if (collection.modes[0].name !== "Default") {
        collection.renameMode(defaultModeId, "Default");
      }
    } else {
      if (useLightMode) {
        lightModeId = collection.modes[0].modeId;
        if (collection.modes[0].name !== "Light") {
          collection.renameMode(lightModeId, "Light");
        }
      }

      if (useDarkMode) {
        if (collection.modes.length === 1 && useLightMode) {
          darkModeId = collection.addMode("Dark");
        } else {
          const darkMode = collection.modes.find((m) => m.name === "Dark");
          if (darkMode) {
            darkModeId = darkMode.modeId;
          } else if (useLightMode) {
            darkModeId = collection.addMode("Dark");
          } else {
            // If only dark mode, rename first mode
            darkModeId = collection.modes[0].modeId;
            collection.renameMode(darkModeId, "Dark");
          }
        }
      }
    }

    // Process all shades for this color
    const maxShades = Math.max(lightPalette.length, darkPalette.length);
    for (let i = 0; i < maxShades; i++) {
      const lightColor = lightPalette[i];
      const darkColor = darkPalette[i];
      
      // Only create variable if we have at least one mode
      if (!useDefaultMode && !useLightMode && !useDarkMode) continue;
      if (!lightColor && !darkColor) continue;

      // Use the first available color to determine shade name
      const shadeName = lightColor?.name || darkColor?.name || `${i}00`;
      const varName = `${collectionName}/color/${colorName}/${shadeName}`;
    
    const variables = await figma.variables.getLocalVariablesAsync();
    let variable = variables.find(
      (v) => v.name === varName && v.variableCollectionId === collection!.id
    );
    
    if (!variable) {
      variable = figma.variables.createVariable(varName, collection, "COLOR");
    }

    // Description
    variable.description = useDescription && description ? description : "";

    // Code syntax (campo nativo de Figma Variables)
    try {
      // Limpia definiciones previas para evitar estados raros entre iteraciones
      (["WEB", "ANDROID", "iOS"] as const).forEach((p) => {
        try {
          variable.removeVariableCodeSyntax(p);
        } catch {
          // ignore (si no existía)
        }
      });

      if (codeSyntaxPlatform) {
        const webName = varName.replace(/\//g, "-");
        const androidName = varName.replace(/\//g, "_");
        const value =
          codeSyntaxPlatform === "WEB"
            ? `var(--${webName})`
            : codeSyntaxPlatform === "ANDROID"
              ? `@color/${androidName}`
              : `Color("${webName}")`;

        variable.setVariableCodeSyntax(codeSyntaxPlatform, value);
      }
    } catch (e) {
      console.warn("No se pudo aplicar code syntax", e);
    }

      // Set Default mode value
      if (useDefaultMode && defaultModeId && lightColor) {
        variable.setValueForMode(defaultModeId, {
          r: lightColor.rgb.r,
          g: lightColor.rgb.g,
          b: lightColor.rgb.b,
        });
      }

      // Set Light mode value
      if (!useDefaultMode && useLightMode && lightModeId && lightColor) {
        variable.setValueForMode(lightModeId, {
          r: lightColor.rgb.r,
          g: lightColor.rgb.g,
          b: lightColor.rgb.b,
        });
      }

      // Set Dark mode value
      if (!useDefaultMode && useDarkMode && darkModeId && darkColor) {
        variable.setValueForMode(darkModeId, {
          r: darkColor.rgb.r,
          g: darkColor.rgb.g,
          b: darkColor.rgb.b,
        });
      }
    }
  }
}

// Main handler
async function handleGeneratePalette(msg: PaletteMessage) {
  try {
    const colorData: Array<{
      colorName: string;
      lightPalette: any[];
      darkPalette: any[];
      collectionName: string;
      useDescription: boolean;
      description: string;
      codeSyntaxPlatform?: "WEB" | "ANDROID" | "iOS";
      useLightMode: boolean;
      useDarkMode: boolean;
      useDefaultMode: boolean;
    }> = [];

    // Process all colors
    for (const colorInput of msg.colors) {
    // Get OKLCH color
    let baseOklch: OKLCHColor;
      if (colorInput.inputMode === "hex" && colorInput.hexColor) {
        baseOklch = hexToOklch(colorInput.hexColor);
      } else if (colorInput.inputMode === "oklch" && colorInput.oklch) {
        baseOklch = colorInput.oklch;
    } else {
        figma.notify(`❌ Error: Invalid color data for ${colorInput.colorName}`);
        continue;
      }

      // Get number of variants (default to 9)
      const numberOfVariants = colorInput.numberOfVariants || 9;
      const requestedLightMode = colorInput.useLightMode !== false; // Default true
      const requestedDarkMode = colorInput.useDarkMode !== false; // Default true
      const useDefaultMode = !requestedLightMode && !requestedDarkMode;
      const useLightMode = requestedLightMode || useDefaultMode;
      const useDarkMode = requestedDarkMode;

      // Generate palettes based on mode preferences
      const lightPalette = useLightMode 
        ? generatePalette(baseOklch, false, numberOfVariants)
        : [];
      const darkPalette = useDarkMode
        ? generatePalette(baseOklch, true, numberOfVariants)
        : [];

      colorData.push({
        colorName: colorInput.colorName,
        lightPalette,
        darkPalette,
        collectionName: colorInput.collectionName || "primitives",
        useDescription: colorInput.useDescription || false,
        description: colorInput.description || "",
        codeSyntaxPlatform: colorInput.codeSyntaxPlatform,
        useLightMode,
        useDarkMode,
        useDefaultMode,
      });
    }

    // Create variables if enabled
    if (msg.createVariables && colorData.length > 0) {
      await createColorVariables(colorData);
    }

    // Build variable lookup (name -> Variable) after creation, for binding paints.
    // Note: only local variables are supported here (created by this plugin).
    let variableByName: Map<string, Variable> | undefined;
    let collectionsByName: Map<string, VariableCollection> | undefined;
    if (msg.createVariables) {
      const vars = await figma.variables.getLocalVariablesAsync();
      variableByName = new Map(vars.map((v) => [v.name, v]));

      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      collectionsByName = new Map(collections.map((c) => [c.name, c]));
    }

    // Create components if enabled (after variables so we can bind paints)
    if (msg.createComponents && colorData.length > 0) {
      for (let idx = 0; idx < colorData.length; idx++) {
        const {
          colorName,
          lightPalette,
          darkPalette,
          collectionName,
          useLightMode,
          useDarkMode,
          useDefaultMode,
        } = colorData[idx];

        const parentComponent = await createParentComponent(colorName, msg.namingFormat);
        figma.currentPage.appendChild(parentComponent);
        parentComponent.x = 0;
        parentComponent.y = idx * 1400;

        const collection = collectionsByName?.get(collectionName);
        const defaultModeId = collection?.modes.find((m) => m.name === "Default")?.modeId;
        const lightModeId = collection?.modes.find((m) => m.name === "Light")?.modeId;
        const darkModeId = collection?.modes.find((m) => m.name === "Dark")?.modeId;

        // If Default mode is selected, create a single Default frame
        if (useDefaultMode && lightPalette.length > 0) {
          const defaultFrame = figma.createFrame();
          defaultFrame.name = `${colorName} - Default Mode`;
          defaultFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          defaultFrame.paddingLeft = 24;
          defaultFrame.paddingRight = 24;
          defaultFrame.paddingTop = 24;
          defaultFrame.paddingBottom = 24;
          defaultFrame.itemSpacing = 16;
          defaultFrame.layoutMode = "HORIZONTAL";
          defaultFrame.counterAxisSizingMode = "AUTO";
          defaultFrame.primaryAxisSizingMode = "AUTO";
          figma.currentPage.appendChild(defaultFrame);
          defaultFrame.x = 0;
          defaultFrame.y = idx * 1400 + 450;

          if (collection && defaultModeId) {
            defaultFrame.setExplicitVariableModeForCollection(collection, defaultModeId);
          }

          for (const color of lightPalette) {
            const instance = await createColorInstance(
              parentComponent,
              colorName,
              color.name,
              color.hex,
              color.oklch,
              msg.namingFormat,
              0,
              0,
              { collectionName, variableByName }
            );
            defaultFrame.appendChild(instance);
          }
        } else {

        // Create Light mode frame (only if useLightMode is true)
        if (useLightMode && lightPalette.length > 0) {
          const lightFrame = figma.createFrame();
          lightFrame.name = `${colorName} - Light Mode`;
          lightFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          lightFrame.paddingLeft = 24;
          lightFrame.paddingRight = 24;
          lightFrame.paddingTop = 24;
          lightFrame.paddingBottom = 24;
          lightFrame.itemSpacing = 16;
          lightFrame.layoutMode = "HORIZONTAL";
          lightFrame.counterAxisSizingMode = "AUTO";
          lightFrame.primaryAxisSizingMode = "AUTO";
          figma.currentPage.appendChild(lightFrame);
          lightFrame.x = 0;
          lightFrame.y = idx * 1400 + 450;

          // Ensure the variable mode resolves to Light inside this frame
          if (collection && lightModeId) {
            lightFrame.setExplicitVariableModeForCollection(collection, lightModeId);
          }

          for (const color of lightPalette) {
            const instance = await createColorInstance(
              parentComponent,
              colorName,
              color.name,
              color.hex,
              color.oklch,
              msg.namingFormat,
              0,
              0,
              { collectionName, variableByName }
            );
            lightFrame.appendChild(instance);
          }
        }

        // Create Dark mode frame and instances (only if useDarkMode is true)
        if (useDarkMode && darkPalette.length > 0) {
          const darkFrame = figma.createFrame();
          darkFrame.name = `${colorName} - Dark Mode`;
          darkFrame.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
          darkFrame.paddingLeft = 24;
          darkFrame.paddingRight = 24;
          darkFrame.paddingTop = 24;
          darkFrame.paddingBottom = 24;
          darkFrame.itemSpacing = 16;
          darkFrame.layoutMode = "HORIZONTAL";
          darkFrame.counterAxisSizingMode = "AUTO";
          darkFrame.primaryAxisSizingMode = "AUTO";
          figma.currentPage.appendChild(darkFrame);
          darkFrame.x = 0;
          darkFrame.y = idx * 1400 + 900;

          // Ensure the variable mode resolves to Dark inside this frame
          if (collection && darkModeId) {
            darkFrame.setExplicitVariableModeForCollection(collection, darkModeId);
          }

          for (const color of darkPalette) {
            const instance = await createColorInstance(
              parentComponent,
              colorName,
              color.name,
              color.hex,
              color.oklch,
              msg.namingFormat,
              0,
              0,
              { collectionName, variableByName }
            );
            darkFrame.appendChild(instance);
          }
        }
        }
      }
    }

    if (colorData.length > 0) {
      figma.notify(`✅ Generated ${colorData.length} ramp(s) successfully!`);
      if (msg.createComponents) {
        figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
      }
    }
  } catch (error) {
    figma.notify("❌ Error: " + (error as Error).message);
    console.error(error);
  }
}

// Plugin setup
figma.showUI(__html__, { width: 340, height: 800, themeColors: true });

figma.ui.onmessage = async (msg) => {
  if (msg?.type === "ui-resize" && typeof msg.height === "number") {
    // Clamp to a reasonable range for the plugin panel
    const h = Math.max(360, Math.min(900, Math.floor(msg.height)));
    figma.ui.resize(340, h);
    return;
  }
  if (msg.type === "generate-palette") {
    await handleGeneratePalette(msg);
  } else if (msg.type === "import-json") {
    // Convert JSON format to new array format
    const colors: ColorInput[] = msg.data.colors.map((colorData: any) => ({
        colorName: colorData.name,
        inputMode: colorData.hex ? "hex" : "oklch",
        hexColor: colorData.hex,
        oklch: colorData.oklch,
    }));

    const paletteMsg: PaletteMessage = {
      type: "generate-palette",
      colors: colors.map(c => ({
        ...c,
        collectionName: msg.data.options?.collectionName || "primitives",
        useDescription: msg.data.options?.useDescription ?? false,
        description: msg.data.options?.variableDescription || "",
        useCodeSyntax: msg.data.options?.useCodeSyntax ?? false,
        useLightMode: msg.data.options?.useLightMode ?? true,
        useDarkMode: msg.data.options?.useDarkMode ?? true,
        numberOfVariants: msg.data.options?.numberOfVariants || 9,
      })),
      namingFormat: msg.data.options?.namingFormat || "kebab-case",
        createComponents: msg.data.options?.createComponents ?? true,
        createVariables: msg.data.options?.createVariables ?? true,
      };

      await handleGeneratePalette(paletteMsg);
  }
};