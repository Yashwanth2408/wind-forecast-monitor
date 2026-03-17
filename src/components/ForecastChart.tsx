"use client";

import { motion } from "framer-motion";
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { AlignedDataPoint } from "@/types";
import { format } from "date-fns";
import { useTheme } from "./ThemeProvider";

interface ForecastChartProps {
    data: AlignedDataPoint[];
    loading: boolean;
}

interface TooltipEntry {
    name: string;
    value: number | null;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const actual = payload.find((p) => p.name === "Actual")?.value ?? null;
    const forecast = payload.find((p) => p.name === "Forecast")?.value ?? null;
    const error =
        actual != null && forecast != null ? forecast - actual : null;

    return (
        <div
            style={{
                background: "rgba(13,19,33,0.97)",
                border: "1px solid rgba(30,45,69,0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                padding: "14px",
                minWidth: "175px",
            }}
        >
            <p
                style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#64748B",
                    marginBottom: "10px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(51,65,85,0.5)",
                }}
            >
                {label ? format(new Date(label), "dd MMM yyyy · HH:mm") : ""}
            </p>

            {actual != null && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "6px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#3B82F6",
                            }}
                        />
                        <span style={{ fontSize: "12px", color: "#94A3B8" }}>Actual</span>
                    </div>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#E2E8F5",
                            fontFamily: "monospace",
                        }}
                    >
                        {actual.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}

            {forecast != null && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "6px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#10B981",
                            }}
                        />
                        <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Forecast
                        </span>
                    </div>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#E2E8F5",
                            fontFamily: "monospace",
                        }}
                    >
                        {forecast.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}

            {error != null && (
                <div
                    style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid rgba(51,65,85,0.5)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Error</span>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            fontFamily: "monospace",
                            color: error > 0 ? "#EF4444" : "#3B82F6",
                        }}
                    >
                        {error > 0 ? "+" : ""}
                        {error.toLocaleString("en-GB")} MW
                    </span>
                </div>
            )}
        </div>
    );
}

function SkeletonChart({ isDark }: { isDark: boolean }) {
    return (
        <div
            style={{
                width: "100%",
                height: "420px",
                borderRadius: "12px",
                border: `1px solid ${isDark ? "#1e2d45" : "#D1DCF0"}`,
                background: isDark ? "#0D1321" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                padding: "24px",
            }}
        >
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 0.85, 0.92, 0.78, 0.88, 0.95].map((w, i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{
                            height: "8px",
                            width: `${w * 100}%`,
                            borderRadius: "4px",
                        }}
                    />
                ))}
            </div>
            <p
                style={{
                    fontSize: "12px",
                    color: isDark ? "#374151" : "#9CA3AF",
                    fontWeight: 500,
                }}
            >
                Fetching generation data...
            </p>
        </div>
    );
}

function EmptyChart({ isDark }: { isDark: boolean }) {
    return (
        <div
            style={{
                width: "100%",
                height: "420px",
                borderRadius: "12px",
                border: `1px solid ${isDark ? "#1e2d45" : "#D1DCF0"}`,
                background: isDark ? "#0D1321" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
            }}
        >
            <div
                style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    border: `1px solid ${isDark ? "#1e2d45" : "#D1DCF0"}`,
                    background: isDark ? "#111827" : "#F0F4FA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDark ? "#374151" : "#9CA3AF"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </div>
            <div style={{ textAlign: "center" }}>
                <p
                    style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: isDark ? "#64748B" : "#6B7280",
                        marginBottom: "4px",
                    }}
                >
                    No data to display
                </p>
                <p style={{ fontSize: "12px", color: isDark ? "#374151" : "#9CA3AF" }}>
                    Select a date range and click Load Data to begin
                </p>
            </div>
        </div>
    );
}

export default function ForecastChart({ data, loading }: ForecastChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const gridColor = isDark ? "#1e2d45" : "#E8EEF8";
    const axisColor = isDark ? "#4B5563" : "#9CA3AF";
    const bgColor = isDark ? "#080C14" : "#F4F7FB";

    if (loading) return <SkeletonChart isDark={isDark} />;
    if (!data.length) return <EmptyChart isDark={isDark} />;

    const step = data.length > 600 ? Math.ceil(data.length / 600) : 1;
    const chartData = data
        .filter((_, i) => i % step === 0)
        .map((d) => ({
            t: d.startTime,
            actual: d.actual,
            forecast: d.forecast,
            errorTop:
                d.actual != null && d.forecast != null
                    ? Math.max(d.actual, d.forecast)
                    : null,
            errorBottom:
                d.actual != null && d.forecast != null
                    ? Math.min(d.actual, d.forecast)
                    : null,
        }));

    const ticks = chartData
        .filter((_, i) => i % Math.ceil(chartData.length / 7) === 0)
        .map((d) => d.t);

    const allValues = chartData
        .flatMap((d) => [d.actual, d.forecast])
        .filter((v): v is number => v != null);

    const yMin = allValues.length ? Math.max(0, Math.floor(Math.min(...allValues) * 0.9)) : 0;
    const yMax = allValues.length ? Math.ceil(Math.max(...allValues) * 1.05) : 15000;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                width: "100%",
                borderRadius: "12px",
                border: `1px solid ${isDark ? "#1e2d45" : "#D1DCF0"}`,
                background: isDark ? "#0D1321" : "#FFFFFF",
                padding: "20px",
            }}
        >
            {/* Manual Legend */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "16px",
                }}
            >
                {[
                    { label: "Actual Generation", color: "#3B82F6", dashed: false },
                    { label: "Forecast", color: "#10B981", dashed: true },
                ].map(({ label, color, dashed }) => (
                    <div
                        key={label}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <svg width="24" height="8" viewBox="0 0 24 8">
                            <line
                                x1="0"
                                y1="4"
                                x2="24"
                                y2="4"
                                stroke={color}
                                strokeWidth="2"
                                strokeDasharray={dashed ? "5,3" : undefined}
                            />
                        </svg>
                        <span
                            style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: isDark ? "#94A3B8" : "#6B7280",
                            }}
                        >
                            {label}
                        </span>
                    </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                        style={{
                            width: "16px",
                            height: "10px",
                            borderRadius: "3px",
                            background: "rgba(239,68,68,0.15)",
                            border: "1px solid rgba(239,68,68,0.25)",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: isDark ? "#94A3B8" : "#6B7280",
                        }}
                    >
                        Error Band
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={360}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 5, right: 10, bottom: 5, left: 5 }}
                >
                    <defs>
                        <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 6"
                        stroke={gridColor}
                        vertical={false}
                        opacity={0.7}
                    />

                    <XAxis
                        dataKey="t"
                        ticks={ticks}
                        tickFormatter={(v) => {
                            try {
                                return format(new Date(v), "d MMM HH:mm");
                            } catch {
                                return v;
                            }
                        }}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        dy={8}
                    />

                    <YAxis
                        domain={[yMin, yMax]}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        width={38}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            stroke: isDark ? "#374151" : "#CBD5E1",
                            strokeWidth: 1,
                            strokeDasharray: "4 2",
                        }}
                    />

                    <Area
                        dataKey="errorTop"
                        stroke="none"
                        fill="url(#errorGrad)"
                        legendType="none"
                        dot={false}
                        activeDot={false}
                        connectNulls={false}
                        name="errorTop"
                    />
                    <Area
                        dataKey="errorBottom"
                        stroke="none"
                        fill={bgColor}
                        fillOpacity={1}
                        legendType="none"
                        dot={false}
                        activeDot={false}
                        connectNulls={false}
                        name="errorBottom"
                    />

                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                        connectNulls={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Forecast"
                        stroke="#10B981"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                        strokeDasharray="5 3"
                        connectNulls={false}
                    />

                    <ReferenceLine y={0} stroke={gridColor} strokeWidth={1} />
                </ComposedChart>
            </ResponsiveContainer>

            <p
                style={{
                    textAlign: "center",
                    fontSize: "10px",
                    color: isDark ? "#1F2937" : "#9CA3AF",
                    marginTop: "8px",
                }}
            >
                Generation in MW · Y-axis labels in GW · All times in UTC
            </p>
        </motion.div>
    );
}
