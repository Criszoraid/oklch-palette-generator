import { useState } from "react";

type InputMode = "hex" | "oklch";
type NamingFormat = "kebab-case" | "camelCase" | "PascalCase" | "snake_case";

interface ColorEntry {
  id: string;
  colorName: string;
  inputMode: InputMode;
  hexColor: string;
  lightness: number;
  chroma: number;
  hue: number;
  // Advanced options per color
  collectionName: string;
  useDescription: boolean;
  description: string;
  codeSyntaxPlatform: "NONE" | "WEB" | "ANDROID" | "iOS";
  useLightMode: boolean;
  useDarkMode: boolean;
  numberOfVariants: number;
}

export function PaletteConfigurator() {
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());
  const [namingFormat, setNamingFormat] = useState<NamingFormat>("kebab-case");
  
  // Multiple colors state
  const [colors, setColors] = useState<ColorEntry[]>([
    {
      id: "1",
      colorName: "blue",
      inputMode: "hex",
      hexColor: "#4169E1",
      lightness: 60.6,
      chroma: 0.202,
      hue: 262.8,
      collectionName: "primitives",
      useDescription: false,
      description: "",
      codeSyntaxPlatform: "NONE",
      useLightMode: true,
      useDarkMode: true,
      numberOfVariants: 9,
    },
  ]);
  
  // Options
  const [createComponents, setCreateComponents] = useState(true);
  const [createVariables, setCreateVariables] = useState(true);


  const addColor = () => {
    setColors([
      ...colors,
      {
        id: Date.now().toString(),
        colorName: `color-${colors.length + 1}`,
        inputMode: "hex",
        hexColor: "#4169E1",
        lightness: 60.6,
        chroma: 0.202,
        hue: 262.8,
        collectionName: "primitives",
        useDescription: false,
        description: "",
        codeSyntaxPlatform: "NONE",
        useLightMode: true,
        useDarkMode: true,
        numberOfVariants: 9,
      },
    ]);
  };

  const removeColor = (id: string) => {
    if (colors.length > 1) {
      setColors(colors.filter((c) => c.id !== id));
    }
  };

  const updateColor = (id: string, updates: Partial<ColorEntry>) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleGenerate = () => {
    const colorInputs = colors.map((color) => ({
      colorName: color.colorName,
      inputMode: color.inputMode,
      hexColor: color.inputMode === "hex" ? color.hexColor : undefined,
      oklch:
        color.inputMode === "oklch"
          ? { lightness: color.lightness, chroma: color.chroma, hue: color.hue }
          : undefined,
      // Advanced options
      collectionName: color.collectionName,
      useDescription: color.useDescription,
      description: color.description,
      codeSyntaxPlatform:
        color.codeSyntaxPlatform === "NONE" ? undefined : color.codeSyntaxPlatform,
      useLightMode: color.useLightMode,
      useDarkMode: color.useDarkMode,
      numberOfVariants: color.numberOfVariants,
    }));

    const message = {
      type: "generate-palette",
      colors: colorInputs,
      namingFormat,
      createComponents,
      createVariables,
    };

    // Enviar mensaje al código del plugin de Figma
    if (typeof parent !== 'undefined') {
      parent.postMessage({ pluginMessage: message }, "*");
    } else {
      console.error("parent no está disponible. Esto debe ejecutarse en el contexto de un plugin de Figma.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Colors List */}
      <div>
        <div className="mb-3 flex items-center justify-between border-b border-[#e5e5e5] pb-2">
          <label className="block text-[#333] text-[12px] font-semibold">
            Colores ({colors.length})
          </label>
        </div>

        <div className="flex flex-col gap-4">
              {colors.map((color, index) => (
            <div
              key={color.id}
              className="rounded border border-[#e5e5e5] p-6 bg-[#fafafa]"
            >
                <div className="mb-5 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#333]">
                  Color {index + 1}
                </span>
                {colors.length > 1 && (
                  <button
                    onClick={() => removeColor(color.id)}
                    className="text-[#999] text-[11px] hover:text-[#ff4444]"
                  >
                    ✕ Eliminar
                  </button>
                )}
              </div>

                  {/* Color Name */}
                  <div className="mb-5">
                    <label className="mb-2 block text-[#666] text-[10px] uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  value={color.colorName}
                  onChange={(e) =>
                    updateColor(color.id, { colorName: e.target.value })
                  }
                  className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                  placeholder="blue"
                />
              </div>

                  {/* Input Mode Toggle */}
                  <div className="mb-5">
                <label className="mb-2 block text-[#666] text-[10px] uppercase tracking-wide">
                  Modo
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateColor(color.id, { inputMode: "hex" })}
                    className={`flex-1 rounded px-2 py-1 text-[11px] transition-colors ${
                      color.inputMode === "hex"
                        ? "bg-[#18a0fb] text-white"
                        : "bg-[#f0f0f0] text-[#333] hover:bg-[#e5e5e5]"
                    }`}
                  >
                    HEX
                  </button>
                  <button
                    onClick={() =>
                      updateColor(color.id, { inputMode: "oklch" })
                    }
                    className={`flex-1 rounded px-2 py-1 text-[11px] transition-colors ${
                      color.inputMode === "oklch"
                        ? "bg-[#18a0fb] text-white"
                        : "bg-[#f0f0f0] text-[#333] hover:bg-[#e5e5e5]"
                    }`}
                  >
                    OKLCH
                  </button>
                </div>
              </div>

                  {/* Color Input */}
                  {color.inputMode === "hex" ? (
                    <div className="mb-5">
                      <label className="mb-2 block text-[#666] text-[10px] uppercase tracking-wide">
                    Color HEX
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={color.hexColor}
                      onChange={(e) =>
                        updateColor(color.id, { hexColor: e.target.value })
                      }
                      className="h-8 w-12 cursor-pointer rounded border border-[#ccc]"
                    />
                    <input
                      type="text"
                      value={color.hexColor}
                      onChange={(e) =>
                        updateColor(color.id, { hexColor: e.target.value })
                      }
                      className="flex-1 rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                      placeholder="#4169E1"
                    />
                  </div>
                </div>
                  ) : (
                    <div className="flex flex-col gap-4 mb-5">
                      <div>
                        <label className="mb-2 block text-[#666] text-[10px] uppercase tracking-wide">
                      Lightness
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={color.lightness}
                      onChange={(e) =>
                        updateColor(color.id, {
                          lightness: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[#666] text-[10px] uppercase tracking-wide">
                      Chroma
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="0.4"
                      step="0.001"
                      value={color.chroma}
                      onChange={(e) =>
                        updateColor(color.id, {
                          chroma: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[#666] text-[10px] uppercase tracking-wide">
                      Hue
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="0.1"
                      value={color.hue}
                      onChange={(e) =>
                        updateColor(color.id, {
                          hue: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Options - Only show if createVariables is enabled */}
              {createVariables && (
                <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => {
                      const newExpanded = new Set(expandedColors);
                      if (newExpanded.has(color.id)) {
                        newExpanded.delete(color.id);
                      } else {
                        newExpanded.add(color.id);
                      }
                      setExpandedColors(newExpanded);
                    }}
                    className="mb-5 flex w-full items-center justify-between text-left hover:opacity-80 transition-opacity py-2"
                  >
                    <label className="block text-[#333] text-[11px] font-semibold cursor-pointer">
                      Opciones Avanzadas de Variable
                    </label>
                    <span className="text-[#666] text-[10px]">
                      {expandedColors.has(color.id) ? "▼" : "▶"}
                    </span>
                  </button>
                  
                  {expandedColors.has(color.id) && (
                    <div className="space-y-7 pt-5">
                      {/* Collection Name */}
                      <div className="mb-5">
                        <label className="mb-1 block text-[#666] text-[10px] uppercase tracking-wide">
                          Colección
                        </label>
                        <input
                          type="text"
                          value={color.collectionName}
                          onChange={(e) =>
                            updateColor(color.id, { collectionName: e.target.value })
                          }
                          className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                          placeholder="primitives"
                        />
                        <p className="mt-1 text-[9px] text-[#999]">
                          Estructura: {color.collectionName}/color/{color.colorName || "nombre"}
                        </p>
                      </div>

                      {/* Number of Variants */}
                      <div className="mb-6">
                        <label className="mb-3 block text-[#666] text-[10px] uppercase tracking-wide">
                          Número de Variantes
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={color.numberOfVariants}
                          onChange={(e) =>
                            updateColor(color.id, {
                              numberOfVariants: parseInt(e.target.value) || 9,
                            })
                          }
                          className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                        />
                        <p className="mt-1 text-[9px] text-[#999]">
                          Número de tonos en la paleta (100, 200, 300...)
                        </p>
                      </div>

                      {/* Light/Dark Mode */}
                      <div className="mb-6">
                        <label className="mb-3 block text-[#666] text-[10px] uppercase tracking-wide">
                          Modos
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={color.useLightMode}
                              onChange={(e) =>
                                updateColor(color.id, { useLightMode: e.target.checked })
                              }
                              className="h-3 w-3"
                            />
                            <span className="text-[11px] text-[#333]">Light</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={color.useDarkMode}
                              onChange={(e) =>
                                updateColor(color.id, { useDarkMode: e.target.checked })
                              }
                              className="h-3 w-3"
                            />
                            <span className="text-[11px] text-[#333]">Dark</span>
                          </label>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            checked={color.useDescription}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              // Auto-generar descripción si se marca y no hay descripción
                              const autoDescription = isChecked && !color.description
                                ? `Tokens de color primitivos. Representan valores cromáticos sin contexto semántico.\nSirven como base para construir tokens semánticos (brand, text, surface, status).\nNo deben ser consumidos directamente por componentes o producto.`
                                : color.description;
                              updateColor(color.id, { 
                                useDescription: isChecked,
                                description: autoDescription
                              });
                            }}
                            className="h-3 w-3"
                          />
                          <span className="text-[10px] text-[#666] uppercase tracking-wide">
                            Agregar Descripción
                          </span>
                        </label>
                        {color.useDescription && (
                          <textarea
                            value={color.description}
                            onChange={(e) =>
                              updateColor(color.id, { description: e.target.value })
                            }
                            className="w-full rounded border border-[#ccc] px-3 py-2.5 text-[12px] text-black mt-4 min-h-[80px] resize-y"
                            placeholder="Descripción de la variable"
                            rows={4}
                          />
                        )}
                      </div>

                      {/* Code Syntax */}
                      <div className="mb-6">
                        <label className="mb-3 block text-[#666] text-[10px] uppercase tracking-wide">
                          Code syntax
                        </label>
                        <select
                          value={color.codeSyntaxPlatform}
                          onChange={(e) =>
                            updateColor(color.id, {
                              codeSyntaxPlatform: e.target.value as ColorEntry["codeSyntaxPlatform"],
                            })
                          }
                          className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black"
                        >
                          <option value="NONE">Ninguno</option>
                          <option value="WEB">Web</option>
                          <option value="iOS">iOS</option>
                          <option value="ANDROID">Android</option>
                        </select>
                        <p className="mt-2 text-[9px] text-[#999]">
                          Se guardará en el campo “Code syntax” de la variable
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Add Color Button at the bottom */}
        <button
          onClick={addColor}
          className="mt-8 w-full rounded bg-[#18a0fb] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#0d8ce8] shadow-sm whitespace-nowrap overflow-hidden text-ellipsis"
        >
          + Agregar Color
        </button>
      </div>

      {/* Naming Format */}
      <div>
        <label className="mb-2 block text-[#333] text-[11px] uppercase tracking-wide">
          Formato de Nombres
        </label>
        <select
          value={namingFormat}
          onChange={(e) => setNamingFormat(e.target.value as NamingFormat)}
          className="w-full rounded border border-[#ccc] px-3 py-2 text-[13px] text-black"
        >
          <option value="kebab-case">kebab-case (blue-500)</option>
          <option value="camelCase">camelCase (blue500)</option>
          <option value="PascalCase">PascalCase (Blue500)</option>
          <option value="snake_case">snake_case (blue_500)</option>
        </select>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createComponents}
            onChange={(e) => setCreateComponents(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-[13px] text-[#333]">Crear componentes en Figma</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createVariables}
            onChange={(e) => setCreateVariables(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-[13px] text-[#333]">Crear variables de color</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="mt-2 rounded bg-[#18a0fb] px-4 py-3 text-white text-[13px] transition-colors hover:bg-[#0d8ce8]"
        disabled={colors.length === 0}
      >
        ✨ Generar Paleta en Figma
      </button>
    </div>
  );
}