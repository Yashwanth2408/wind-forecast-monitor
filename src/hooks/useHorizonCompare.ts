import { useState, useCallback } from "react";
import { fetchActuals, fetchForecasts } from "@/lib/api";
import { alignForecastsToActuals } from "@/lib/horizon-logic";
import { calculateMetrics } from "@/lib/metrics";
import { AlignedDataPoint, ChartMetrics } from "@/types";

interface CompareState {
    dataA: AlignedDataPoint[];
    dataB: AlignedDataPoint[];
    metricsA: ChartMetrics | null;
    metricsB: ChartMetrics | null;
    loading: boolean;
    error: string | null;
}

export function useHorizonCompare() {
    const [state, setState] = useState<CompareState>({
        dataA: [],
        dataB: [],
        metricsA: null,
        metricsB: null,
        loading: false,
        error: null,
    });

    const fetch = useCallback(async (
        from: string,
        to: string,
        horizonA: number,
        horizonB: number,
    ) => {
        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const [actuals, forecasts] = await Promise.all([
                fetchActuals(from, to),
                fetchForecasts(from, to),
            ]);

            const dataA = alignForecastsToActuals(actuals, forecasts, horizonA);
            const dataB = alignForecastsToActuals(actuals, forecasts, horizonB);

            setState({
                dataA,
                dataB,
                metricsA: calculateMetrics(dataA),
                metricsB: calculateMetrics(dataB),
                loading: false,
                error: null,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load data";
            setState(s => ({ ...s, loading: false, error: message }));
        }
    }, []);

    const clear = useCallback(() => {
        setState({ dataA: [], dataB: [], metricsA: null, metricsB: null, loading: false, error: null });
    }, []);

    return { ...state, fetch, clear };
}
