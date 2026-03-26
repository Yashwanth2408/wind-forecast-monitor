"use client";

import { useState, useCallback, useMemo } from "react";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { Download, RefreshCw, Calendar, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatsPanel from "@/components/StatsPanel";
import HorizonSlider from "@/components/HorizonSlider";
import ForecastChart from "@/components/ForecastChart";
import ErrorHeatmap from "@/components/ErrorHeatmap";
import HorizonCompareChart from "@/components/HorizonCompareChart";
import { useHorizonCompare } from "@/hooks/useHorizonCompare";


import { useWindData } from "@/hooks/useWindData";
import { AlignedDataPoint } from "@/types";

const CARD = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
};

const TABS_META = [
  { id: "comparison", label: "Value Comparison" },
  { id: "heatmap", label: "Error Heatmap" },
  { id: "compare", label: "Horizon Compare" },
  { id: "configure", label: "Configure Analysis" },
  { id: "filter", label: "Filter Analysis" },
];



function ConfigurePanel({
  horizon,
  onHorizonChange,
}: {
  horizon: number;
  onHorizonChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <HorizonSlider value={horizon} onChange={onHorizonChange} />
      <div style={{ ...CARD, padding: "20px 22px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#E8E8E8", marginBottom: "6px" }}>
          About Forecast Horizon
        </div>
        <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.7 }}>
          The forecast horizon controls which forecast is displayed for each target time. A horizon
          of <span style={{ color: "#FF6533", fontWeight: 600 }}>{horizon}h</span> means: for each
          30-minute actual generation data point at time <em>T</em>, the dashboard selects the most
          recently published WINDFOR forecast whose{" "}
          <code style={{
            background: "rgba(255,255,255,0.07)", padding: "1px 5px",
            borderRadius: "4px", fontSize: "12px",
          }}>
            publishTime
          </code>{" "}
          is at most <em>T &minus; {horizon}h</em>. This simulates real-world operational
          forecasting — a grid operator with a {horizon}h lookahead.
        </p>
        <div style={{
          marginTop: "14px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
        }}>
          {[
            { h: 1, desc: "Near real-time — most accurate" },
            { h: 4, desc: "Operational standard (default)" },
            { h: 12, desc: "Day-ahead planning" },
            { h: 24, desc: "Next-day scheduling" },
            { h: 48, desc: "Two-day ahead — least accurate" },
          ].map(({ h, desc }) => (
            <button
              key={h}
              onClick={() => onHorizonChange(h)}
              style={{
                background: horizon === h ? "rgba(255,101,51,0.09)" : "rgba(255,255,255,0.02)",
                border: horizon === h
                  ? "1px solid rgba(255,101,51,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px", padding: "10px 13px",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
            >
              <div style={{
                fontSize: "13px", fontWeight: 600,
                color: horizon === h ? "#FF6533" : "#E8E8E8",
                marginBottom: "3px",
              }}>
                {h}h horizon
              </div>
              <div style={{ fontSize: "11px", color: "#555555" }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  data, fromDate, toDate, onFromChange, onToChange,
}: {
  data: AlignedDataPoint[];
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  const today = new Date();

  const errorDist = useMemo(() => {
    const errors = data
      .filter(d => d.actual != null && d.forecast != null)
      .map(d => d.forecast! - d.actual!);
    if (!errors.length) return null;
    const sorted = [...errors].sort((a, b) => a - b);
    const p = (pct: number) => sorted[Math.floor(sorted.length * pct / 100)];
    const mean = errors.reduce((s, v) => s + v, 0) / errors.length;
    return {
      count: errors.length,
      mean: Math.round(mean),
      median: Math.round(p(50)),
      p5: Math.round(p(5)),
      p95: Math.round(p(95)),
      p99: Math.round(p(99)),
      minE: Math.round(sorted[0]),
      maxE: Math.round(sorted[sorted.length - 1]),
    };
  }, [data]);

  const quickRanges = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 14 days", days: 14 },
    { label: "Last 30 days", days: 30 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ ...CARD, padding: "20px 22px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8E8E8", marginBottom: "14px" }}>
          Quick Date Ranges
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickRanges.map(({ label, days }) => {
            const from = format(subDays(today, days), "yyyy-MM-dd");
            const to = format(subDays(today, 1), "yyyy-MM-dd");
            const active = fromDate === from && toDate === to;
            return (
              <button
                key={label}
                onClick={() => { onFromChange(from); onToChange(to); }}
                style={{
                  padding: "6px 14px", borderRadius: "7px",
                  fontSize: "12px", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.13s",
                  border: active
                    ? "1px solid rgba(255,101,51,0.3)"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: active ? "rgba(255,101,51,0.1)" : "rgba(255,255,255,0.03)",
                  color: active ? "#FF6533" : "#888888",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {errorDist ? (
        <div style={{ ...CARD, padding: "20px 22px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8E8E8", marginBottom: "14px" }}>
            Error Distribution Summary
            <span style={{ fontSize: "11px", color: "#555555", fontWeight: 400, marginLeft: "8px" }}>
              forecast &minus; actual
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
            className="stats-grid"
          >
            {[
              { label: "Mean", value: errorDist.mean, color: "#FF6533" },
              { label: "Median", value: errorDist.median, color: "#9CA3AF" },
              { label: "P95", value: errorDist.p95, color: "#f87171" },
              { label: "P99", value: errorDist.p99, color: "#f87171" },
              { label: "Min", value: errorDist.minE, color: "#4ade80" },
              { label: "Max", value: errorDist.maxE, color: "#f87171" },
              { label: "P5", value: errorDist.p5, color: "#4ade80" },
              { label: "Count", value: errorDist.count, color: "#60a5fa" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px", padding: "12px",
              }}>
                <div style={{
                  fontSize: "10px", color: "#555555", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px",
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: "16px", fontWeight: 600,
                  fontFamily: "monospace", color, letterSpacing: "-0.02em",
                }}>
                  {typeof value === "number" && label !== "Count"
                    ? (value > 0 ? "+" : "") + value.toLocaleString("en-GB")
                    : value.toLocaleString("en-GB")}
                  {label !== "Count" && (
                    <span style={{ fontSize: "11px", color: "#555555", fontWeight: 400, marginLeft: "3px" }}>
                      MW
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...CARD, padding: "20px 22px" }}>
          <p style={{ fontSize: "13px", color: "#555555" }}>
            Load data to see error distribution analysis.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const today = new Date();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("analysis");
  const [activeTab, setActiveTab] = useState("comparison");
  const [fromDate, setFromDate] = useState(format(subDays(today, 7), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(subDays(today, 1), "yyyy-MM-dd"));
  const [horizon, setHorizon] = useState(4);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { data, metrics, loading, error, fetch } = useWindData();

  const {
    dataA, dataB, metricsA, metricsB,
    loading: cmpLoading, error: cmpError,
    fetch: cmpFetch, clear: cmpClear,
  } = useHorizonCompare();
  const [cmpHorizonA, setCmpHorizonA] = useState(4);
  const [cmpHorizonB, setCmpHorizonB] = useState(24);


  const handleLoad = useCallback(async () => {
    const from = new Date(fromDate + "T00:00:00Z").toISOString();
    const to = new Date(toDate + "T23:59:59Z").toISOString();
    await fetch(from, to, horizon);
    setLastUpdated(formatDistanceToNow(new Date(), { addSuffix: true }));
  }, [fromDate, toDate, horizon, fetch]);

  const handleExport = useCallback(() => {
    if (!data.length) return;
    const rows = data.map(d =>
      `${d.startTime},${d.actual ?? ""},${d.forecast ?? ""},${d.forecastPublishTime ?? ""},${d.horizonHours ?? ""}`
    );
    const blob = new Blob(
      ["startTime,actual_MW,forecast_MW,forecastPublishTime,horizonHours\n" + rows.join("\n")],
      { type: "text/csv" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wind-forecast-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const pageTitle = activeNav === "overview" ? "Overview" : "Analysis";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0C0C0C" }}>
      <Sidebar
        activeTab={activeNav}
        onTabChange={setActiveNav}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        className="main-content"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}
      >
        {/* Top Bar */}
        <div
          className="topbar-inner"
          style={{
            padding: "0 28px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            minHeight: "64px",
          }}
        >
          {/* Left — hamburger + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                display: "none",
                width: "36px", height: "36px",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#888888",
                cursor: "pointer",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Menu size={16} />
            </button>
            <div>
              <h1 style={{
                fontSize: "20px", fontWeight: 700, color: "#E8E8E8",
                letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                {pageTitle}
              </h1>
              <p style={{ fontSize: "11px", color: "#555555", marginTop: "2px" }}>
                UK National Grid &middot; Wind Power Generation Forecast Accuracy
              </p>
            </div>
          </div>

          {/* Right — controls */}
          <div
            className="topbar-controls"
            style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
          >
            {[
              { label: "Start Date", value: fromDate, onChange: setFromDate, max: toDate },
              { label: "End Date", value: toDate, onChange: setToDate, min: fromDate, max: format(today, "yyyy-MM-dd") },
            ].map(({ label, value, onChange, min, max }) => (
              <div
                key={label}
                className="date-card"
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", padding: "7px 12px",
                }}
              >
                <Calendar size={13} color="#555555" />
                <div>
                  <div style={{
                    fontSize: "9px", color: "#555555", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px",
                  }}>
                    {label}
                  </div>
                  <input
                    type="date"
                    value={value}
                    min={min ?? "2025-01-01"}
                    max={max}
                    onChange={e => onChange(e.target.value)}
                    style={{
                      fontSize: "12px", fontWeight: 500, color: "#E8E8E8",
                      background: "transparent", border: "none", outline: "none",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleLoad}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "9px 18px", borderRadius: "8px", border: "none",
                background: loading
                  ? "rgba(255,101,51,0.1)"
                  : "linear-gradient(135deg, #FF6533, #FF8C5A)",
                color: loading ? "#FF6533" : "white",
                fontSize: "13px", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 3px 14px rgba(255,101,51,0.28)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              {loading ? "Loading..." : "Load Data"}
            </button>

            <button
              onClick={handleExport}
              disabled={!data.length || loading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: !data.length ? "#444444" : "#888888",
                fontSize: "12px", fontWeight: 500,
                cursor: !data.length ? "not-allowed" : "pointer",
                opacity: !data.length ? 0.4 : 1,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Download size={13} />
              Export CSV
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 11px", borderRadius: "7px",
              background: "rgba(74,222,128,0.07)",
              border: "1px solid rgba(74,222,128,0.13)",
              fontSize: "11px", fontWeight: 600, color: "#4ade80",
              whiteSpace: "nowrap",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#4ade80", display: "inline-block",
              }} />
              Live
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="page-body"
          style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {/* Tabs */}
          <div
            className="tabs-row"
            style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            {TABS_META.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: "10px 16px", fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    color: active ? "#E8E8E8" : "#555555",
                    background: "transparent", border: "none",
                    borderBottom: active ? "2px solid #FF6533" : "2px solid transparent",
                    cursor: "pointer", marginBottom: "-1px", transition: "color 0.14s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.18)",
              borderRadius: "8px", padding: "11px 15px",
              fontSize: "13px", color: "#f87171",
            }}>
              {error}
            </div>
          )}

          {/* Value Comparison */}
          {activeTab === "comparison" && (
            <>
              <StatsPanel metrics={metrics} loading={loading} />
              <div style={{ ...CARD, padding: "22px 24px" }}>
                <div
                  className="chart-title-row"
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: "18px",
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#E8E8E8", marginBottom: "3px" }}>
                      Generation vs Forecast
                    </h2>
                    <p style={{ fontSize: "12px", color: "#555555" }}>
                      {data.length > 0
                        ? `${data.length.toLocaleString()} half-hourly data points · Horizon: ${horizon}h`
                        : "Select a date range and load data to begin"}
                    </p>
                  </div>
                  {data.length > 0 && (
                    <div style={{
                      background: "rgba(255,101,51,0.1)",
                      border: "1px solid rgba(255,101,51,0.2)",
                      borderRadius: "7px", padding: "4px 11px",
                      fontSize: "12px", fontWeight: 600, color: "#FF6533",
                      flexShrink: 0,
                    }}>
                      {data.length.toLocaleString()} points
                    </div>
                  )}
                </div>
                <ForecastChart data={data} loading={loading} />
              </div>
            </>
          )}

          {/* Error Heatmap Tab */}
          {activeTab === "heatmap" && (
            <div style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "22px 24px",
            }}>
              <ErrorHeatmap data={data} loading={loading} />
            </div>
          )}

          {/* Horizon Compare Tab */}
          {activeTab === "compare" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Controls card */}
              <div style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px", padding: "20px 22px",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#E8E8E8", marginBottom: "4px" }}>
                  Horizon Comparison
                </div>
                <p style={{ fontSize: "12px", color: "#555555", marginBottom: "18px" }}>
                  Fetch the same date range under two different forecast horizons and compare accuracy side by side.
                </p>

                <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap" }}>
                  {/* Horizon A */}
                  <div>
                    <div style={{ fontSize: "10px", color: "#555555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
                      Horizon A
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {[1, 4, 12, 24, 48].map(h => (
                        <button
                          key={h}
                          onClick={() => setCmpHorizonA(h)}
                          style={{
                            padding: "5px 11px", borderRadius: "6px",
                            fontSize: "12px", fontWeight: 500, cursor: "pointer",
                            transition: "all 0.12s",
                            border: cmpHorizonA === h
                              ? "1px solid rgba(96,165,250,0.4)"
                              : "1px solid rgba(255,255,255,0.07)",
                            background: cmpHorizonA === h ? "rgba(96,165,250,0.1)" : "transparent",
                            color: cmpHorizonA === h ? "#60a5fa" : "#888888",
                          }}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* VS divider */}
                  <div style={{
                    fontSize: "11px", fontWeight: 700, color: "#333333",
                    paddingBottom: "6px", letterSpacing: "0.08em",
                  }}>
                    VS
                  </div>

                  {/* Horizon B */}
                  <div>
                    <div style={{ fontSize: "10px", color: "#555555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
                      Horizon B
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {[1, 4, 12, 24, 48].map(h => (
                        <button
                          key={h}
                          onClick={() => setCmpHorizonB(h)}
                          style={{
                            padding: "5px 11px", borderRadius: "6px",
                            fontSize: "12px", fontWeight: 500, cursor: "pointer",
                            transition: "all 0.12s",
                            border: cmpHorizonB === h
                              ? "1px solid rgba(255,101,51,0.4)"
                              : "1px solid rgba(255,255,255,0.07)",
                            background: cmpHorizonB === h ? "rgba(255,101,51,0.1)" : "transparent",
                            color: cmpHorizonB === h ? "#FF6533" : "#888888",
                          }}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compare button */}
                  <button
                    onClick={() => {
                      const from = new Date(fromDate + "T00:00:00Z").toISOString();
                      const to = new Date(toDate + "T23:59:59Z").toISOString();
                      cmpFetch(from, to, cmpHorizonA, cmpHorizonB);
                    }}
                    disabled={cmpLoading || cmpHorizonA === cmpHorizonB}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      padding: "8px 18px", borderRadius: "8px", border: "none",
                      background: cmpLoading || cmpHorizonA === cmpHorizonB
                        ? "rgba(255,255,255,0.04)"
                        : "linear-gradient(135deg, #FF6533, #FF8C5A)",
                      color: cmpLoading || cmpHorizonA === cmpHorizonB ? "#444444" : "white",
                      fontSize: "13px", fontWeight: 600,
                      cursor: cmpLoading || cmpHorizonA === cmpHorizonB ? "not-allowed" : "pointer",
                      boxShadow: cmpLoading || cmpHorizonA === cmpHorizonB
                        ? "none"
                        : "0 3px 14px rgba(255,101,51,0.28)",
                      transition: "all 0.2s",
                    }}
                  >
                    {cmpLoading ? "Comparing..." : "Compare Horizons"}
                  </button>

                  {(dataA.length > 0 || dataB.length > 0) && !cmpLoading && (
                    <button
                      onClick={cmpClear}
                      style={{
                        padding: "8px 14px", borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "transparent", color: "#888888",
                        fontSize: "12px", cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {cmpHorizonA === cmpHorizonB && (
                  <p style={{ fontSize: "11px", color: "#f87171", marginTop: "10px" }}>
                    Select two different horizons to compare.
                  </p>
                )}
                {cmpError && (
                  <p style={{ fontSize: "11px", color: "#f87171", marginTop: "10px" }}>{cmpError}</p>
                )}
              </div>

              {/* Chart card */}
              <div style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px", padding: "22px 24px",
              }}>
                <HorizonCompareChart
                  dataA={dataA}
                  dataB={dataB}
                  metricsA={metricsA}
                  metricsB={metricsB}
                  horizonA={cmpHorizonA}
                  horizonB={cmpHorizonB}
                  loading={cmpLoading}
                />
              </div>
            </div>
          )}


          {/* Configure Analysis */}
          {activeTab === "configure" && (
            <ConfigurePanel horizon={horizon} onHorizonChange={setHorizon} />
          )}

          {/* Filter Analysis */}
          {activeTab === "filter" && (
            <FilterPanel
              data={data}
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
          )}

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "14px", textAlign: "center",
            fontSize: "11px", color: "#333333",
          }}>
            Data: Elexon BMRS API &mdash; FUELHH (actuals) + WINDFOR (forecasts) &mdash; January 2025 onwards &mdash; UTC
            {lastUpdated && (
              <span style={{ marginLeft: "12px" }}>&middot; Last updated {lastUpdated}</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
