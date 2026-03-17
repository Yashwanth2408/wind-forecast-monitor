"use client";

import { useTheme } from "./ThemeProvider";

interface HorizonSliderProps {
    value: number;
    onChange: (value: number) => void;
}

const presets = [1, 4, 12, 24, 48];

export default function HorizonSlider({ value, onChange }: HorizonSliderProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const pct = (value / 48) * 100;

    return (
        <div className={`
      rounded-xl px-5 py-4 border
      ${isDark
                ? "bg-dark-surface border-dark-border"
                : "bg-light-surface border-light-border"
            }
    `}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        Forecast Horizon
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Show latest forecast published at least{" "}
                        <span className="font-semibold text-brand-blue">{value}h</span> before target time
                    </p>
                </div>
                <div className={`
          px-3 py-1 rounded-lg text-sm font-bold font-mono
          ${isDark
                        ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                        : "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                    }
        `}>
                    {value}h
                </div>
            </div>

            {/* Slider */}
            <div className="mb-3">
                <input
                    type="range"
                    min={0}
                    max={48}
                    step={1}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full"
                    style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${pct}%, ${isDark ? "#1e2d45" : "#D1DCF0"} ${pct}%, ${isDark ? "#1e2d45" : "#D1DCF0"} 100%)`,
                    }}
                />
                <div className={`flex justify-between text-[10px] mt-1 font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <span>0h</span>
                    <span>12h</span>
                    <span>24h</span>
                    <span>36h</span>
                    <span>48h</span>
                </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-medium uppercase tracking-wider mr-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    Presets
                </span>
                {presets.map((p) => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`
              px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150
              ${value === p
                                ? "bg-brand-blue text-white"
                                : isDark
                                    ? "bg-dark-surface-2 text-slate-400 hover:text-slate-200 border border-dark-border hover:border-dark-border-2"
                                    : "bg-light-surface-2 text-slate-500 hover:text-slate-700 border border-light-border hover:border-light-border-2"
                            }
            `}
                    >
                        {p}h
                    </button>
                ))}
            </div>
        </div>
    );
}
