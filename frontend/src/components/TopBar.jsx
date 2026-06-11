import React, { useState } from "react";
import { HAND_UPGRADE_VALUES } from "../../../backend/src/scoring.js";

// Helper for initial base hand stats
const BASE_HAND_STATS = {
  "Royal Flush": { chips: 100, mult: 8 },
  "Straight Flush": { chips: 100, mult: 8 },
  "Four of a Kind": { chips: 60, mult: 7 },
  "Full House": { chips: 40, mult: 4 },
  "Flush": { chips: 35, mult: 4 },
  "Straight": { chips: 30, mult: 4 },
  "Three of a Kind": { chips: 30, mult: 3 },
  "Two Pair": { chips: 20, mult: 2 },
  "Pair": { chips: 10, mult: 2 },
  "High Card": { chips: 5, mult: 1 }
};

export default function TopBar({ state }) {
  const [showLevels, setShowLevels] = useState(false);

  if (!state) return null;

  const { blindType, handLevels } = state;

  return (
    <div className="top-bar">
      {/* Round/Blind Info */}
      <div className="top-bar-item">
        <span style={{ fontSize: "1.4rem" }}>
          {blindType === "Small" && "🌤️"}
          {blindType === "Big" && "🌙"}
          {blindType === "Boss" && "👹"}
        </span>
        <span 
          className="pixel-font" 
          style={{ 
            fontSize: "0.8rem", 
            color: blindType === "Boss" ? "var(--mult-red)" : "white" 
          }}
        >
          {blindType.toUpperCase()} BLIND ROUND
        </span>
      </div>

      {/* Hand Levels Toggle Button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowLevels(!showLevels)}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid var(--panel-border)",
            color: "white",
            padding: "6px 12px",
            fontSize: "10px",
            fontFamily: "var(--font-pixel)",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          📊 Hand Levels
        </button>

        {showLevels && (
          <div style={{
            position: "absolute",
            top: "35px",
            right: "0",
            width: "320px",
            backgroundColor: "var(--panel-bg)",
            border: "2px solid var(--panel-border)",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
            zIndex: 200,
            maxHeight: "380px",
            overflowY: "auto"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "8px",
              marginBottom: "10px"
            }}>
              <span className="pixel-font" style={{ fontSize: "9px", color: "var(--accent-gold)" }}>
                POKER HAND STATS
              </span>
              <button 
                onClick={() => setShowLevels(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.keys(BASE_HAND_STATS).map((handName) => {
                const currentLevel = handLevels[handName] || 1;
                const base = BASE_HAND_STATS[handName];
                const upgrade = HAND_UPGRADE_VALUES[handName] || { chips: 0, mult: 0 };
                
                const finalChips = base.chips + (currentLevel - 1) * upgrade.chips;
                const finalMult = base.mult + (currentLevel - 1) * upgrade.mult;

                return (
                  <div 
                    key={handName}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 45px 1fr",
                      fontSize: "10px",
                      alignItems: "center",
                      padding: "4px 0"
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "white" }}>{handName}</span>
                    <span style={{ color: "var(--accent-gold)" }}>Lv.{currentLevel}</span>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <span style={{ color: "var(--chip-blue)", background: "rgba(74,158,255,0.1)", padding: "1px 4px", borderRadius: "2px" }}>
                        {finalChips}
                      </span>
                      <span style={{ color: "var(--mult-red)", background: "rgba(255,68,68,0.1)", padding: "1px 4px", borderRadius: "2px" }}>
                        x{finalMult}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
