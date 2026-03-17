import { NextRequest, NextResponse } from "next/server";

const BMRS_BASE = process.env.BMRS_BASE_URL ?? "https://data.elexon.co.uk/bmrs/api/v1";


interface BMRSFuelRecord {
    startTime: string;
    fuelType: string;
    generation: number;
}

interface ActualRecord {
    startTime: string;
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
        const allData: ActualRecord[] = [];

        // FUELHH uses settlementDate (yyyy-MM-dd), chunked by 1 day
        const chunks = buildDateChunks(from, to, 3);

        for (const chunk of chunks) {
            // Convert ISO to yyyy-MM-dd for settlement date params
            const dateFrom = chunk.from.slice(0, 10);
            const dateTo = chunk.to.slice(0, 10);

            const url = new URL(`${BMRS_BASE}/datasets/FUELHH/stream`);
            url.searchParams.set("settlementDateFrom", dateFrom);
            url.searchParams.set("settlementDateTo", dateTo);
            url.searchParams.append("fuelType", "WIND");

            let res = await fetch(url.toString(), {
                headers: { Accept: "application/json" },
            });

            // Handle rate limiting
            if (res.status === 429) {
                await sleep(3000);
                res = await fetch(url.toString(), {
                    headers: { Accept: "application/json" },
                });
            }

            if (!res.ok) {
                console.error(`FUELHH fetch failed: ${res.status} for ${dateFrom} → ${dateTo}`);
                continue;
            }

            const raw: BMRSFuelRecord[] = await res.json();
            const wind = filterWind(raw);
            allData.push(...wind);

            // Small delay between chunks to respect rate limits
            await sleep(300);
        }

        return NextResponse.json({ data: allData });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function filterWind(raw: BMRSFuelRecord[]): ActualRecord[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((r) => r.fuelType === "WIND")
        .map((r) => ({
            startTime: r.startTime,
            generation: r.generation ?? 0,
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

        chunks.push({
            from: current.toISOString(),
            to: chunkEnd.toISOString(),
        });

        current = new Date(chunkEnd);
    }

    return chunks;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
