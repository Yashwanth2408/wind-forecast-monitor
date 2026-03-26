"use client";

import {
    ComposedChart, Line, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AlignedDataPoint } from "@/types";
import { format } from "date-fns";

interface Props { data: AlignedDataPoint[]; loading: boolean; }

function CT({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const actual = payload.find((p: any) => p.name === "Actual")?.value ?? null;
    const forecast = payload.find((p: any) => p.name === "Forecast")?.value ?? null;
    const error = actual != null && forecast != null ? forecast - actual : null;
    return (
        <div style={{
            background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "10px", padding: "13px 15px", minWidth: "180px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}>
            <p style={{
                fontSize: "11px", color: "#555555", marginBottom: "9px",
                paddingBottom: "7px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                {label ? format(new Date(label), "dd MMM yyyy · HH:mm 'UTC'") : ""}
            </p>

            {actual != null && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#888888" }}>Actual</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#E8E8E8", fontFamily: "monospace" }}>
                        {actual.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}

            {forecast != null && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#9CA3AF", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#888888" }}>Forecast</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#E8E8E8", fontFamily: "monospace" }}>
                        {forecast.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}

            {error != null && (
                <div style={{
                    marginTop: "7px", paddingTop: "7px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between",
                }}>
                    <span style={{ fontSize: "11px", color: "#555555" }}>Error</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, fontFamily: "monospace", color: error > 0 ? "#f87171" : "#4ade80" }}>
                        {error > 0 ? "+" : ""}{error.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}
        </div>
    );
}

function Empty() {
    return (
        <div style={{ height: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div style={{
                width: "46px", height: "46px", borderRadius: "12px",
                background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="1.5" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#888888" }}>Select a date range and load data</p>
            <p style={{ fontSize: "12px", color: "#555555" }}>Data available from January 2025 onwards</p>
        </div>
    );
}

function Skel() {
    return (
        <div style={{ height: "360px", padding: "20px 0", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "flex-end" }}>
            {[0.7, 0.5, 0.9, 0.6, 0.8, 0.55, 0.75].map((h, i) => (
                <div key={i} className="sk" style={{ height: `${h * 38}px`, width: "100%" }} />
            ))}
            <p style={{ textAlign: "center", fontSize: "12px", color: "#555555", marginTop: "8px" }}>
                Fetching data from Elexon BMRS...
            </p>
        </div>
    );
}

export default function ForecastChart({ data, loading }: Props) {
    if (loading) return <Skel />;
    if (!data.length) return <Empty />;

    const step = data.length > 600 ? Math.ceil(data.length / 600) : 1;
    const cd = data.filter((_, i) => i % step === 0).map(d => ({
        t: d.startTime,
        actual: d.actual,
        forecast: d.forecast,
        eTop: d.actual != null && d.forecast != null ? Math.max(d.actual, d.forecast) : null,
        eBot: d.actual != null && d.forecast != null ? Math.min(d.actual, d.forecast) : null,
    }));

    const ticks = cd.filter((_, i) => i % Math.ceil(cd.length / 6) === 0).map(d => d.t);
    const vals = cd.flatMap(d => [d.actual, d.forecast]).filter((v): v is number => v != null);
    const yMin = vals.length ? Math.max(0, Math.floor(Math.min(...vals) * 0.92)) : 0;
    const yMax = vals.length ? Math.ceil(Math.max(...vals) * 1.06) : 15000;

    return (
        <>
            {/* Legend */}
            <div style={{ display: "flex", gap: "18px", marginBottom: "18px" }}>
                {[
                    { label: "Actual Generation", color: "#60a5fa", dashed: false },
                    { label: "Forecast", color: "#9CA3AF", dashed: true },
                ].map(({ label, color, dashed }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <svg width="22" height="8" viewBox="0 0 22 8">
                            <line x1="0" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "5,3" : undefined} />
                        </svg>
                        <span style={{ fontSize: "12px", color: "#888888" }}>{label}</span>
                    </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "16px", height: "10px", borderRadius: "3px", background: "rgba(248,113,113,0.18)", border: "1px solid rgba(248,113,113,0.3)" }} />
                    <span style={{ fontSize: "12px", color: "#888888" }}>Error Band</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={cd} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#f87171" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,0.04)" vertical={false} />

                    <XAxis
                        dataKey="t" ticks={ticks}
                        tickFormatter={v => { try { return format(new Date(v), "d MMM HH:mm"); } catch { return v; } }}
                        tick={{ fill: "#555555", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.04)" }}
                        tickLine={false} dy={8}
                    />

                    <YAxis
                        domain={[yMin, yMax]}
                        tick={{ fill: "#555555", fontSize: 11 }}
                        axisLine={false} tickLine={false}
                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                        width={34}
                    />

                    <Tooltip
                        content={<CT />}
                        cursor={{ stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, strokeDasharray: "4 2" }}
                    />

                    <Area dataKey="eTop" stroke="none" fill="url(#eg)" legendType="none" dot={false} activeDot={false} connectNulls={false} name="eTop" />
                    <Area dataKey="eBot" stroke="none" fill="#0C0C0C" fillOpacity={1} legendType="none" dot={false} activeDot={false} connectNulls={false} name="eBot" />

                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }} connectNulls={false} />
                    <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#9CA3AF" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: "#9CA3AF", strokeWidth: 0 }} strokeDasharray="5 3" connectNulls={false} />

                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
                </ComposedChart>
            </ResponsiveContainer>

            <p style={{ textAlign: "center", fontSize: "10px", color: "#333333", marginTop: "8px" }}>
                Generation in MW · Y-axis labels in GW · All times UTC
            </p>
        </>
    );
}
