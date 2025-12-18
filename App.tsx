import { useEffect, useRef, useState } from "react";
import { PaletteConfigurator } from "./components/PaletteConfigurator";
import { JsonImport } from "./components/JsonImport";

export default function App() {
  const [activeTab, setActiveTab] = useState<"manual" | "json">("manual");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const appRef = useRef<HTMLDivElement | null>(null);

  // Sync UI theme with host (Figma) theme automatically.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    // Set initial in case it changed between render and effect
    setIsDark(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Auto-resize Figma UI to content height to avoid empty space below content.
  useEffect(() => {
    if (!appRef.current) return;
    if (typeof parent === "undefined") return;
    if (typeof ResizeObserver === "undefined") return;

    let raf = 0;
    const postResize = () => {
      if (!appRef.current) return;
      // Measure the full UI (header + tabs + content)
      const height = Math.ceil(appRef.current.scrollHeight);
      const padded = height + 12; // small breathing room
      const clamped = Math.max(360, Math.min(900, padded));
      parent.postMessage(
        { pluginMessage: { type: "ui-resize", height: clamped } },
        "*"
      );
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      // Double RAF to ensure layout is settled before measuring
      raf = requestAnimationFrame(() => requestAnimationFrame(postResize));
    };

    // Initial + on tab/theme changes
    schedule();

    const ro = new ResizeObserver(schedule);
    ro.observe(appRef.current);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [activeTab, isDark]);

  return (
    <div
      ref={appRef}
      className={`bg-app text-app ${isDark ? "theme-dark" : "theme-light"}`}
    >
      {/* Header */}
      <div className="border-b border-app bg-app px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-title">Generador de Rampas OKLCH</h1>
          <p className="text-muted text-[11px] mt-1">
            Plugin para crear rampas de colores con contraste WCAG y APCA
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-app">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-[13px] transition-colors ${
            activeTab === "manual"
              ? "border-b-2 border-primary text-app"
              : "text-muted hover:text-app"
          }`}
        >
          Configuración Manual
        </button>
        <button
          onClick={() => setActiveTab("json")}
          className={`px-4 py-2 text-[13px] transition-colors ${
            activeTab === "json"
              ? "border-b-2 border-primary text-app"
              : "text-muted hover:text-app"
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
