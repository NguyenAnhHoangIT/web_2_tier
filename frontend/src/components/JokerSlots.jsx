import React, { useState } from "react";

export default function JokerSlots({ jokers, onReorder, onSell, phase }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Create new order indices list
    const newOrder = Array.from({ length: jokers.length }, (_, i) => i);
    // Move dragged element to target element index
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, moved);

    onReorder(newOrder);
    setDraggedIndex(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-pixel)", color: "var(--text-muted)" }}>
          Jokers ({jokers.length}/5)
        </span>
        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
          Drag to rearrange order!
        </span>
      </div>

      <div className="jokers-tray">
        {Array.from({ length: 5 }).map((_, index) => {
          const joker = jokers[index];

          if (!joker) {
            return (
              <div 
                key={`empty-joker-${index}`}
                style={{
                  width: "95px",
                  height: "135px",
                  border: "2px dashed rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.05)"
                }}
              />
            );
          }

          // Format description dynamically based on state
          let finalDesc = joker.description;
          if (joker.name === "Ice Cream" && joker.state) {
            finalDesc = `Current: +${joker.state.chips} Chips. Loses 5 Chips per hand played.`;
          } else if (joker.name === "Ride the Bus" && joker.state) {
            finalDesc = `Current: +${joker.state.mult} Mult. Adds +1 Mult per consecutive hand without face cards.`;
          } else if (joker.name === "Supernova" && joker.state) {
            finalDesc = `Adds Mult equal to the number of times this poker hand type has been played.`;
          }

          const sellValue = Math.max(1, Math.floor(joker.cost / 2));

          return (
            <div
              key={joker.name + "-" + index}
              className={`joker-card joker-rarity-${joker.rarity}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              style={{
                opacity: draggedIndex === index ? 0.4 : 1,
                cursor: "grab"
              }}
            >
              {/* Rarity Tag */}
              <span style={{ 
                fontSize: "7px", 
                alignSelf: "flex-start", 
                background: joker.rarity === "Rare" ? "var(--mult-red)" : joker.rarity === "Uncommon" ? "var(--chip-blue)" : "#7f8c8d", 
                padding: "2px 4px", 
                borderRadius: "3px",
                color: "white",
                fontWeight: "bold"
              }}>
                {joker.rarity}
              </span>

              {/* Joker Face Emoji & Name */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "1.8rem" }}>🃏</span>
                <span style={{ 
                  fontSize: "8px", 
                  textAlign: "center", 
                  fontWeight: "bold",
                  fontFamily: "var(--font-pixel)",
                  color: "white",
                  lineHeight: "1.2"
                }}>
                  {joker.name}
                </span>
              </div>

              {/* Sell button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSell(index);
                }}
                style={{
                  background: "rgba(231, 76, 60, 0.25)",
                  border: "1px solid var(--mult-red)",
                  color: "var(--mult-red)",
                  fontSize: "8px",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center",
                  marginTop: "4px"
                }}
                title="Sell this Joker for cash"
              >
                Sell ${sellValue}
              </button>

              {/* Hover Tooltip */}
              <div className="joker-tooltip">
                <div style={{ fontWeight: "bold", color: "var(--accent-gold)", marginBottom: "4px" }}>
                  {joker.name}
                </div>
                <div style={{ fontSize: "0.7rem" }}>{finalDesc}</div>
                <div style={{ marginTop: "6px", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  Rarity: {joker.rarity} | Cost: ${joker.cost}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
