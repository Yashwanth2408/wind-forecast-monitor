"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import ForecastChart from "@/components/ForecastChart";
import StatsPanel from "@/components/StatsPanel";
import HorizonSlider from "@/components/HorizonSlider";
import ExportButton from "@/components/ExportButton";
import { useWindData } from "@/hooks/useWindData";

export default function Home() {
  const today = new Date();
  const [fromDate, setFromDate] = useState(
    format(subDays(today, 7), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(format(today, "yyyy-MM-dd"));
  const [horizon, setHorizon] = useState(4);
  const { data, metrics, loading, error, fetch } = useWindData();

  const handleLoad = () => {
    const from = new Date(fromDate + "T00:00:00Z").toISOString();
    const to = new Date(toDate + "T23:59:59Z").toISOString();
    fetch(from, to, horizon);
  };

  return (
    <main className="min-h-screen p-4 md:p-8"
      style={{ background: "var(--background)" }}>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🌬️</span>
          <h1 className="text-2xl md:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}>
            Wind Forecast Monitor
          </h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "var(--text-secondary)" }}>
          UK National Grid · Elexon BMRS · Real-time forecast accuracy
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Date From */}
        <div className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}>
            Start Date
          </label>
          <input
            type="date"
            value={fromDate}
            min="2025-01-01"
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Date To */}
        <div className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-secondary)" }}>
            End Date
          </label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={format(today, "yyyy-MM-dd")}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Load Button */}
        <button
          onClick={handleLoad}
          disabled={loading}
          className="rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: loading ? "var(--surface-2)" : "var(--accent-blue)",
            color: loading ? "var(--text-secondary)" : "#fff",
            border: "1px solid var(--border)",
            cursor: loading ? "not-allowed" : "pointer",
            padding: "1rem",
          }}>
          {loading ? (
            <><span className="animate-spin">⚙️</span> Loading...</>
          ) : (
            <><span>⚡</span> Load Data</>
          )}
        </button>
      </div>

      {/* Horizon Slider */}
      <div className="mb-6">
        <HorizonSlider value={horizon} onChange={setHorizon} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl p-4 text-sm"
          style={{ background: "#2d1515", border: "1px solid var(--accent-red)", color: "var(--accent-red)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Panel */}
      <div className="mb-6">
        <StatsPanel metrics={metrics} loading={loading} />
      </div>

      {/* Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}>
            Generation vs Forecast (MW)
          </h2>
          <div className="flex items-center gap-2">
            {data.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-md"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {data.length} data points
              </span>
            )}
            <ExportButton data={data} disabled={data.length === 0 || loading} />
          </div>

        </div>
        <ForecastChart data={data} loading={loading} />
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-8" style={{ color: "var(--text-secondary)" }}>
        Data source: Elexon BMRS API · FUELHH (actuals) + WINDFOR (forecasts) · Jan 2025 onwards
      </p>
    </main>
  );
}
