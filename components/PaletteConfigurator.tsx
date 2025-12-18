import { useState } from "react";

type NamingFormat = "kebab-case" | "camelCase" | "PascalCase" | "snake_case";

interface ColorEntry {
  id: string;
  colorName: string;
  hexColor: string;
  numberOfVariants: number;
}

export function PaletteConfigurator() {
  const [namingFormat, setNamingFormat] = useState<NamingFormat>("kebab-case");
  const [optionsOpen, setOptionsOpen] = useState(false);
  
  // Multiple colors state
  const [colors, setColors] = useState<ColorEntry[]>([
    {
      id: "1",
      colorName: "blue",
      hexColor: "#4169E1",
      numberOfVariants: 9,
    },
  ]);
  
  // Options
  const [createComponents, setCreateComponents] = useState(true);
  const [createVariables, setCreateVariables] = useState(true);

  // Global variable/options (apply to all colors)
  const [collectionName, setCollectionName] = useState("primitives");
  const [useLightMode, setUseLightMode] = useState(false);
  const [useDarkMode, setUseDarkMode] = useState(false);
  const [useDescription, setUseDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [codeSyntaxPlatform, setCodeSyntaxPlatform] = useState<
    "NONE" | "WEB" | "ANDROID" | "iOS"
  >("NONE");

  const addColor = () => {
    setColors([
      ...colors,
      {
        id: Date.now().toString(),
        colorName: `color-${colors.length + 1}`,
        hexColor: "#4169E1",
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
      inputMode: "hex" as const,
      hexColor: color.hexColor,
      // Global advanced options
      collectionName,
      useDescription,
      description,
      codeSyntaxPlatform:
        codeSyntaxPlatform === "NONE" ? undefined : codeSyntaxPlatform,
      useLightMode,
      useDarkMode,
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
        <div className="mb-3 flex items-center justify-between border-b border-app pb-2">
          <div className="flex items-center gap-2">
            <label className="block text-app text-[12px] font-semibold">
              Colores
          </label>
            <span className="text-[11px] text-muted">({colors.length})</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
              {colors.map((color) => (
            <div
              key={color.id}
              className="rounded border border-app p-4 bg-card"
            >
              {colors.length > 1 && (
                <div className="mb-2 flex items-center justify-end">
                  <button
                    onClick={() => removeColor(color.id)}
                    className="text-muted text-[11px] hover:text-danger"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              )}

                  {/* Color Name */}
                  <div className="mb-4">
                    <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  value={color.colorName}
                  onChange={(e) =>
                    updateColor(color.id, { colorName: e.target.value })
                  }
                  className="w-full input"
                  placeholder="blue"
                />
              </div>

                  {/* HEX */}
                  <div className="mb-1">
                    <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                      HEX
                  </label>
                    <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={color.hexColor}
                      onChange={(e) =>
                        updateColor(color.id, { hexColor: e.target.value })
                      }
                        className="h-10 w-12 cursor-pointer rounded border border-input bg-input"
                    />
                    <input
                      type="text"
                      value={color.hexColor}
                      onChange={(e) =>
                        updateColor(color.id, { hexColor: e.target.value })
                      }
                        className="flex-1 input"
                      placeholder="#4169E1"
                    />
                  </div>
                  </div>

                  {/* Variants per color */}
                  <div className="mt-4">
                    <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                      Variantes
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
                      className="w-full input"
                    />
                    <p className="mt-1 text-[10px] text-muted">
                      Número de tonos (ej. 5, 7, 9 → 100, 200, 300…).
                        </p>
                      </div>
            </div>
          ))}
        </div>
        
        {/* Add color button (below list) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={addColor}
            className="rounded px-3 py-2 text-[12px] font-semibold transition-colors btn-secondary"
          >
            + Añadir color
          </button>
        </div>
      </div>

      {/* Global options */}
      <div className="rounded border border-app bg-surface">
        <button
          type="button"
          onClick={() => setOptionsOpen((v) => !v)}
          className="options-header w-full p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <p className="text-app text-[12px] font-semibold">Opciones avanzadas</p>
          </div>
          <span className="text-[12px] text-muted-2 ml-2">{optionsOpen ? "▼" : "▶"}</span>
        </button>

        {optionsOpen && (
          <div className="px-4 pb-4">
            {/* 1) Formato nombres */}
            <div className="option-section">
              <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                Formato de nombres
              </label>
              <select
                value={namingFormat}
                onChange={(e) => setNamingFormat(e.target.value as NamingFormat)}
                className="w-full select"
              >
                <option value="kebab-case">kebab-case (blue-500)</option>
                <option value="camelCase">camelCase (blue500)</option>
                <option value="PascalCase">PascalCase (Blue500)</option>
                <option value="snake_case">snake_case (blue_500)</option>
              </select>
            </div>

            {/* 2) Colección */}
            <div className="option-section">
              <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                Colección
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full input"
                placeholder="primitives"
                disabled={!createVariables}
              />
              <p className="mt-1 text-[10px] text-muted">
                Estructura: {collectionName || "primitives"}/color/&lt;color&gt;/&lt;shade&gt;
              </p>
            </div>

            {/* 3) Modos */}
            <div className="option-section">
              <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                Modos a generar
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLightMode}
                    onChange={(e) => setUseLightMode(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-[13px] text-app">Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDarkMode}
                    onChange={(e) => setUseDarkMode(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-[13px] text-app">Dark</span>
                </label>
              </div>
            </div>

            {/* 4) Code syntax */}
            <div className="option-section">
              <label className="mb-2 block text-muted-2 text-[10px] uppercase tracking-wide">
                Code syntax
              </label>
              <select
                value={codeSyntaxPlatform}
                onChange={(e) =>
                  setCodeSyntaxPlatform(e.target.value as typeof codeSyntaxPlatform)
                }
                className="w-full select"
                disabled={!createVariables}
              >
                <option value="NONE">Ninguno</option>
                <option value="WEB">Web</option>
                <option value="iOS">iOS</option>
                <option value="ANDROID">Android</option>
              </select>
              <p className="mt-1 text-[10px] text-muted">
                Se guardará en el campo “Code syntax” de la variable.
              </p>
            </div>

            {/* 5) Agregar descripción automática */}
            <div className="option-section">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDescription}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setUseDescription(isChecked);
                    if (isChecked && !description) {
                      setDescription(
                        `Tokens de color primitivos. Representan valores cromáticos sin contexto semántico.\nSirven como base para construir tokens semánticos (brand, text, surface, status).\nNo deben ser consumidos directamente por componentes o producto.`
                      );
                    }
                  }}
                  className="h-4 w-4"
                  disabled={!createVariables}
                />
                <span className="text-[13px] text-app">Agregar descripción automática</span>
              </label>
              {useDescription && (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full textarea mt-3"
                  placeholder="Descripción de la variable"
                  rows={4}
                  disabled={!createVariables}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create options (outside of "Opciones", like before) */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createComponents}
            onChange={(e) => setCreateComponents(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-[13px] text-app">Crear componentes en Figma</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createVariables}
            onChange={(e) => setCreateVariables(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-[13px] text-app">Crear variables de color</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="mt-2 rounded px-4 py-3 text-white text-[13px] transition-colors btn-primary"
        disabled={colors.length === 0}
      >
        ✨ Generar Rampa en Figma
      </button>
    </div>
  );
}