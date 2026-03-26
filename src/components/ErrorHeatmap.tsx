"use client";

import { useMemo, useState } from "react";
import { AlignedDataPoint } from "@/types";

interface Props {
    data: AlignedDataPoint[];
    loading: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"];

type MetricKey = "mae" | "bias" | "rmse";

function interpolateColor(value: number, min: number, max: number): string {
    if (max === min) return "rgba(255,101,51,0.15)";
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const r = Math.round(26 + t * (255 - 26));
    const g = Math.round(26 + t * (60 - 26));
    const b = Math.round(26 + t * (30 - 26));
    return `rgb(${r},${g},${b})`;
}

function Empty() {
    return (
        <div style={{
            height: "360px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "12px",
        }}>
            <div style={{
                width: "46px", height: "46px", borderRadius: "12px",
                background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#888888" }}>
                Load data to view the error heatmap
            </p>
            <p style={{ fontSize: "12px", color: "#555555" }}>
                Requires at least 7 days of data for meaningful patterns
            </p>
        </div>
    );
}

function Skel() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "8px 0" }}>
            {DAYS.map(d => (
                <div key={d} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <div style={{ width: "28px", fontSize: "10px", color: "#555555", flexShrink: 0 }}>{d}</div>
                    <div className="sk" style={{ flex: 1, height: "28px", borderRadius: "4px" }} />
                </div>
            ))}
        </div>
    );
}

interface TooltipState {
    x: number;
    y: number;
    day: string;
    slot: number;
    value: number;
    count: number;
}

export default function ErrorHeatmap({ data, loading }: Props) {
    const [metric, setMetric] = useState<MetricKey>("mae");
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const grid = useMemo(() => {
        if (!data.length) return null;

        const cells: Record<string, { sum: number; sumSq: number; biasSum: number; count: number }> = {};

        for (const d of data) {
            if (d.actual == null || d.forecast == null) continue;
            const dt = new Date(d.startTime);
            const dow = (dt.getUTCDay() + 6) % 7;
            const slot = dt.getUTCHours() * 2 + Math.floor(dt.getUTCMinutes() / 30);
            const key = `${dow}-${slot}`;
            const error = d.forecast - d.actual;

            if (!cells[key]) cells[key] = { sum: 0, sumSq: 0, biasSum: 0, count: 0 };
            cells[key].sum += Math.abs(error);
            cells[key].sumSq += error * error;
            cells[key].biasSum += error;
            cells[key].count += 1;
        }

        const result: {
            dow: number;
            slot: number;
            mae: number;
            rmse: number;
            bias: number;
            count: number;
        }[] = [];

        for (const [key, v] of Object.entries(cells)) {
            const [dow, slot] = key.split("-").map(Number);
            result.push({
                dow,
                slot,
                mae: v.sum / v.count,
                rmse: Math.sqrt(v.sumSq / v.count),
                bias: v.biasSum / v.count,
                count: v.count,
            });
        }

        return result;
    }, [data]);

    if (loading) return <Skel />;
    if (!data.length || !grid) return <Empty />;

    const values = grid.map(c => Math.abs(c[metric]));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const cellMap: Record<string, typeof grid[0]> = {};
    for (const c of grid) cellMap[`${c.dow}-${c.slot}`] = c;

    const CELL_W = "calc((100% - 32px) / 48)";

    return (
        <div style={{ userSelect: "none" }}>
            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#E8E8E8", marginBottom: "2px" }}>
                        Forecast Error by Day and Time
                    </p>
                    <p style={{ fontSize: "11px", color: "#555555" }}>
                        Each cell represents one 30-minute slot — darker means lower error
                    </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                    {(["mae", "rmse", "bias"] as MetricKey[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMetric(m)}
                            style={{
                                padding: "5px 12px", borderRadius: "6px",
                                fontSize: "11px", fontWeight: 600,
                                cursor: "pointer", transition: "all 0.13s",
                                textTransform: "uppercase", letterSpacing: "0.06em",
                                border: metric === m
                                    ? "1px solid rgba(255,101,51,0.35)"
                                    : "1px solid rgba(255,255,255,0.07)",
                                background: metric === m ? "rgba(255,101,51,0.1)" : "transparent",
                                color: metric === m ? "#FF6533" : "#888888",
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hour labels */}
            <div style={{ display: "flex", marginLeft: "32px", marginBottom: "4px" }}>
                {HOUR_LABELS.map((h, i) => (
                    <div
                        key={h}
                        style={{
                            position: "relative",
                            width: i < HOUR_LABELS.length - 1 ? "calc(100% / 8)" : "0px",
                            fontSize: "10px", color: "#444444",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {h}
                    </div>
                ))}
            </div>

            {/* Grid rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {DAYS.map((day, dow) => (
                    <div key={day} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div style={{
                            width: "28px", fontSize: "10px", fontWeight: 600,
                            color: "#555555", textAlign: "right", flexShrink: 0,
                        }}>
                            {day}
                        </div>
                        <div style={{ display: "flex", flex: 1, gap: "2px" }}>
                            {Array.from({ length: 48 }, (_, slot) => {
                                const cell = cellMap[`${dow}-${slot}`];
                                const val = cell ? Math.abs(cell[metric]) : null;
                                const color = val != null
                                    ? interpolateColor(val, minVal, maxVal)
                                    : "#141414";

                                return (
                                    <div
                                        key={slot}
                                        style={{
                                            flex: 1,
                                            height: "26px",
                                            borderRadius: "2px",
                                            background: color,
                                            cursor: cell ? "pointer" : "default",
                                            transition: "opacity 0.1s",
                                            border: "1px solid rgba(0,0,0,0.3)",
                                        }}
                                        onMouseEnter={e => {
                                            if (!cell) return;
                                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top,
                                                day,
                                                slot,
                                                value: cell[metric],
                                                count: cell.count,
                                            });
                                            (e.currentTarget as HTMLDivElement).style.opacity = "0.75";
                                        }}
                                        onMouseLeave={e => {
                                            setTooltip(null);
                                            (e.currentTarget as HTMLDivElement).style.opacity = "1";
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Colour scale legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", marginLeft: "32px" }}>
                <span style={{ fontSize: "10px", color: "#444444" }}>
                    Low error
                </span>
                <div style={{
                    flex: 1, maxWidth: "160px", height: "8px", borderRadius: "4px",
                    background: "linear-gradient(to right, #1A1A1A, rgb(255,60,30))",
                    border: "1px solid rgba(255,255,255,0.05)",
                }} />
                <span style={{ fontSize: "10px", color: "#444444" }}>
                    High error
                </span>
                <span style={{ fontSize: "10px", color: "#333333", marginLeft: "12px" }}>
                    {Math.round(minVal).toLocaleString("en-GB")} &ndash; {Math.round(maxVal).toLocaleString("en-GB")} MW
                </span>
            </div>

            {/* Tooltip — rendered via fixed positioning */}
            {tooltip && (
                <div style={{
                    position: "fixed",
                    left: tooltip.x,
                    top: tooltip.y - 8,
                    transform: "translate(-50%, -100%)",
                    background: "#1A1A1A",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "8px",
                    padding: "10px 13px",
                    minWidth: "170px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    pointerEvents: "none",
                    zIndex: 100,
                    fontSize: "12px",
                }}>
                    <div style={{ color: "#888888", marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px" }}>
                        {tooltip.day} &middot; {String(Math.floor(tooltip.slot / 2)).padStart(2, "0")}:{tooltip.slot % 2 === 0 ? "00" : "30"} UTC
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
                        <span style={{ color: "#555555", textTransform: "uppercase", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>
                            {metric}
                        </span>
                        <span style={{ color: "#E8E8E8", fontWeight: 600, fontFamily: "monospace" }}>
                            {tooltip.value > 0 ? "+" : ""}
                            {Math.round(tooltip.value).toLocaleString("en-GB")} MW
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                        <span style={{ color: "#555555", textTransform: "uppercase", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>
                            Samples
                        </span>
                        <span style={{ color: "#888888", fontFamily: "monospace", fontSize: "11px" }}>
                            {tooltip.count}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
