"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`
        relative flex items-center justify-center
        w-9 h-9 rounded-lg
        border transition-all duration-200
        ${theme === "dark"
                    ? "border-dark-border bg-dark-surface-2 text-slate-400 hover:text-slate-200 hover:border-dark-border-2"
                    : "border-light-border bg-light-surface text-slate-500 hover:text-slate-700 hover:border-light-border-2"
                }
      `}
        >
            <motion.div
                key={theme}
                initial={{ scale: 0.6, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
        </button>
    );
}
