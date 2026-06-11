import React from "react";

const SUIT_EMOJIS = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣"
};

const SUIT_NAMES = {
  S: "Spades",
  H: "Hearts",
  D: "Diamonds",
  C: "Clubs"
};

export default function Card({ card, selected, onClick, style }) {
  const { rank, suit, enhancement, debuffed, faceDown } = card;

  const isRed = suit === "H" || suit === "D";
  const suitEmoji = SUIT_EMOJIS[suit] || "";
  
  if (faceDown) {
    return (
      <div 
        className={`playing-card card-back ${selected ? "selected" : ""}`}
        onClick={onClick}
        style={style}
      >
        <div className="card-back-pattern">🃏</div>
      </div>
    );
  }

  const colorClass = isRed ? "card-red" : "card-black";
  const enhancementClass = enhancement ? `enhance-${enhancement}` : "";

  return (
    <div 
      className={`playing-card ${colorClass} ${enhancementClass} ${debuffed ? "debuffed" : ""} ${selected ? "selected" : ""}`}
      onClick={debuffed ? undefined : onClick}
      style={style}
      title={enhancement ? `${enhancement} Enhanced Card` : SUIT_NAMES[suit]}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
        <span>{rank}</span>
        <span>{suitEmoji}</span>
      </div>

      <div style={{ fontSize: "2.5rem", alignSelf: "center", transform: "translateY(-5px)" }}>
        {suitEmoji}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold", transform: "rotate(180deg)" }}>
        <span>{rank}</span>
        <span>{suitEmoji}</span>
      </div>
    </div>
  );
}
