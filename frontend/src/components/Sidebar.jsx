import React from "react";

export default function Sidebar({ state }) {
  if (!state) return null;

  const {
    ante,
    blindType,
    bossBlind,
    score,
    targetScore,
    money,
    handsRemaining,
    discardsRemaining
  } = state;

  const scorePercentage = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="sidebar">
      {/* Game Title */}
      <div>
        <div 
          className="pixel-font" 
          style={{ 
            fontSize: "1.1rem", 
            color: "var(--mult-red)", 
            letterSpacing: "2px",
            textAlign: "center",
            marginBottom: "5px",
            textShadow: "2px 2px 0px #000"
          }}
        >
          BALATRO
        </div>
        <div 
          className="pixel-font" 
          style={{ 
            fontSize: "0.75rem", 
            color: "var(--accent-gold)", 
            textAlign: "center",
            letterSpacing: "1px",
            marginBottom: "25px"
          }}
        >
          LITE
        </div>

        {/* Score Panel */}
        <div style={{
          backgroundColor: "#000",
          border: "2px solid var(--panel-border)",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "20px"
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
            ROUND SCORE
          </div>
          <div 
            className="pixel-font" 
            style={{ 
              fontSize: "1.2rem", 
              color: "white", 
              marginBottom: "8px",
              textAlign: "right"
            }}
          >
            {score.toLocaleString()}
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
            <span>TARGET</span>
            <span style={{ color: "var(--accent-gold)" }}>{targetScore.toLocaleString()}</span>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: "8px",
            backgroundColor: "#222",
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${scorePercentage}%`,
              height: "100%",
              backgroundColor: "var(--accent-gold)",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        {/* Round stats: Hands / Discards */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {/* Hands */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(255, 68, 68, 0.08)",
            border: "2px solid var(--mult-red)",
            borderRadius: "6px",
            padding: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "9px", color: "var(--mult-red)", fontWeight: "bold" }}>HANDS</div>
            <div className="pixel-font" style={{ fontSize: "1.4rem", color: "white", marginTop: "4px" }}>
              {handsRemaining}
            </div>
          </div>

          {/* Discards */}
          <div style={{
            flex: 1,
            backgroundColor: "rgba(74, 158, 255, 0.08)",
            border: "2px solid var(--chip-blue)",
            borderRadius: "6px",
            padding: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "9px", color: "var(--chip-blue)", fontWeight: "bold" }}>DISCARDS</div>
            <div className="pixel-font" style={{ fontSize: "1.4rem", color: "white", marginTop: "4px" }}>
              {discardsRemaining}
            </div>
          </div>
        </div>

        {/* Money Box */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b15 0%, #2c2514 100%)",
          border: "2px solid var(--money-yellow)",
          borderRadius: "6px",
          padding: "10px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "10px", color: "var(--money-yellow)", fontWeight: "bold" }}>CASH</span>
          <span className="pixel-font" style={{ fontSize: "1.2rem", color: "var(--money-yellow)" }}>
            ${money}
          </span>
        </div>
      </div>

      {/* Ante & Boss Blind Details */}
      <div style={{
        borderTop: "2px dashed var(--panel-border)",
        paddingTop: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px" }}>
          <span style={{ color: "var(--text-muted)" }}>ANTE</span>
          <span className="pixel-font" style={{ color: "white" }}>{ante} / 3</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "15px" }}>
          <span style={{ color: "var(--text-muted)" }}>BLIND</span>
          <span className="pixel-font" style={{ color: "var(--accent-gold)", fontSize: "9px" }}>
            {blindType.toUpperCase()}
          </span>
        </div>

        {/* Boss Blind Info Card */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "6px",
          padding: "10px"
        }}>
          <div style={{ fontSize: "8px", color: "var(--text-muted)", marginBottom: "6px" }}>
            ACTIVE ANTE BOSS
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
            <span style={{ fontSize: "1.2rem" }}>👹</span>
            <span style={{ fontWeight: "bold", fontSize: "11px", color: "var(--mult-red)" }}>
              {bossBlind}
            </span>
          </div>
          <p style={{ fontSize: "9px", color: "var(--text-light)", lineHeight: "1.3" }}>
            {bossBlind === "The Hook" && "Discards 2 random cards after playing a hand."}
            {bossBlind === "The Wall" && "Target score is doubled (4x ante base)."}
            {bossBlind === "The Flint" && "Base Chips and Mult are cut in half."}
            {bossBlind === "The Mark" && "All face cards (J, Q, K) are drawn face-down."}
            {bossBlind === "The Plant" && "All face cards are debuffed (cannot score)."}
            {bossBlind === "The Needle" && "Only 1 hand allowed this round."}
          </p>
        </div>
      </div>
    </div>
  );
}
