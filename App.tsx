import { useState } from "react";
import { PaletteConfigurator } from "./components/PaletteConfigurator";
import { JsonImport } from "./components/JsonImport";

export default function App() {
  const [activeTab, setActiveTab] = useState<"manual" | "json">("manual");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] bg-white px-4 py-3">
        <h1 className="text-black">Generador de Paletas OKLCH</h1>
        <p className="text-[#999] text-[11px] mt-1">
          Plugin para crear paletas de colores con contraste WCAG y APCA
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5e5]">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-[13px] transition-colors ${
            activeTab === "manual"
              ? "border-b-2 border-[#18a0fb] text-black"
              : "text-[#999] hover:text-black"
          }`}
        >
          Configuración Manual
        </button>
        <button
          onClick={() => setActiveTab("json")}
          className={`px-4 py-2 text-[13px] transition-colors ${
            activeTab === "json"
              ? "border-b-2 border-[#18a0fb] text-black"
              : "text-[#999] hover:text-black"
          }`}
        >
          Importar JSON
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "manual" ? <PaletteConfigurator /> : <JsonImport />}
      </div>
    </div>
  );
}
