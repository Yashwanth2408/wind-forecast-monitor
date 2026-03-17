import { ActualRecord, ForecastRecord } from "@/types";

export async function fetchActuals(
    from: string,
    to: string
): Promise<ActualRecord[]> {
    const res = await fetch(
        `/api/actuals?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    if (!res.ok) throw new Error("Failed to fetch actuals");
    const json = await res.json();
    return json.data ?? [];
}

export async function fetchForecasts(
    from: string,
    to: string
): Promise<ForecastRecord[]> {
    const res = await fetch(
        `/api/forecasts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    if (!res.ok) throw new Error("Failed to fetch forecasts");
    const json = await res.json();
    return json.data ?? [];
}
