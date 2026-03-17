"use client";

import { motion } from "framer-motion";
import { Wind, Activity } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

interface HeaderProps {
    lastUpdated?: string | null;
}

export default function Header({ lastUpdated }: HeaderProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`
        sticky top-0 z-50 w-full
        border-b backdrop-blur-md
        ${isDark
                    ? "bg-dark-bg/80 border-dark-border"
                    : "bg-light-bg/80 border-light-border"
                }
      `}
        >
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* Logo + Title */}
                <div className="flex items-center gap-3">
                    <div className={`
            flex items-center justify-center w-9 h-9 rounded-lg
            ${isDark ? "bg-brand-blue/10 border border-brand-blue/20" : "bg-brand-blue/10 border border-brand-blue/20"}
          `}>
                        <Wind size={18} className="text-brand-blue" />
                    </div>
                    <div>
                        <h1 className={`text-sm font-semibold leading-none mb-0.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                            Wind Forecast Monitor
                        </h1>
                        <p className={`text-xs leading-none ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            UK National Grid · Elexon BMRS
                        </p>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <div className={`
              hidden md:flex items-center gap-1.5 text-xs
              ${isDark ? "text-slate-500" : "text-slate-400"}
            `}>
                            <Activity size={12} className="text-brand-green" />
                            <span>Last loaded {lastUpdated}</span>
                        </div>
                    )}
                    <div className={`
            hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            ${isDark
                            ? "bg-brand-green/10 text-brand-green border border-brand-green/20"
                            : "bg-brand-green/10 text-brand-green border border-brand-green/20"
                        }
          `}>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-slow" />
                        Live Data
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </motion.header>
    );
}
