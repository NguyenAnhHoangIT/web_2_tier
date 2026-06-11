import React, { useState, useEffect } from "react";
import TitleScreen from "./components/TitleScreen";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Hand from "./components/Hand";
import JokerSlots from "./components/JokerSlots";
import ConsumableSlots from "./components/ConsumableSlots";
import Shop from "./components/Shop";
import ScoreAnimation from "./components/ScoreAnimation";
import { api } from "./api";

export default function App() {
  const [gameId, setGameId] = useState(() => localStorage.getItem("balatro_lite_game_id"));
  const [state, setState] = useState(null);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [scoringResult, setScoringResult] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load game state on mount or when gameId changes
  useEffect(() => {
    if (gameId) {
      setIsLoading(true);
      api.getGameState(gameId)
        .then((res) => {
          setState(res.state);
          localStorage.setItem("balatro_lite_game_id", gameId);
        })
        .catch((err) => {
          console.error("Failed to restore game session:", err);
          handleQuit();
        })
        .finally(() => setIsLoading(false));
    } else {
      setState(null);
    }
  }, [gameId]);

  const triggerError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const triggerMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStartNewGame = async () => {
    try {
      setIsLoading(true);
      const res = await api.createNewGame();
      setGameId(res.gameId);
      setState(res.state);
      setSelectedCardIds([]);
      setScoringResult(null);
      localStorage.setItem("balatro_lite_game_id", res.gameId);
    } catch (err) {
      triggerError("Could not initialize game: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuit = () => {
    setGameId(null);
    setState(null);
    setSelectedCardIds([]);
    setScoringResult(null);
    localStorage.removeItem("balatro_lite_game_id");
  };

  const handleCardClick = (cardId) => {
    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        if (prev.length >= 5) {
          triggerError("You can select up to 5 cards only.");
          return prev;
        }
        return [...prev, cardId];
      }
    });
  };

  const handlePlayHand = async () => {
    if (selectedCardIds.length === 0) {
      triggerError("Select 1 to 5 cards to play.");
      return;
    }
    try {
      const res = await api.playHand(gameId, selectedCardIds);
      setState(res.state);
      setScoringResult(res.scoringResult);
      setSelectedCardIds([]);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleDiscard = async () => {
    if (selectedCardIds.length === 0) {
      triggerError("Select 1 to 5 cards to discard.");
      return;
    }
    try {
      const res = await api.discardCards(gameId, selectedCardIds);
      setState(res.state);
      setSelectedCardIds([]);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleBuyItem = async (itemType, itemIndex) => {
    try {
      const res = await api.buyShopItem(gameId, itemType, itemIndex);
      setState(res.state);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleSellItem = async (itemType, itemIndex) => {
    try {
      const res = await api.sellItem(gameId, itemType, itemIndex);
      setState(res.state);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleRerollShop = async () => {
    try {
      const res = await api.rerollShop(gameId);
      setState(res.state);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleNextRound = async () => {
    try {
      const res = await api.nextRound(gameId);
      setState(res.state);
      setSelectedCardIds([]);
      setScoringResult(null);
    } catch (err) {
      triggerError(err.message);
    }
  };

  const handleReorderJokers = async (newOrderIndices) => {
    try {
      // Optimistic state update for instant drag-and-drop feedback
      const originalJokers = [...state.jokers];
      const reordered = newOrderIndices.map((idx) => originalJokers[idx]);
      setState((prev) => ({ ...prev, jokers: reordered }));

      const res = await api.reorderJokers(gameId, newOrderIndices);
      setState(res.state);
    } catch (err) {
      triggerError("Reordering failed: " + err.message);
    }
  };

  const handleUseConsumable = async (index, targetCardIds) => {
    try {
      const res = await api.useConsumable(gameId, index, targetCardIds);
      setState(res.state);
      setSelectedCardIds([]);
      triggerMessage(res.message);
    } catch (err) {
      triggerError(err.message);
    }
  };

  if (!gameId || !state) {
    return <TitleScreen onStart={handleStartNewGame} />;
  }

  return (
    <div className="crt-container">
      {/* HUD overlay alert messages */}
      {error && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(231, 76, 60, 0.95)",
          border: "2px solid var(--mult-red)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          fontFamily: "var(--font-pixel)",
          fontSize: "10px",
          zIndex: 300,
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
        }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(46, 204, 113, 0.95)",
          border: "2px solid #27ae60",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          fontFamily: "var(--font-pixel)",
          fontSize: "10px",
          zIndex: 300,
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
        }}>
          🍀 {message}
        </div>
      )}

      {/* Tally Animation Panel */}
      {scoringResult && (
        <ScoreAnimation 
          scoringResult={scoringResult} 
          onClose={() => setScoringResult(null)} 
        />
      )}

      {/* Main game board */}
      <div className="game-layout">
        {/* Left Stats Section */}
        <Sidebar state={state} />

        {/* Right Play arena section */}
        <div className="felt-table">
          <TopBar state={state} />

          {/* Shop Phase overlay overlaying play area */}
          {state.phase === "Shop" && (
            <Shop
              state={state}
              onBuy={handleBuyItem}
              onReroll={handleRerollShop}
              onNextRound={handleNextRound}
            />
          )}

          {/* Game Over Screen */}
          {state.phase === "GameOver" && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(11, 17, 32, 0.95)",
              zIndex: 250,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "25px",
              fontFamily: "var(--font-pixel)"
            }}>
              <h1 style={{ color: "var(--mult-red)", fontSize: "2.5rem", textShadow: "3px 3px 0 black" }}>
                GAME OVER
              </h1>
              <p style={{ color: "white", fontSize: "12px", fontFamily: "var(--font-sans)" }}>
                You were defeated at Ante {state.ante} | Final Score: {state.score.toLocaleString()}
              </p>
              <div style={{ display: "flex", gap: "20px" }}>
                <button onClick={handleStartNewGame} className="action-btn">
                  PLAY AGAIN
                </button>
                <button onClick={handleQuit} className="action-btn discard-btn">
                  QUIT RUN
                </button>
              </div>
            </div>
          )}

          {/* Victory Screen */}
          {state.phase === "Victory" && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(11, 17, 32, 0.95)",
              zIndex: 250,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "25px",
              fontFamily: "var(--font-pixel)"
            }}>
              <h1 style={{ color: "var(--accent-gold)", fontSize: "2.8rem", textShadow: "3px 3px 0 black" }}>
                VICTORY!
              </h1>
              <p style={{ color: "white", fontSize: "12px", fontFamily: "var(--font-sans)" }}>
                You beat the 3rd Ante Boss! Congratulations!
              </p>
              <div style={{ display: "flex", gap: "20px" }}>
                <button onClick={handleStartNewGame} className="action-btn">
                  NEW RUN
                </button>
                <button onClick={handleQuit} className="action-btn discard-btn">
                  QUIT
                </button>
              </div>
            </div>
          )}

          {/* Play Board Area */}
          <div className="play-area">
            {/* Top row: Jokers & Consumables */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "25px", width: "100%" }}>
              <JokerSlots 
                jokers={state.jokers} 
                onReorder={handleReorderJokers} 
                onSell={(idx) => handleSellItem("Joker", idx)}
                phase={state.phase}
              />
              <ConsumableSlots 
                consumables={state.consumables} 
                selectedCardIds={selectedCardIds}
                onUse={handleUseConsumable}
                onSell={(idx) => handleSellItem("Consumable", idx)}
              />
            </div>

            {/* Middle row: Played cards highlight */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}>
              {selectedCardIds.length > 0 ? (
                <div style={{ fontSize: "10px", color: "var(--accent-gold)", fontFamily: "var(--font-pixel)" }}>
                  Selected: {selectedCardIds.length} / 5
                </div>
              ) : (
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-pixel)" }}>
                  Select cards to play or discard
                </div>
              )}
            </div>

            {/* Bottom row: Hand cards fan */}
            <div style={{ width: "100%" }}>
              <Hand 
                cards={state.hand} 
                selectedCardIds={selectedCardIds} 
                onCardClick={handleCardClick} 
              />

              {/* Action Buttons footer */}
              <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginTop: "15px" }}>
                <button 
                  onClick={handlePlayHand} 
                  disabled={selectedCardIds.length === 0}
                  className="action-btn"
                  style={{ width: "180px", height: "45px" }}
                >
                  PLAY HAND
                </button>
                <button 
                  onClick={handleDiscard} 
                  disabled={selectedCardIds.length === 0 || state.discardsRemaining <= 0}
                  className="action-btn discard-btn"
                  style={{ width: "180px", height: "45px" }}
                >
                  DISCARD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
