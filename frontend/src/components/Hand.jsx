import React from "react";
import Card from "./Card";

export default function Hand({ cards, selectedCardIds, onCardClick }) {
  if (!cards || cards.length === 0) {
    return (
      <div style={{ textAlign: "center", fontStyle: "italic", opacity: 0.5, padding: "20px" }}>
        No cards in hand.
      </div>
    );
  }

  const N = cards.length;
  const mid = (N - 1) / 2;
  const angleStep = 3.5; // Rotate slightly for fan effect
  const yOffsetStep = 2.5; // Arch downwards from center
  const xOffsetStep = 6;   // Arch outwards from center

  return (
    <div className="hand-container">
      {cards.map((card, index) => {
        const selected = selectedCardIds.includes(card.id);
        
        // Calculate curved fan layout styles
        const diff = index - mid;
        const rotate = diff * angleStep;
        
        // Selected cards lift up, overriding the curved arch translation
        const translateY = selected 
          ? -25 
          : Math.abs(diff) * yOffsetStep;
          
        const translateX = diff * xOffsetStep;

        const cardStyle = {
          transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
          zIndex: index
        };

        return (
          <Card
            key={card.id}
            card={card}
            selected={selected}
            onClick={() => onCardClick(card.id)}
            style={cardStyle}
          />
        );
      })}
    </div>
  );
}
