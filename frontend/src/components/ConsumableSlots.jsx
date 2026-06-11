import React from "react";

export default function ConsumableSlots({ consumables, selectedCardIds, onUse, onSell }) {
  
  const getUsageValidation = (consumable) => {
    if (consumable.type === "Planet") {
      return { valid: true, message: "Use Upgrade" };
    }

    const selectedCount = selectedCardIds.length;

    switch (consumable.name) {
      case "The Fool":
        return { valid: true, message: "Use Copy" };

      case "The Magician":
      case "The Chariot":
        if (selectedCount === 1) {
          return { valid: true, message: "Enhance Card" };
        }
        return { valid: false, message: "Select 1 Card" };

      case "The Empress":
      case "Strength":
      case "The Hanged Man":
        if (selectedCount >= 1 && selectedCount <= 2) {
          const verb = consumable.name === "The Hanged Man" ? "Destroy" : consumable.name === "Strength" ? "Upgrade" : "Enhance";
          return { valid: true, message: `${verb} (${selectedCount})` };
        }
        return { valid: false, message: "Select 1-2 Cards" };

      default:
        return { valid: false, message: "Unknown" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-pixel)", color: "var(--text-muted)" }}>
        Consumables ({consumables.length}/2)
      </span>

      <div style={{ display: "flex", gap: "10px" }}>
        {Array.from({ length: 2 }).map((_, index) => {
          const consumable = consumables[index];

          if (!consumable) {
            return (
              <div
                key={`empty-consumable-${index}`}
                style={{
                  width: "115px",
                  height: "85px",
                  border: "2px dashed rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.05)"
                }}
              />
            );
          }

          const { valid, message } = getUsageValidation(consumable);
          const borderStyle = consumable.type === "Planet" 
            ? "2px solid #2980b9" // Blue for planets
            : "2px solid #8e44ad"; // Purple for tarots

          return (
            <div
              key={consumable.name + "-" + index}
              style={{
                width: "115px",
                height: "85px",
                background: "linear-gradient(145deg, #1b263b, #0d1b2a)",
                border: borderStyle,
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "6px",
                fontSize: "10px",
                position: "relative"
              }}
            >
              {/* Type Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7px", color: "var(--text-muted)" }}>
                <span>{consumable.type}</span>
                <span 
                  onClick={() => onSell(index)}
                  style={{ color: "var(--mult-red)", cursor: "pointer", fontWeight: "bold" }}
                  title="Sell for $1"
                >
                  Sell $1
                </span>
              </div>

              {/* Card Name */}
              <div style={{ fontWeight: "bold", color: "white", fontSize: "9px", textAlign: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {consumable.name}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onUse(index, selectedCardIds)}
                disabled={!valid}
                style={{
                  background: valid ? "linear-gradient(to bottom, #2ecc71, #27ae60)" : "#7f8c8d",
                  color: "white",
                  border: "none",
                  fontSize: "8px",
                  padding: "4px 2px",
                  borderRadius: "3px",
                  cursor: valid ? "pointer" : "not-allowed",
                  fontWeight: "bold"
                }}
              >
                {message}
              </button>

              {/* Mini Tooltip overlay on hover */}
              <div 
                style={{
                  display: "none",
                  position: "absolute",
                  bottom: "95px",
                  left: "-10px",
                  width: "135px",
                  backgroundColor: "#000",
                  border: "1px solid #777",
                  padding: "6px",
                  borderRadius: "4px",
                  zIndex: 200,
                  fontSize: "8px",
                  color: "#ddd",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.5)"
                }}
                className="consumable-hover-tooltip"
              >
                {consumable.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple styling to toggle tooltip */}
      <style>{`
        div[key*="consumable-"]:hover .consumable-hover-tooltip {
          display: block !important;
        }
      `}</style>
    </div>
  );
}
