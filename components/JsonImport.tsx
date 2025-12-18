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
    ],
    options: {
      namingFormat: "kebab-case",
      createComponents: true,
      createVariables: true,
      collectionName: "primitives",
      numberOfVariants: 9,
      useLightMode: true,
      useDarkMode: true,
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-muted-2 text-[11px] uppercase tracking-wide">
          JSON de Rampas
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full textarea font-mono h-64 resize-none"
          placeholder={JSON.stringify(exampleJson, null, 2)}
        />
        {error && (
          <p className="mt-2 text-[11px] text-danger">{error}</p>
        )}
      </div>

      <button
        onClick={handleImport}
        className="rounded px-4 py-3 text-white text-[13px] transition-colors btn-primary"
      >
        📥 Importar desde JSON
      </button>

      {/* Example */}
      <div className="rounded bg-code p-3 border border-app">
        <p className="mb-2 text-[11px] text-app uppercase tracking-wide">
          Ejemplo de JSON:
        </p>
        <pre className="text-[10px] text-muted-2 overflow-x-auto">
          {JSON.stringify(exampleJson, null, 2)}
        </pre>
      </div>

      <div className="rounded border border-app p-3 text-[11px] text-muted-2 bg-surface">
        <p className="mb-2">
          <strong>Formato de entrada:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            Recomendado: <code className="bg-code px-1 rounded">hex</code>
            {" "}(<code className="bg-code px-1 rounded">oklch</code> también es válido si lo necesitas)
          </li>
          <li>El objeto <code className="bg-code px-1 rounded">options</code> es opcional</li>
          <li>Se generarán todas las rampas en una sola ejecución</li>
        </ul>
      </div>
    </div>
  );
}
