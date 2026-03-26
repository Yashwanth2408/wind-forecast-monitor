"use client";

import {
    ComposedChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlignedDataPoint, ChartMetrics } from "@/types";
import { format } from "date-fns";

interface Props {
    dataA: AlignedDataPoint[];
    dataB: AlignedDataPoint[];
    metricsA: ChartMetrics | null;
    metricsB: ChartMetrics | null;
    horizonA: number;
    horizonB: number;
    loading: boolean;
}

function CT({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "10px", padding: "13px 15px", minWidth: "200px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}>
            <p style={{
                fontSize: "11px", color: "#555555", marginBottom: "9px",
                paddingBottom: "7px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                {label ? format(new Date(label), "dd MMM yyyy · HH:mm 'UTC'") : ""}
            </p>
            {payload.map((p: any) =>
                p.value != null ? (
                    <div key={p.name} style={{
                        display: "flex", justifyContent: "space-between",
                        gap: "18px", marginBottom: "5px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "7px", height: "7px", borderRadius: "50%",
                                background: p.stroke, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: "12px", color: "#888888" }}>{p.name}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#E8E8E8", fontFamily: "monospace" }}>
                            {Math.round(p.value).toLocaleString("en-GB")} MW
                        </span>
                    </div>
                ) : null
            )}
        </div>
    );
}

function Empty() {
    return (
        <div style={{
            height: "340px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "12px",
        }}>
            <div style={{
                width: "46px", height: "46px", borderRadius: "12px",
                background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="1.5" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#888888" }}>
                Select two horizons and click Compare
            </p>
            <p style={{ fontSize: "12px", color: "#555555" }}>
                See how forecast accuracy degrades with horizon length
            </p>
        </div>
    );
}

function Skel() {
    return (
        <div style={{
            height: "340px", padding: "20px 0",
            display: "flex", flexDirection: "column", gap: "8px", justifyContent: "flex-end",
        }}>
            {[0.6, 0.8, 0.5, 0.9, 0.7, 0.55, 0.75].map((h, i) => (
                <div key={i} className="sk" style={{ height: `${h * 36}px`, width: "100%" }} />
            ))}
            <p style={{ textAlign: "center", fontSize: "12px", color: "#555555", marginTop: "8px" }}>
                Aligning forecasts for both horizons...
            </p>
        </div>
    );
}

export default function HorizonCompareChart({
    dataA, dataB, metricsA, metricsB, horizonA, horizonB, loading,
}: Props) {
    if (loading) return <Skel />;
    if (!dataA.length && !dataB.length) return <Empty />;

    const mapB = new Map(dataB.map(d => [d.startTime, d.forecast]));
    const step = dataA.length > 600 ? Math.ceil(dataA.length / 600) : 1;

    const cd = dataA
        .filter((_, i) => i % step === 0)
        .map(d => ({
            t: d.startTime,
            actual: d.actual,
            forecastA: d.forecast,
            forecastB: mapB.get(d.startTime) ?? null,
        }));

    const ticks = cd.filter((_, i) => i % Math.ceil(cd.length / 6) === 0).map(d => d.t);
    const vals = cd.flatMap(d => [d.actual, d.forecastA, d.forecastB]).filter((v): v is number => v != null);
    const yMin = vals.length ? Math.max(0, Math.floor(Math.min(...vals) * 0.92)) : 0;
    const yMax = vals.length ? Math.ceil(Math.max(...vals) * 1.06) : 15000;

    const rmseA = metricsA?.rmse ?? null;
    const rmseB = metricsB?.rmse ?? null;

    return (
        <>
            {/* RMSE comparison cards */}
            {rmseA != null && rmseB != null && (
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "12px", marginBottom: "20px",
                }}
                    className="stats-grid"
                >
                    {[
                        { horizon: horizonA, rmse: rmseA, mae: metricsA?.mae, color: "#60a5fa" },
                        { horizon: horizonB, rmse: rmseB, mae: metricsB?.mae, color: "#FF6533" },
                    ].map(({ horizon, rmse, mae, color }) => (
                        <div key={horizon} style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "10px", padding: "16px 18px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "10px", height: "10px",
                                    borderRadius: "50%", background: color, flexShrink: 0,
                                }} />
                                <div>
                                    <div style={{
                                        fontSize: "11px", color: "#555555", fontWeight: 600,
                                        textTransform: "uppercase", letterSpacing: "0.07em",
                                    }}>
                                        {horizon}h Horizon
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#444444", marginTop: "3px" }}>
                                        MAE {mae != null ? Math.round(mae).toLocaleString("en-GB") : "—"} MW
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    fontSize: "24px", fontWeight: 600,
                                    fontFamily: "monospace", color: "#E8E8E8", letterSpacing: "-0.02em",
                                }}>
                                    {Math.round(rmse).toLocaleString("en-GB")}
                                </div>
                                <div style={{ fontSize: "10px", color: "#555555" }}>RMSE MW</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accuracy delta callout */}
            {rmseA != null && rmseB != null && (
                <div style={{
                    marginBottom: "18px",
                    background: rmseB > rmseA ? "rgba(248,113,113,0.06)" : "rgba(74,222,128,0.06)",
                    border: rmseB > rmseA
                        ? "1px solid rgba(248,113,113,0.15)"
                        : "1px solid rgba(74,222,128,0.15)",
                    borderRadius: "8px", padding: "10px 14px",
                    fontSize: "12px",
                    color: rmseB > rmseA ? "#f87171" : "#4ade80",
                }}>
                    {rmseB > rmseA ? (
                        <>
                            The {horizonB}h horizon has{" "}
                            <strong>+{Math.round(rmseB - rmseA).toLocaleString("en-GB")} MW higher RMSE</strong>
                            {" "}than the {horizonA}h horizon
                            <span style={{ color: "#888888" }}>
                                {" "}— accuracy degrades by {((rmseB / rmseA - 1) * 100).toFixed(1)}% over {horizonB - horizonA}h additional lead time
                            </span>
                        </>
                    ) : (
                        <>
                            Both horizons perform similarly —{" "}
                            <strong>{Math.round(rmseA - rmseB).toLocaleString("en-GB")} MW RMSE difference</strong>
                        </>
                    )}
                </div>
            )}

            {/* Legend */}
            <div style={{ display: "flex", gap: "18px", marginBottom: "16px", flexWrap: "wrap" }}>
                {[
                    { label: "Actual Generation", color: "#9CA3AF", dashed: false },
                    { label: `${horizonA}h Forecast`, color: "#60a5fa", dashed: true },
                    { label: `${horizonB}h Forecast`, color: "#FF6533", dashed: true },
                ].map(({ label, color, dashed }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <svg width="22" height="8" viewBox="0 0 22 8">
                            <line
                                x1="0" y1="4" x2="22" y2="4"
                                stroke={color} strokeWidth="2"
                                strokeDasharray={dashed ? "5,3" : undefined}
                            />
                        </svg>
                        <span style={{ fontSize: "12px", color: "#888888" }}>{label}</span>
                    </div>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={cd} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
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
                    <Line
                        type="monotone" dataKey="actual" name="Actual"
                        stroke="#9CA3AF" strokeWidth={1.5}
                        dot={false} activeDot={{ r: 3, fill: "#9CA3AF", strokeWidth: 0 }}
                        connectNulls={false}
                    />
                    <Line
                        type="monotone" dataKey="forecastA" name={`${horizonA}h Forecast`}
                        stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 3"
                        dot={false} activeDot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }}
                        connectNulls={false}
                    />
                    <Line
                        type="monotone" dataKey="forecastB" name={`${horizonB}h Forecast`}
                        stroke="#FF6533" strokeWidth={1.5} strokeDasharray="5 3"
                        dot={false} activeDot={{ r: 3, fill: "#FF6533", strokeWidth: 0 }}
                        connectNulls={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            <p style={{ textAlign: "center", fontSize: "10px", color: "#333333", marginTop: "8px" }}>
                Generation in MW &middot; Y-axis labels in GW &middot; All times UTC
            </p>
        </>
    );
}
