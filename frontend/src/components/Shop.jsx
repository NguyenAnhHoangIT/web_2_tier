import React from "react";

export default function Shop({ state, onBuy, onReroll, onNextRound }) {
  if (!state || state.phase !== "Shop") return null;

  const { shopInventory, money, rerollCost, roundEarnings, jokers, consumables } = state;
  const isJokersFull = jokers.length >= 5;
  const isConsumablesFull = consumables.length >= 2;

  return (
    <div className="shop-overlay">
      {/* Title */}
      <div 
        className="pixel-font" 
        style={{ 
          fontSize: "1.8rem", 
          color: "var(--accent-gold)", 
          textAlign: "center",
          textShadow: "3px 3px 0px #000, 0 0 15px rgba(240, 192, 64, 0.4)",
          marginBottom: "15px"
        }}
      >
        THE SHOP
      </div>

      {/* Round Earnings Summary Panel */}
      {roundEarnings && roundEarnings.length > 0 && (
        <div style={{
          maxWidth: "500px",
          width: "100%",
          alignSelf: "center",
          backgroundColor: "#080c16",
          border: "2px dashed var(--panel-border)",
          borderRadius: "6px",
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-pixel)", marginBottom: "4px" }}>
            ROUND COMPLETED EARNINGS:
          </div>
          {roundEarnings.map((earn, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "var(--font-sans)", color: "white" }}>
              <span>{earn.source}</span>
              <span style={{ color: "var(--money-yellow)", fontWeight: "bold" }}>+${earn.amount}</span>
            </div>
          ))}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "6px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            fontFamily: "var(--font-sans)",
            fontWeight: "bold",
            color: "var(--money-yellow)"
          }}>
            <span>Total Cash Now:</span>
            <span>${money}</span>
          </div>
        </div>
      )}

      {/* Shop shelves grid */}
      <div className="shop-grid">
        {/* Joker Slot 1 */}
        <div className="shop-item-box">
          <div className="pixel-font" style={{ fontSize: "8px", color: "var(--text-muted)" }}>JOKER SLOT</div>
          {shopInventory?.jokers?.[0] ? (
            <ShopItemCard 
              item={shopInventory.jokers[0]} 
              itemType="Joker" 
              itemIndex={0}
              playerMoney={money}
              disabled={isJokersFull || money < shopInventory.jokers[0].cost}
              disabledReason={isJokersFull ? "Slots full" : "Low cash"}
              onBuy={onBuy}
            />
          ) : (
            <div style={{ fontSize: "9px", color: "var(--text-muted)", margin: "auto" }}>SOLD OUT</div>
          )}
        </div>

        {/* Joker Slot 2 */}
        <div className="shop-item-box">
          <div className="pixel-font" style={{ fontSize: "8px", color: "var(--text-muted)" }}>JOKER SLOT</div>
          {shopInventory?.jokers?.[1] ? (
            <ShopItemCard 
              item={shopInventory.jokers[1]} 
              itemType="Joker" 
              itemIndex={1}
              playerMoney={money}
              disabled={isJokersFull || money < shopInventory.jokers[1].cost}
              disabledReason={isJokersFull ? "Slots full" : "Low cash"}
              onBuy={onBuy}
            />
          ) : (
            <div style={{ fontSize: "9px", color: "var(--text-muted)", margin: "auto" }}>SOLD OUT</div>
          )}
        </div>

        {/* Consumable Slot */}
        <div className="shop-item-box">
          <div className="pixel-font" style={{ fontSize: "8px", color: "var(--text-muted)" }}>CONSUMABLE</div>
          {shopInventory?.consumable ? (
            <ShopItemCard 
              item={shopInventory.consumable} 
              itemType="Consumable" 
              itemIndex={0}
              playerMoney={money}
              disabled={isConsumablesFull || money < shopInventory.consumable.cost}
              disabledReason={isConsumablesFull ? "Slots full" : "Low cash"}
              onBuy={onBuy}
            />
          ) : (
            <div style={{ fontSize: "9px", color: "var(--text-muted)", margin: "auto" }}>SOLD OUT</div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        gap: "40px",
        marginTop: "auto",
        borderTop: "3px double var(--panel-border)",
        paddingTop: "25px"
      }}>
        {/* Reroll Button */}
        <button
          onClick={onReroll}
          disabled={money < rerollCost}
          className="action-btn discard-btn"
          style={{ width: "220px", display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}
        >
          <span>REROLL SHOP</span>
          <span style={{ fontSize: "9px" }}>Cost: ${rerollCost}</span>
        </button>

        {/* Next Round Button */}
        <button
          onClick={onNextRound}
          className="action-btn"
          style={{ width: "240px", height: "45px" }}
        >
          NEXT BLIND →
        </button>
      </div>
    </div>
  );
}

// Inner helper component to render a shop item detail card
function ShopItemCard({ item, itemType, itemIndex, playerMoney, disabled, disabledReason, onBuy }) {
  const isJoker = itemType === "Joker";
  
  const cardColor = isJoker 
    ? item.rarity === "Rare" ? "var(--mult-red)" : item.rarity === "Uncommon" ? "var(--chip-blue)" : "#95a5a6"
    : item.type === "Planet" ? "#2980b9" : "#8e44ad";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      gap: "10px"
    }}>
      {/* Visual Item representation */}
      <div style={{
        width: "90px",
        height: isJoker ? "120px" : "70px",
        background: "linear-gradient(135deg, #161a25 0%, #0b0d13 100%)",
        border: `2px solid ${cardColor}`,
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.4)"
      }}>
        <span style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
          {isJoker ? "🃏" : item.type === "Planet" ? "🪐" : "🔮"}
        </span>
        <span style={{ 
          fontSize: "9px", 
          textAlign: "center", 
          fontWeight: "bold", 
          color: "white",
          lineHeight: "1.2"
        }}>
          {item.name}
        </span>
        {isJoker && (
          <span style={{ fontSize: "7px", color: cardColor, marginTop: "2px", fontWeight: "bold" }}>
            {item.rarity.toUpperCase()}
          </span>
        )}
      </div>

      {/* Description text */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        color: "var(--text-light)",
        minHeight: "45px",
        lineHeight: "1.4",
        padding: "0 10px"
      }}>
        {item.description}
      </p>

      {/* Buy Button */}
      <button
        onClick={() => onBuy(itemType, itemIndex)}
        disabled={disabled}
        style={{
          background: disabled 
            ? "rgba(100, 100, 100, 0.4)" 
            : "linear-gradient(to bottom, #f1c40f, #f39c12)",
          color: disabled ? "#7f8c8d" : "white",
          border: disabled ? "1px solid #7f8c8d" : "1px solid #d35400",
          fontFamily: "var(--font-pixel)",
          fontSize: "9px",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : "1px 2px 0px #b77a00",
          width: "120px",
          textAlign: "center"
        }}
      >
        {disabled ? `${disabledReason}` : `Buy $${item.cost}`}
      </button>
    </div>
  );
}
