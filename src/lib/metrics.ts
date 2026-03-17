import { AlignedDataPoint, ChartMetrics } from "@/types";

export function calculateMetrics(data: AlignedDataPoint[]): ChartMetrics {
    const paired = data.filter(
        (d) => d.actual !== null && d.forecast !== null
    );

    const total = data.filter((d) => d.actual !== null).length;

    if (paired.length === 0) {
        return { rmse: 0, mae: 0, bias: 0, coverage: 0, count: 0 };
    }

    const errors = paired.map((d) => d.forecast! - d.actual!);

    const mae =
        errors.reduce((sum, e) => sum + Math.abs(e), 0) / errors.length;

    const rmse = Math.sqrt(
        errors.reduce((sum, e) => sum + e * e, 0) / errors.length
    );

    const bias = errors.reduce((sum, e) => sum + e, 0) / errors.length;

    const coverage = total > 0 ? (paired.length / total) * 100 : 0;

    return {
        rmse: Math.round(rmse * 10) / 10,
        mae: Math.round(mae * 10) / 10,
        bias: Math.round(bias * 10) / 10,
        coverage: Math.round(coverage * 10) / 10,
        count: paired.length,
    };
}
