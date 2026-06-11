import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createSession, getSession } from "./src/store.js";
import { 
  startNewGame, 
  playHand, 
  discardCards, 
  buyShopItem, 
  sellItem, 
  rerollShop, 
  reorderJokers, 
  useConsumable, 
  nextRound 
} from "./src/game.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Logger middleware for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware to load game session
const loadSession = (req, res, next) => {
  const { id } = req.params;
  const session = getSession(id);
  if (!session) {
    return res.status(404).json({ error: "Game session not found." });
  }
  req.gameSession = session;
  next();
};

// Start a new game run
app.post("/api/game/new", (req, res) => {
  try {
    const session = createSession();
    startNewGame(session);
    console.log(`Created new game session: ${session.id}`);
    res.json({ gameId: session.id, state: session });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ error: "Failed to initialize game." });
  }
});

// Get current game state
app.get("/api/game/:id", loadSession, (req, res) => {
  res.json({ state: req.gameSession });
});

// Play selected cards from hand
app.post("/api/game/:id/play", loadSession, (req, res) => {
  const { cardIds } = req.body;
  try {
    const scoringResult = playHand(req.gameSession, cardIds);
    res.json({ state: req.gameSession, scoringResult });
  } catch (error) {
    console.warn("Invalid play action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Discard selected cards from hand
app.post("/api/game/:id/discard", loadSession, (req, res) => {
  const { cardIds } = req.body;
  try {
    discardCards(req.gameSession, cardIds);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.warn("Invalid discard action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Buy an item from the shop (Joker or Consumable)
app.post("/api/game/:id/shop/buy", loadSession, (req, res) => {
  const { itemType, itemIndex } = req.body;
  try {
    buyShopItem(req.gameSession, itemType, itemIndex);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.warn("Invalid shop buy action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Sell an item from inventory (Joker or Consumable)
app.post("/api/game/:id/shop/sell", loadSession, (req, res) => {
  const { itemType, itemIndex } = req.body;
  try {
    sellItem(req.gameSession, itemType, itemIndex);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.warn("Invalid shop sell action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Reroll shop inventory
app.post("/api/game/:id/shop/reroll", loadSession, (req, res) => {
  try {
    rerollShop(req.gameSession);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.warn("Invalid reroll action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Leave shop and move to next round
app.post("/api/game/:id/shop/next", loadSession, (req, res) => {
  try {
    nextRound(req.gameSession);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.error("Error advancing round:", error);
    res.status(500).json({ error: "Failed to advance round." });
  }
});

// Reorder owned Jokers (drag-and-drop support)
app.post("/api/game/:id/jokers/reorder", loadSession, (req, res) => {
  const { newOrderIndices } = req.body;
  try {
    reorderJokers(req.gameSession, newOrderIndices);
    res.json({ state: req.gameSession });
  } catch (error) {
    console.warn("Invalid reorder action:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Use a consumable card (Planet upgrades / Tarot enhancements)
app.post("/api/game/:id/consumable/use", loadSession, (req, res) => {
  const { index, targetCardIds } = req.body;
  try {
    const result = useConsumable(req.gameSession, index, targetCardIds);
    res.json({ state: req.gameSession, message: result.message });
  } catch (error) {
    console.warn("Invalid consumable usage:", error.message);
    res.status(400).json({ error: error.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from frontend build in production
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));

// Fallback to index.html for React SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Balatro-Lite API Server running on port ${PORT}`);
  console.log(`===============================================`);
});
