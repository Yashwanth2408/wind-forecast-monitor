import { ForecastRecord, ActualRecord, AlignedDataPoint } from "@/types";

/**
 * For each actual data point (target time), finds the LATEST forecast
 * that was published at least `horizonHours` before that target time.
 *
 * Key insight: WINDFOR publishes at hourly resolution, FUELHH actuals
 * are 30-min resolution. We floor to the hour for matching.
 */
export function alignForecastsToActuals(
    actuals: ActualRecord[],
    forecasts: ForecastRecord[],
    horizonHours: number
): AlignedDataPoint[] {
    // Group forecasts by their startTime (floored to hour) for O(1) lookup
    const forecastsByStartTime = new Map<string, ForecastRecord[]>();

    for (const f of forecasts) {
        const key = floorToHour(f.startTime);
        if (!forecastsByStartTime.has(key)) {
            forecastsByStartTime.set(key, []);
        }
        forecastsByStartTime.get(key)!.push(f);
    }

    const result: AlignedDataPoint[] = [];

    for (const actual of actuals) {
        const targetTime = new Date(actual.startTime).getTime();
        const cutoffTime = targetTime - horizonHours * 60 * 60 * 1000;

        // Floor actual startTime to hour to match WINDFOR hourly resolution
        const key = floorToHour(actual.startTime);
        const candidates = forecastsByStartTime.get(key) || [];

        // Filter: publishTime must be <= cutoff AND horizon 0-48h
        const valid = candidates.filter((f) => {
            const publishMs = new Date(f.publishTime).getTime();
            const actualHorizon = (targetTime - publishMs) / (1000 * 60 * 60);
            return publishMs <= cutoffTime && actualHorizon >= 0 && actualHorizon <= 48;
        });

        if (valid.length === 0) {
            result.push({
                startTime: actual.startTime,
                actual: actual.generation,
                forecast: null,
                forecastPublishTime: null,
                horizonHours: null,
            });
            continue;
        }

        // Pick the LATEST valid forecast (closest to cutoff = freshest)
        const best = valid.reduce((a, b) =>
            new Date(a.publishTime) > new Date(b.publishTime) ? a : b
        );

        const actualHorizonUsed =
            (targetTime - new Date(best.publishTime).getTime()) / (1000 * 60 * 60);

        result.push({
            startTime: actual.startTime,
            actual: actual.generation,
            forecast: best.generation,
            forecastPublishTime: best.publishTime,
            horizonHours: Math.round(actualHorizonUsed * 10) / 10,
        });
    }

    return result.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

/**
 * Floor ISO timestamp to the nearest hour.
 * WINDFOR has hourly resolution — :30 actuals match to :00 forecast.
 */
function floorToHour(isoString: string): string {
    const d = new Date(isoString);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
}
