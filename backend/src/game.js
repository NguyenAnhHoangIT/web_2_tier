import { v4 as uuidv4 } from "uuid";
import { evaluateHand } from "./hands.js";
import { calculateScore } from "./scoring.js";
import { JOKERS, createJoker } from "./jokers.js";
import { BOSSES, getBoss } from "./bosses.js";
import { PLANETS, TAROTS, generateShopInventory, calculateEndRoundPayout } from "./shop.js";

// Helper to shuffle a deck
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Creates a standard 52-card deck
 * Each card: { id, rank, suit, enhancement: null, debuffed: false, faceDown: false }
 */
function createDeck() {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = ["S", "H", "D", "C"]; // Spades, Hearts, Diamonds, Clubs
  const deck = [];
  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push({
        id: uuidv4(),
        rank,
        suit,
        enhancement: null,
        debuffed: false,
        faceDown: false
      });
    }
  }
  return deck;
}

// Target scores base for each Ante
export const ANTE_BASE_SCORES = {
  1: 300,
  2: 800,
  3: 2000
};

/**
 * Calculates target score for a specific Ante and Blind type
 */
export function getTargetScore(ante, blindType, bossBlindName) {
  const base = ANTE_BASE_SCORES[ante] || (2000 * Math.pow(2.5, ante - 3));
  let multiplier = 1.0;
  if (blindType === "Big") multiplier = 1.5;
  if (blindType === "Boss") {
    multiplier = 2.0;
    // Check if the boss is The Wall which doubles the target
    if (bossBlindName === "The Wall") {
      const boss = getBoss("The Wall");
      if (boss && boss.applyTargetScore) {
        multiplier = boss.applyTargetScore(multiplier);
      }
    }
  }
  return Math.floor(base * multiplier);
}

/**
 * Picks a random boss blind from the pool
 */
function pickRandomBossBlind() {
  return BOSSES[Math.floor(Math.random() * BOSSES.length)].name;
}

/**
 * Initializes a new run inside the session state.
 */
export function startNewGame(state) {
  state.ante = 1;
  state.blindType = "Small";
  state.bossBlind = pickRandomBossBlind();
  state.money = 6;
  state.jokers = [];
  state.consumables = [];
  state.handLevels = {
    "High Card": 1,
    "Pair": 1,
    "Two Pair": 1,
    "Three of a Kind": 1,
    "Straight": 1,
    "Flush": 1,
    "Full House": 1,
    "Four of a Kind": 1,
    "Straight Flush": 1,
    "Royal Flush": 1
  };
  state.handHistory = {};
  state.phase = "Play";
  state.score = 0;
  state.targetScore = getTargetScore(1, "Small", state.bossBlind);
  state.deck = createDeck();
  shuffle(state.deck);
  state.hand = [];
  state.discardedHistory = [];
  state.lastUsedConsumable = null;
  state.rerollCost = 5;

  startRound(state);
}

/**
 * Starts a new round (deals cards, resets hands/discards, resets debuffs).
 */
export function startRound(state) {
  state.score = 0;
  state.handsRemaining = 4;
  state.discardsRemaining = 3;
  state.discardedHistory = [];
  
  // Re-collect hand into deck, reset debuffs & facedown properties
  const allCards = [...state.deck, ...state.hand];
  for (const card of allCards) {
    card.debuffed = false;
    card.faceDown = false;
  }
  state.deck = allCards;
  state.hand = [];
  shuffle(state.deck);

  // Apply boss blind starting hooks
  if (state.blindType === "Boss" && state.bossBlind) {
    const boss = getBoss(state.bossBlind);
    if (boss && boss.applyStartRound) {
      boss.applyStartRound(state);
    }
  }

  // Draw initial hand of 8
  drawCards(state, 8);
  state.phase = "Play";
}

/**
 * Draws cards from deck to hand up to handSize
 */
export function drawCards(state, count) {
  const drawCount = Math.min(count, state.deck.length);
  for (let i = 0; i < drawCount; i++) {
    const card = state.deck.pop();
    
    // Apply Boss Blind draw hooks (like face cards being faceDown or debuffed)
    if (state.blindType === "Boss" && state.bossBlind) {
      const boss = getBoss(state.bossBlind);
      if (boss) {
        if (boss.onDrawCard) boss.onDrawCard(card);
        if (boss.applyStartRound) {
          // Double check in case we draw face cards
          if (["J", "Q", "K"].includes(card.rank)) {
            if (boss.name === "The Mark") card.faceDown = true;
            if (boss.name === "The Plant") card.debuffed = true;
          }
        }
      }
    }
    
    state.hand.push(card);
  }
}

/**
 * Plays the selected cards. Evaluates, scores, updates state, draws replacements.
 */
export function playHand(state, cardIds) {
  if (state.phase !== "Play") {
    throw new Error("Cannot play hand. Game is not in play phase.");
  }
  if (!cardIds || cardIds.length < 1 || cardIds.length > 5) {
    throw new Error("Must play between 1 and 5 cards.");
  }

  // Find cards in hand
  const playedCards = [];
  for (const id of cardIds) {
    const cardIndex = state.hand.findIndex(c => c.id === id);
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${id} not found in hand.`);
    }
    // Remove from hand temporarily
    const [card] = state.hand.splice(cardIndex, 1);
    // If it was face down, reveal it when played
    card.faceDown = false;
    playedCards.push(card);
  }

  // Deduct a hand
  state.handsRemaining--;

  // Calculate score
  const scoringResult = calculateScore(playedCards, state);
  const { handType, totalScore, scoringCards } = scoringResult;

  // Add to score
  state.score += totalScore;

  // Update hand play count history
  state.handHistory[handType] = (state.handHistory[handType] || 0) + 1;

  // Move played cards to discard history
  state.discardedHistory.push(...playedCards);

  // Trigger Joker onHandPlayed hooks
  for (const joker of state.jokers) {
    const actualJoker = JOKERS.find(j => j.name === joker.name);
    if (actualJoker && actualJoker.onHandPlayed) {
      actualJoker.onHandPlayed(joker.state, { scoringCards, handType });
    }
  }

  // Trigger Boss Blind hand played hook (e.g. The Hook discards 2 cards)
  if (state.blindType === "Boss" && state.bossBlind) {
    const boss = getBoss(state.bossBlind);
    if (boss && boss.onHandPlayed) {
      boss.onHandPlayed(state);
    }
  }

  // Draw cards back up to 8
  const cardsNeeded = 8 - state.hand.length;
  drawCards(state, cardsNeeded);

  // Check win/loss conditions
  if (state.score >= state.targetScore) {
    // Round Won! Proceed to shop.
    state.phase = "Shop";
    calculateEndRoundPayout(state);
    state.shopInventory = generateShopInventory();
  } else if (state.handsRemaining <= 0) {
    // Out of hands and target not met
    state.phase = "GameOver";
  }

  return scoringResult;
}

/**
 * Discards selected cards and draws replacements.
 */
export function discardCards(state, cardIds) {
  if (state.phase !== "Play") {
    throw new Error("Cannot discard. Game is not in play phase.");
  }
  if (state.discardsRemaining <= 0) {
    throw new Error("No discards remaining.");
  }
  if (!cardIds || cardIds.length < 1 || cardIds.length > 5) {
    throw new Error("Must discard between 1 and 5 cards.");
  }

  // Remove cards from hand and add to discarded history
  const discarded = [];
  for (const id of cardIds) {
    const cardIndex = state.hand.findIndex(c => c.id === id);
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${id} not found in hand.`);
    }
    const [card] = state.hand.splice(cardIndex, 1);
    card.faceDown = false; // Reveal on discard
    discarded.push(card);
  }

  state.discardsRemaining--;
  state.discardedHistory.push(...discarded);

  // Draw replacements back up to 8
  const cardsNeeded = 8 - state.hand.length;
  drawCards(state, cardsNeeded);
}

/**
 * Uses a consumable Tarot or Planet card.
 */
export function useConsumable(state, index, targetCardIds = []) {
  if (index < 0 || index >= state.consumables.length) {
    throw new Error("Invalid consumable index.");
  }

  const consumable = state.consumables[index];

  if (consumable.type === "Planet") {
    // Upgrade hand level
    const hand = consumable.upgrades;
    state.handLevels[hand] = (state.handLevels[hand] || 1) + 1;
    
    // Remove from inventory
    state.consumables.splice(index, 1);
    // Track for The Fool
    state.lastUsedConsumable = { ...consumable };
    return { success: true, message: `Upgraded ${hand} to level ${state.handLevels[hand]}!` };
  } 
  
  if (consumable.type === "Tarot") {
    // Validate target cards if required
    const targets = [];
    if (["The Magician", "The Empress", "The Chariot", "Strength", "The Hanged Man"].includes(consumable.name)) {
      if (!targetCardIds || targetCardIds.length === 0) {
        throw new Error("This Tarot card requires selecting target cards in hand.");
      }
      
      const maxTargets = ["The Empress", "Strength", "The Hanged Man"].includes(consumable.name) ? 2 : 1;
      if (targetCardIds.length > maxTargets) {
        throw new Error(`Select at most ${maxTargets} target card(s) for this Tarot.`);
      }

      for (const id of targetCardIds) {
        const card = state.hand.find(c => c.id === id);
        if (!card) {
          throw new Error(`Card with ID ${id} not found in hand.`);
        }
        targets.push(card);
      }
    }

    let message = "";
    switch (consumable.name) {
      case "The Fool":
        if (!state.lastUsedConsumable) {
          throw new Error("No previous consumable to copy.");
        }
        if (state.consumables.length >= 2) {
          throw new Error("No room for copied consumable.");
        }
        state.consumables.push({ ...state.lastUsedConsumable });
        message = `Created a copy of ${state.lastUsedConsumable.name}!`;
        break;

      case "The Magician":
        targets[0].enhancement = "Lucky";
        message = `Enhanced ${targets[0].rank}${targets[0].suit} to Lucky card!`;
        break;

      case "The Empress":
        for (const card of targets) {
          card.enhancement = "Mult";
        }
        message = `Enhanced ${targets.map(c => `${c.rank}${c.suit}`).join(", ")} to Mult card(s)!`;
        break;

      case "The Chariot":
        targets[0].enhancement = "Steel";
        message = `Enhanced ${targets[0].rank}${targets[0].suit} to Steel card!`;
        break;

      case "Strength":
        const rankSeq = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        for (const card of targets) {
          const rankIdx = rankSeq.indexOf(card.rank);
          if (rankIdx !== -1 && card.rank !== "A") {
            card.rank = rankSeq[rankIdx + 1];
          }
        }
        message = `Increased rank of selected cards!`;
        break;

      case "The Hanged Man":
        // Destroy target cards (remove from hand permanently, don't put in discards)
        for (const card of targets) {
          const idx = state.hand.findIndex(c => c.id === card.id);
          state.hand.splice(idx, 1);
        }
        // Draw replacements up to 8
        drawCards(state, 8 - state.hand.length);
        message = `Destroyed selected cards permanently!`;
        break;

      default:
        throw new Error(`Unknown Tarot card: ${consumable.name}`);
    }

    // Remove from inventory
    state.consumables.splice(index, 1);
    // Track for The Fool (unless we just played The Fool)
    if (consumable.name !== "The Fool") {
      state.lastUsedConsumable = { ...consumable };
    }
    return { success: true, message };
  }

  throw new Error("Unknown consumable type.");
}

/**
 * Buys an item from the current shop inventory.
 */
export function buyShopItem(state, itemType, itemIndex) {
  if (state.phase !== "Shop") {
    throw new Error("Shop is not active.");
  }
  if (!state.shopInventory) {
    throw new Error("No shop inventory generated.");
  }

  if (itemType === "Joker") {
    if (itemIndex < 0 || itemIndex >= state.shopInventory.jokers.length) {
      throw new Error("Invalid Joker index in shop.");
    }
    const joker = state.shopInventory.jokers[itemIndex];
    if (!joker) {
      throw new Error("Joker already purchased or unavailable.");
    }
    if (state.money < joker.cost) {
      throw new Error("Not enough money.");
    }
    if (state.jokers.length >= 5) {
      throw new Error("Joker slots full (max 5).");
    }

    state.money -= joker.cost;
    state.jokers.push(joker);
    state.shopInventory.jokers[itemIndex] = null; // Clear item slot
  } else if (itemType === "Consumable") {
    const consumable = state.shopInventory.consumable;
    if (!consumable) {
      throw new Error("Consumable already purchased or unavailable.");
    }
    if (state.money < consumable.cost) {
      throw new Error("Not enough money.");
    }
    if (state.consumables.length >= 2) {
      throw new Error("Consumable slots full (max 2).");
    }

    state.money -= consumable.cost;
    state.consumables.push(consumable);
    state.shopInventory.consumable = null; // Clear item slot
  } else {
    throw new Error("Unknown shop item type.");
  }
}

/**
 * Sells a Joker or Consumable from the player's inventory.
 */
export function sellItem(state, itemType, itemIndex) {
  if (itemType === "Joker") {
    if (itemIndex < 0 || itemIndex >= state.jokers.length) {
      throw new Error("Invalid Joker index.");
    }
    const [joker] = state.jokers.splice(itemIndex, 1);
    const sellValue = Math.max(1, Math.floor(joker.cost / 2));
    state.money += sellValue;
  } else if (itemType === "Consumable") {
    if (itemIndex < 0 || itemIndex >= state.consumables.length) {
      throw new Error("Invalid consumable index.");
    }
    state.consumables.splice(itemIndex, 1);
    state.money += 1; // Tarots/Planets sell for $1
  } else {
    throw new Error("Unknown item type.");
  }
}

/**
 * Rerolls the shop inventory for the current reroll cost.
 */
export function rerollShop(state) {
  if (state.phase !== "Shop") {
    throw new Error("Shop is not active.");
  }
  if (state.money < state.rerollCost) {
    throw new Error("Not enough money to reroll.");
  }

  state.money -= state.rerollCost;
  state.rerollCost += 1; // Reroll cost increases by 1 each time
  state.shopInventory = generateShopInventory();
}

/**
 * Reorders the Jokers array (Joker trigger order is critical!).
 */
export function reorderJokers(state, newOrderIndices) {
  if (!newOrderIndices || newOrderIndices.length !== state.jokers.length) {
    throw new Error("Invalid reorder mapping.");
  }

  const reordered = [];
  for (const idx of newOrderIndices) {
    if (idx < 0 || idx >= state.jokers.length) {
      throw new Error("Index out of bounds.");
    }
    reordered.push(state.jokers[idx]);
  }
  state.jokers = reordered;
}

/**
 * Exits the shop and proceeds to the next blind / Ante.
 */
export function nextRound(state) {
  if (state.phase !== "Shop") {
    throw new Error("Cannot advance to next round. Not in shop phase.");
  }

  // Advance blind
  if (state.blindType === "Small") {
    state.blindType = "Big";
    state.targetScore = getTargetScore(state.ante, "Big", state.bossBlind);
    startRound(state);
  } else if (state.blindType === "Big") {
    state.blindType = "Boss";
    state.targetScore = getTargetScore(state.ante, "Boss", state.bossBlind);
    startRound(state);
  } else if (state.blindType === "Boss") {
    // Beat the boss! Advance Ante.
    if (state.ante >= 3) {
      // Victory!
      state.phase = "Victory";
    } else {
      state.ante++;
      state.blindType = "Small";
      state.bossBlind = pickRandomBossBlind(); // Pick new boss for next ante
      state.targetScore = getTargetScore(state.ante, "Small", state.bossBlind);
      startRound(state);
    }
  }
}
