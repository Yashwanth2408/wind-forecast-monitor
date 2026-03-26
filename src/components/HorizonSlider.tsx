"use client";

const PRESETS = [1, 4, 12, 24, 48];

interface HorizonSliderProps {
    value: number;
    onChange: (v: number) => void;
}

export default function HorizonSlider({ value, onChange }: HorizonSliderProps) {
    const pct = (value / 48) * 100;
    return (
        <div style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#E8E8E8", marginBottom: "3px" }}>Forecast Horizon</div>
                    <div style={{ fontSize: "12px", color: "#555555" }}>
                        Latest forecast published at least{" "}
                        <span style={{ color: "#FF6533", fontWeight: 600 }}>{value}h</span> before each target time
                    </div>
                </div>
                <div style={{
                    background: "rgba(255,101,51,0.1)", border: "1px solid rgba(255,101,51,0.2)",
                    color: "#FF6533", fontWeight: 700, fontFamily: "monospace", fontSize: "14px",
                    padding: "5px 13px", borderRadius: "7px", minWidth: "50px", textAlign: "center",
                }}>
                    {value}h
                </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <input type="range" min={0} max={48} step={1} value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    style={{
                        width: "100%",
                        background: `linear-gradient(to right,#FF6533 ${pct}%,rgba(255,255,255,0.08) ${pct}%)`,
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#444444", marginTop: "5px" }}>
                    {["0h", "12h", "24h", "36h", "48h"].map(t => <span key={t}>{t}</span>)}
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#444444", marginRight: "4px" }}>Quick:</span>
                {PRESETS.map(p => (
                    <button key={p} onClick={() => onChange(p)} style={{
                        padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                        cursor: "pointer", transition: "all 0.12s",
                        border: value === p ? "1px solid rgba(255,101,51,0.35)" : "1px solid rgba(255,255,255,0.07)",
                        background: value === p ? "rgba(255,101,51,0.1)" : "transparent",
                        color: value === p ? "#FF6533" : "#888888",
                    }}>
                        {p}h
                    </button>
                ))}
            </div>
        </div>
    );
}
