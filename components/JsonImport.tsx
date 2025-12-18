import { useState } from "react";

export function JsonImport() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      // Validar estructura básica
      if (!data.colors || !Array.isArray(data.colors)) {
        setError("El JSON debe contener un array 'colors'");
        return;
      }

      setError("");
      // Enviar mensaje al código del plugin de Figma
      if (typeof parent !== 'undefined') {
        parent.postMessage(
          {
            pluginMessage: {
              type: "import-json",
              data,
            },
          },
          "*"
        );
      } else {
        setError("parent no está disponible. Esto debe ejecutarse en el contexto de un plugin de Figma.");
      }
    } catch (e) {
      setError("JSON inválido: " + (e as Error).message);
    }
  };

  const exampleJson = {
    colors: [
      {
        name: "blue",
        hex: "#4169E1",
      },
      {
        name: "red",
        oklch: { lightness: 60, chroma: 0.25, hue: 25 },
      },
    ],
    options: {
      namingFormat: "kebab-case",
      createComponents: true,
      createVariables: true,
      generateDarkMode: true,
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-[#333] text-[11px] uppercase tracking-wide">
          JSON de Paletas
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full rounded border border-[#ccc] px-3 py-2 text-[12px] text-black font-mono h-64 resize-none"
          placeholder={JSON.stringify(exampleJson, null, 2)}
        />
        {error && (
          <p className="mt-2 text-[11px] text-[#f24822]">{error}</p>
        )}
      </div>

      <button
        onClick={handleImport}
        className="rounded bg-[#18a0fb] px-4 py-3 text-white text-[13px] transition-colors hover:bg-[#0d8ce8]"
      >
        📥 Importar desde JSON
      </button>

      {/* Example */}
      <div className="rounded bg-[#f0f0f0] p-3">
        <p className="mb-2 text-[11px] text-[#333] uppercase tracking-wide">
          Ejemplo de JSON:
        </p>
        <pre className="text-[10px] text-[#666] overflow-x-auto">
          {JSON.stringify(exampleJson, null, 2)}
        </pre>
      </div>

      <div className="rounded border border-[#e5e5e5] p-3 text-[11px] text-[#666]">
        <p className="mb-2">
          <strong>Formato de entrada:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Puedes usar <code className="bg-[#f0f0f0] px-1 rounded">hex</code> o <code className="bg-[#f0f0f0] px-1 rounded">oklch</code></li>
          <li>El objeto <code className="bg-[#f0f0f0] px-1 rounded">options</code> es opcional</li>
          <li>Se generarán todas las paletas en una sola ejecución</li>
        </ul>
      </div>
    </div>
  );
}
