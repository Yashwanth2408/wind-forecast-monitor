"use client";

import { Activity, BarChart2, Settings, HelpCircle, Wind, LogOut, X } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const NAV = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "analysis", label: "Analysis", icon: BarChart2 },
];

const TOOLS = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
];

export default function Sidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }: SidebarProps) {
    const handleNavClick = (id: string) => {
        onTabChange(id);
        onMobileClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`sidebar-backdrop ${mobileOpen ? "open" : ""}`}
                onClick={onMobileClose}
                aria-hidden="true"
            />

            <aside
                className={`sidebar-root ${mobileOpen ? "open" : ""}`}
                style={{
                    width: "210px",
                    minWidth: "210px",
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    background: "#111111",
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                {/* Logo row */}
                <div style={{
                    padding: "20px 18px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "9px",
                            background: "linear-gradient(135deg, #FF6533, #FF9A6C)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <Wind size={16} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#E8E8E8", lineHeight: 1.25 }}>
                                Wind Monitor
                            </div>
                            <div style={{ fontSize: "10px", color: "#444444", marginTop: "2px" }}>
                                Elexon BMRS
                            </div>
                        </div>
                    </div>

                    {/* Close button — mobile only */}
                    <button
                        onClick={onMobileClose}
                        style={{
                            display: "none",
                            width: "28px", height: "28px",
                            borderRadius: "6px", border: "none",
                            background: "rgba(255,255,255,0.05)",
                            color: "#888888", cursor: "pointer",
                            alignItems: "center", justifyContent: "center",
                        }}
                        className="hamburger-btn"
                        aria-label="Close menu"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Search */}
                <div style={{
                    margin: "14px 14px 6px",
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "#0C0C0C",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "8px 11px",
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span style={{ fontSize: "12px", color: "#444444" }}>Search</span>
                </div>

                {/* Nav */}
                <nav style={{ padding: "10px 12px", flex: 1 }}>
                    <div style={{
                        fontSize: "10px", fontWeight: 600, letterSpacing: "0.09em",
                        textTransform: "uppercase", color: "#444444",
                        padding: "6px 8px 4px",
                    }}>
                        Menu
                    </div>

                    {NAV.map(({ id, label, icon: Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => handleNavClick(id)}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: "9px",
                                    padding: "9px 10px", borderRadius: "8px", border: "none",
                                    background: active ? "rgba(255,101,51,0.1)" : "transparent",
                                    color: active ? "#E8E8E8" : "#888888",
                                    fontSize: "13px", fontWeight: active ? 600 : 400,
                                    cursor: "pointer", transition: "all 0.13s",
                                    marginBottom: "2px", textAlign: "left",
                                }}
                                onMouseEnter={e => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                                }}
                                onMouseLeave={e => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                            >
                                <Icon size={14} color={active ? "#FF6533" : "#555555"} />
                                {label}
                                {active && (
                                    <div style={{
                                        marginLeft: "auto", width: "5px", height: "5px",
                                        borderRadius: "50%", background: "#FF6533",
                                    }} />
                                )}
                            </button>
                        );
                    })}

                    <div style={{
                        fontSize: "10px", fontWeight: 600, letterSpacing: "0.09em",
                        textTransform: "uppercase", color: "#444444",
                        padding: "14px 8px 4px",
                    }}>
                        Tools
                    </div>

                    {TOOLS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                                padding: "9px 10px", borderRadius: "8px", border: "none",
                                background: "transparent", color: "#888888",
                                fontSize: "13px", cursor: "pointer", transition: "all 0.13s",
                                marginBottom: "2px", textAlign: "left",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            }}
                        >
                            <Icon size={14} color="#555555" />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Info card */}
                <div style={{
                    margin: "14px",
                    background: "linear-gradient(135deg, rgba(255,101,51,0.12), rgba(255,101,51,0.04))",
                    border: "1px solid rgba(255,101,51,0.18)",
                    borderRadius: "12px", padding: "14px",
                }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#FF6533", marginBottom: "5px" }}>
                        UK National Grid
                    </div>
                    <div style={{ fontSize: "11px", color: "#888888", lineHeight: 1.55, marginBottom: "10px" }}>
                        Real-time wind generation via FUELHH &amp; WINDFOR streams
                    </div>
                    <div style={{
                        display: "inline-block", fontSize: "10px", fontWeight: 600,
                        color: "#FF6533", background: "rgba(255,101,51,0.1)",
                        padding: "3px 9px", borderRadius: "5px",
                    }}>
                        Jan 2025 onwards
                    </div>
                </div>

                {/* Logout */}
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "9px",
                        padding: "14px 20px", border: "none",
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                        background: "transparent", color: "#444444",
                        fontSize: "13px", cursor: "pointer",
                        transition: "color 0.15s", width: "100%",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#444444"; }}
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </aside>
        </>
    );
}
