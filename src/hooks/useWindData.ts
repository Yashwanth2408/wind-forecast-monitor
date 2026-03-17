import { useState, useCallback } from "react";
import { fetchActuals, fetchForecasts } from "@/lib/api";
import { alignForecastsToActuals } from "@/lib/horizon-logic";
import { calculateMetrics } from "@/lib/metrics";
import { AlignedDataPoint, ChartMetrics } from "@/types";

interface UseWindDataResult {
    data: AlignedDataPoint[];
    metrics: ChartMetrics | null;
    loading: boolean;
    error: string | null;
    fetch: (from: string, to: string, horizonHours: number) => Promise<void>;
}

export function useWindData(): UseWindDataResult {
    const [data, setData] = useState<AlignedDataPoint[]>([]);
    const [metrics, setMetrics] = useState<ChartMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(
        async (from: string, to: string, horizonHours: number) => {
            setLoading(true);
            setError(null);
            setData([]);
            setMetrics(null);

            try {
                const [actuals, forecasts] = await Promise.all([
                    fetchActuals(from, to),
                    fetchForecasts(from, to),
                ]);

                const aligned = alignForecastsToActuals(actuals, forecasts, horizonHours);
                const m = calculateMetrics(aligned);

                setData(aligned);
                setMetrics(m);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to load data";
                setError(message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { data, metrics, loading, error, fetch };
}
