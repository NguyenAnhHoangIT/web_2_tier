import React from "react";

export default function TitleScreen({ onStart }) {
  return (
    <div className="title-screen">
      <div>
        <h1 className="title-logo">
          BALATRO
        </h1>
        <h2 
          className="pixel-font" 
          style={{ 
            fontSize: "1.2rem", 
            color: "var(--accent-gold)", 
            textAlign: "center",
            marginTop: "10px",
            letterSpacing: "4px"
          }}
        >
          LITE
        </h2>
      </div>

      <div style={{
        maxWidth: "600px",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        border: "3px double var(--panel-border)",
        borderRadius: "8px",
        padding: "25px",
        color: "#cbd5e1",
        lineHeight: "1.6",
        textAlign: "center",
        fontSize: "12px",
        fontFamily: "var(--font-sans)"
      }}>
        <div 
          className="pixel-font"
          style={{ 
            fontSize: "10px", 
            color: "var(--accent-gold)", 
            marginBottom: "12px",
            textTransform: "uppercase" 
          }}
        >
          How to Play:
        </div>
        <p style={{ marginBottom: "10px" }}>
          🃏 Play poker hands (1-5 cards) to score points and beat the blind's target.
        </p>
        <p style={{ marginBottom: "10px" }}>
          🪐 Buy Planet cards in the shop to permanently level up your poker hand multipliers.
        </p>
        <p style={{ marginBottom: "10px" }}>
          🔮 Buy Tarot cards to enhance cards in your deck (Lucky, Steel, Mult, Bonus).
        </p>
        <p style={{ marginBottom: "15px" }}>
          🤡 Buy up to 5 Jokers and drag/rearrange them to optimize your multiplier order!
        </p>
        <div style={{ 
          fontSize: "10px", 
          fontFamily: "var(--font-pixel)",
          color: "var(--mult-red)",
          marginTop: "15px"
        }}>
          Defeat 3 Antes (9 Blinds) to Win!
        </div>
      </div>

      <button
        onClick={onStart}
        className="action-btn"
        style={{
          width: "250px",
          height: "50px",
          fontSize: "1rem"
        }}
      >
        START RUN
      </button>
    </div>
  );
}
