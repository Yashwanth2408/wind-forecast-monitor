export interface ActualRecord {
    startTime: string;
    generation: number;
}

export interface ForecastRecord {
    startTime: string;
    publishTime: string;
    generation: number;
}

export interface AlignedDataPoint {
    startTime: string;           // ISO string — target time
    actual: number | null;
    forecast: number | null;
    forecastPublishTime: string | null;
    horizonHours: number | null; // actual horizon used for this point
}

export interface FetchActualsParams {
    from: string; // ISO date-time string
    to: string;
}

export interface FetchForecastsParams {
    from: string;
    to: string;
}

export interface ApiResponse<T> {
    data: T[];
    error?: string;
}

export interface ChartMetrics {
    rmse: number;
    mae: number;
    bias: number;
    coverage: number; // % of time points that have both actual + forecast
    count: number;
}
