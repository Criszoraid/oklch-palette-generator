import { useMemo, useRef, useState } from "react";

export function JsonImport() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const jsonTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pasteHintVisible, setPasteHintVisible] = useState(false);

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

  const exampleJson = useMemo(
    () => ({
      meta: {
        schemaVersion: 1,
        generatedBy: "OKLCH Palette Generator",
        note: "El objeto 'meta' es opcional y se ignora al importar (solo sirve como referencia).",
      },
      colors: [
        {
          name: "danger",
          hex: "#FF0000",
          // Opcional: sobrescribe opciones globales por color
          collectionName: "primitives",
          numberOfVariants: 9,
          useLightMode: true,
          useDarkMode: true,
          // Variables (metadata)
          useDescription: true,
          description: "Color base para estados de error",
          // Code syntax (Figma Variables)
          codeSyntaxPlatform: "WEB",
        },
      ],
      options: {
        // Defaults globales (se usan si un color no los define)
        namingFormat: "kebab-case",
        createComponents: true,
        createVariables: true,
        collectionName: "primitives",
        numberOfVariants: 9,
        useLightMode: true,
        useDarkMode: true,
        useDescription: false,
        description: "",
        useCodeSyntax: false,
        codeSyntaxPlatform: "WEB",
      },
    }),
    []
  );

  const exampleText = useMemo(() => JSON.stringify(exampleJson, null, 2), [exampleJson]);

  const handleCopyExample = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exampleText);
      } else if (typeof document !== "undefined") {
        const ta = document.createElement("textarea");
        ta.value = exampleText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } else {
        throw new Error("Clipboard no disponible");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setError("No se pudo copiar el ejemplo: " + (e as Error).message);
    }
  };

  const showPasteHint = () => {
    setPasteHintVisible(true);
    window.setTimeout(() => setPasteHintVisible(false), 1400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Example */}
      <div className="rounded bg-code p-3 border border-app relative">
        <p className="mb-2 text-[11px] text-app uppercase tracking-wide">
          Ejemplo de JSON:
        </p>
        <button
          type="button"
          onClick={handleCopyExample}
          title={copied ? "Copiado" : "Copiar ejemplo"}
          aria-label={copied ? "Ejemplo copiado" : "Copiar ejemplo"}
          className="btn-secondary icon-btn icon-float"
        >
          <span className={`icon-tooltip ${copied ? "is-visible" : ""}`}>
            {copied ? "Copiado" : "Copiar"}
          </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8,7 L8,8 L6.5,8 C5.67157288,8 5,8.67157288 5,9.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 L15,17 L16,17 L16,18.5 C16,19.8807119 14.8807119,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,9.5 C4,8.11928813 5.11928813,7 6.5,7 L8,7 Z M16,4 L10.5,4 C9.67157288,4 9,4.67157288 9,5.5 L9,14.5 C9,15.3284271 9.67157288,16 10.5,16 L17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,7 L16.5,7 C16.2238576,7 16,6.77614237 16,6.5 L16,4 Z M20,6.52797748 L20,14.5 C20,15.8807119 18.8807119,17 17.5,17 L10.5,17 C9.11928813,17 8,15.8807119 8,14.5 L8,5.5 C8,4.11928813 9.11928813,3 10.5,3 L16.4720225,3 C16.6047688,2.99158053 16.7429463,3.03583949 16.8535534,3.14644661 L19.8535534,6.14644661 C19.9641605,6.25705373 20.0084195,6.39523125 20,6.52797748 Z M17,6 L18.2928932,6 L17,4.70710678 L17,6 Z M11.5,13 C11.2238576,13 11,12.7761424 11,12.5 C11,12.2238576 11.2238576,12 11.5,12 L13.5,12 C13.7761424,12 14,12.2238576 14,12.5 C14,12.7761424 13.7761424,13 13.5,13 L11.5,13 Z M11.5,11 C11.2238576,11 11,10.7761424 11,10.5 C11,10.2238576 11.2238576,10 11.5,10 L16.5,10 C16.7761424,10 17,10.2238576 17,10.5 C17,10.7761424 16.7761424,11 16.5,11 L11.5,11 Z M11.5,9 C11.2238576,9 11,8.77614237 11,8.5 C11,8.22385763 11.2238576,8 11.5,8 L16.5,8 C16.7761424,8 17,8.22385763 17,8.5 C17,8.77614237 16.7761424,9 16.5,9 L11.5,9 Z"
              />
            </svg>
        </button>
        <pre className="text-[10px] text-muted-2 overflow-auto max-h-44">
          {exampleText}
        </pre>
      </div>

      <div>
        <div className="mb-2 relative">
          <label className="block text-muted-2 text-[11px] uppercase tracking-wide">
            JSON de Rampas
          </label>
        </div>
        <div className="relative">
          <span className={`field-hint ${pasteHintVisible ? "is-visible" : ""}`}>
            Pega con Cmd/Ctrl+V
          </span>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full textarea font-mono h-56 resize-none"
            placeholder={exampleText}
            ref={jsonTextareaRef}
            onFocus={(e) => {
              // Help users replace the whole JSON quickly
              e.currentTarget.select();
              showPasteHint();
            }}
          />
        </div>
        {error && <p className="mt-2 text-[11px] text-danger">{error}</p>}
      </div>

      <div className="sticky-footer">
        <button
          onClick={handleImport}
          className="rounded px-4 py-3 text-white text-[13px] transition-colors btn-primary w-full"
        >
          ✨ Generar Rampas
        </button>
      </div>

    </div>
  );
}
