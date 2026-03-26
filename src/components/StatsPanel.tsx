"use client";

import { ChartMetrics } from "@/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsPanelProps {
    metrics: ChartMetrics | null;
    loading: boolean;
}

function StatCard({ label, value, unit, sub, highlight, trend }: {
    label: string; value: string; unit: string; sub: string;
    highlight?: boolean; trend?: "up" | "down" | "neutral";
}) {
    const trendColor = trend === "up" ? "#FF6533" : trend === "down" ? "#4ade80" : "#888888";
    const TI = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

    return (
        <div style={{
            background: highlight ? "linear-gradient(145deg, #2D1005, #1E0D03)" : "#1A1A1A",
            border: highlight ? "1px solid rgba(255,101,51,0.22)" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px",
            position: "relative", overflow: "hidden",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <span style={{
                    fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "#555555",
                }}>
                    {label}
                </span>
                <TI size={13} color={trendColor} />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "10px" }}>
                <span style={{
                    fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1,
                    color: "#E8E8E8", fontFamily: "'Roboto Mono', monospace",
                }}>
                    {value}
                </span>
                <span style={{ fontSize: "12px", color: "#555555", fontWeight: 500 }}>{unit}</span>
            </div>

            <div style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{
                    width: "18px", height: "18px", borderRadius: "5px",
                    background: highlight ? "rgba(255,101,51,0.15)" : "rgba(255,255,255,0.05)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke={highlight ? "#FF6533" : "#555555"} strokeWidth="1.5" />
                    </svg>
                </span>
                {sub}
            </div>

            <div style={{
                position: "absolute", bottom: "-18px", right: "-18px",
                width: "70px", height: "70px", borderRadius: "50%",
                background: highlight ? "rgba(255,101,51,0.06)" : "rgba(255,255,255,0.015)",
                pointerEvents: "none",
            }} />
        </div>
    );
}

function Skel() {
    return (
        <div style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px",
        }}>
            <div className="sk" style={{ height: "10px", width: "55px", marginBottom: "16px" }} />
            <div className="sk" style={{ height: "32px", width: "85px", marginBottom: "12px" }} />
            <div className="sk" style={{ height: "10px", width: "105px" }} />
        </div>
    );
}

export default function StatsPanel({ metrics, loading }: StatsPanelProps) {
    if (loading) return (
        <div
            className="stats-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}
        >
            {[...Array(4)].map((_, i) => <Skel key={i} />)}
        </div>
    );

    if (!metrics) return null;

    return (
        <div
            className="stats-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}
        >
            <StatCard
                label="RMSE"
                value={metrics.rmse.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                sub="Root mean squared error"
                trend="up"
            />
            <StatCard
                label="MAE"
                value={metrics.mae.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                sub="Mean absolute error"
                highlight
                trend="up"
            />
            <StatCard
                label="Bias"
                value={(metrics.bias > 0 ? "+" : "") + metrics.bias.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                sub={metrics.bias > 100 ? "Over-forecasting" : metrics.bias < -100 ? "Under-forecasting" : "Well calibrated"}
                trend={metrics.bias > 200 ? "up" : metrics.bias < -200 ? "down" : "neutral"}
            />
            <StatCard
                label="Coverage"
                value={metrics.coverage.toFixed(1)}
                unit="%"
                sub={`${metrics.count.toLocaleString()} matched points`}
                trend="neutral"
            />
        </div>
    );
}
