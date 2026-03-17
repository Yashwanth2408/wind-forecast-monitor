"use client";

import { AlignedDataPoint } from "@/types";

interface ExportButtonProps {
    data: AlignedDataPoint[];
    disabled: boolean;
}

export default function ExportButton({ data, disabled }: ExportButtonProps) {
    const handleCSV = () => {
        const header = "startTime,actual_MW,forecast_MW,forecastPublishTime,horizonHours\n";
        const rows = data
            .map((d) =>
                `${d.startTime},${d.actual ?? ""},${d.forecast ?? ""},${d.forecastPublishTime ?? ""},${d.horizonHours ?? ""}`
            )
            .join("\n");

        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wind-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleCSV}
            disabled={disabled}
            className="text-xs px-3 py-2 rounded-lg font-medium transition-all"
            style={{
                background: disabled ? "var(--surface)" : "var(--surface-2)",
                color: disabled ? "var(--text-secondary)" : "var(--accent-green)",
                border: "1px solid var(--border)",
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            ↓ Export CSV
        </button>
    );
}
