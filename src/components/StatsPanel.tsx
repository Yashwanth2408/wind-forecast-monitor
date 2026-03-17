"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle } from "lucide-react";
import { ChartMetrics } from "@/types";
import { useTheme } from "./ThemeProvider";

interface StatsPanelProps {
    metrics: ChartMetrics | null;
    loading: boolean;
}

interface StatCardProps {
    label: string;
    value: string;
    unit: string;
    description: string;
    color: "blue" | "amber" | "green" | "red" | "purple";
    icon: React.ReactNode;
    index: number;
    isDark: boolean;
}

const colorMap = {
    blue: {
        value: "text-brand-blue",
        bg: "bg-brand-blue/8",
        border: "border-brand-blue/20",
        icon: "text-brand-blue/60",
    },
    amber: {
        value: "text-brand-amber",
        bg: "bg-brand-amber/8",
        border: "border-brand-amber/20",
        icon: "text-brand-amber/60",
    },
    green: {
        value: "text-brand-green",
        bg: "bg-brand-green/8",
        border: "border-brand-green/20",
        icon: "text-brand-green/60",
    },
    red: {
        value: "text-brand-red",
        bg: "bg-brand-red/8",
        border: "border-brand-red/20",
        icon: "text-brand-red/60",
    },
    purple: {
        value: "text-brand-purple",
        bg: "bg-brand-purple/8",
        border: "border-brand-purple/20",
        icon: "text-brand-purple/60",
    },
};

function StatCard({ label, value, unit, description, color, icon, index, isDark }: StatCardProps) {
    const c = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
            className={`
        relative rounded-xl p-5 border transition-all duration-200
        ${isDark
                    ? `bg-dark-surface border-dark-border hover:border-dark-border-2`
                    : `bg-light-surface border-light-border hover:border-light-border-2`
                }
      `}
        >
            <div className="flex items-start justify-between mb-3">
                <span className={`
          text-[10px] font-semibold uppercase tracking-widest
          ${isDark ? "text-slate-500" : "text-slate-400"}
        `}>
                    {label}
                </span>
                <span className={`${c.icon}`}>{icon}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className={`text-2xl font-bold tracking-tight font-mono ${c.value}`}>
                    {value}
                </span>
                <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {unit}
                </span>
            </div>
            <p className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {description}
            </p>
        </motion.div>
    );
}

function SkeletonCard({ isDark }: { isDark: boolean }) {
    return (
        <div className={`
      rounded-xl p-5 border
      ${isDark ? "bg-dark-surface border-dark-border" : "bg-light-surface border-light-border"}
    `}>
            <div className={`h-3 w-16 rounded skeleton mb-4`} />
            <div className={`h-7 w-24 rounded skeleton mb-2`} />
            <div className={`h-2.5 w-32 rounded skeleton`} />
        </div>
    );
}

export default function StatsPanel({ metrics, loading }: StatsPanelProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} isDark={isDark} />)}
            </div>
        );
    }

    if (!metrics) return null;

    const biasColor = metrics.bias > 100 ? "red" : metrics.bias < -100 ? "blue" : "green";
    const biasIcon = metrics.bias > 50
        ? <TrendingUp size={15} />
        : metrics.bias < -50
            ? <TrendingDown size={15} />
            : <Minus size={15} />;

    const biasDescription = metrics.bias > 100
        ? "Systematically over-forecasting"
        : metrics.bias < -100
            ? "Systematically under-forecasting"
            : "Well-calibrated forecast";

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                index={0}
                label="RMSE"
                value={metrics.rmse.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                description="Root mean squared error"
                color="blue"
                icon={<Activity size={15} />}
                isDark={isDark}
            />
            <StatCard
                index={1}
                label="MAE"
                value={metrics.mae.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                description="Mean absolute error"
                color="amber"
                icon={<AlertCircle size={15} />}
                isDark={isDark}
            />
            <StatCard
                index={2}
                label="Bias"
                value={(metrics.bias > 0 ? "+" : "") + metrics.bias.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                unit="MW"
                description={biasDescription}
                color={biasColor}
                icon={biasIcon}
                isDark={isDark}
            />
            <StatCard
                index={3}
                label="Coverage"
                value={metrics.coverage.toFixed(1)}
                unit="%"
                description={`${metrics.count.toLocaleString()} matched data points`}
                color="purple"
                icon={<Activity size={15} />}
                isDark={isDark}
            />
        </div>
    );
}
