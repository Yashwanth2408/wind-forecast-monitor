import { NextRequest, NextResponse } from "next/server";

const BMRS_BASE = process.env.BMRS_BASE_URL ?? "https://data.elexon.co.uk/bmrs/api/v1";


interface BMRSForecastRecord {
    startTime: string;
    publishTime: string;
    generation: number;
    dataset?: string;
}

interface ForecastRecord {
    startTime: string;
    publishTime: string;
    generation: number;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
        return NextResponse.json({ error: "from and to are required" }, { status: 400 });
    }

    try {
        const allData: ForecastRecord[] = [];

        // Extend back 48h to capture all forecasts that target this window
        const extendedFrom = new Date(from);
        extendedFrom.setDate(extendedFrom.getDate() - 3); // 3 days back

        const chunks = buildDateChunks(extendedFrom.toISOString(), to, 3);

        for (const chunk of chunks) {
            const url = new URL(`${BMRS_BASE}/datasets/WINDFOR/stream`);
            url.searchParams.set("publishDateTimeFrom", chunk.from);
            url.searchParams.set("publishDateTimeTo", chunk.to);

            let res = await fetch(url.toString(), {
                headers: { Accept: "application/json" },
            });

            if (res.status === 429) {
                await sleep(3000);
                res = await fetch(url.toString(), {
                    headers: { Accept: "application/json" },
                });
            }

            if (!res.ok) {
                console.error(`WINDFOR fetch failed: ${res.status}`);
                continue;
            }

            const raw: BMRSForecastRecord[] = await res.json();
            allData.push(...normalizeForecasts(raw));

            await sleep(300);
        }

        //  Deduplicate by (startTime + publishTime)
        const uniqueMap = new Map<string, ForecastRecord>();

        for (const record of allData) {
            const key = `${record.startTime}_${record.publishTime}`;
            uniqueMap.set(key, record);
        }

        const deduped = Array.from(uniqueMap.values());

        //  Debug logs
        console.log("Forecasts BEFORE dedup:", allData.length);
        console.log("Forecasts AFTER dedup:", deduped.length);

        return NextResponse.json({ data: deduped });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function normalizeForecasts(raw: BMRSForecastRecord[]): ForecastRecord[] {
    if (!Array.isArray(raw)) return [];

    return raw
        .filter((r) => r.startTime && r.publishTime && r.generation != null)
        .map((r) => ({
            startTime: r.startTime,
            publishTime: r.publishTime,
            generation: r.generation,
        }));
}

function buildDateChunks(
    from: string,
    to: string,
    chunkDays: number
): { from: string; to: string }[] {
    const chunks = [];
    let current = new Date(from);
    const end = new Date(to);

    while (current < end) {
        const chunkEnd = new Date(current);
        chunkEnd.setDate(chunkEnd.getDate() + chunkDays);
        if (chunkEnd > end) chunkEnd.setTime(end.getTime());
        chunks.push({ from: current.toISOString(), to: chunkEnd.toISOString() });
        current = new Date(chunkEnd);
    }

    return chunks;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
