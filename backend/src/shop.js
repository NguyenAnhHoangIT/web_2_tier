import { JOKERS, createJoker } from "./jokers.js";

// Pool of Planet cards
export const PLANETS = [
  { name: "Pluto", type: "Planet", upgrades: "High Card", cost: 3, description: "Upgrade High Card (+10 Chips, +1 Mult)" },
  { name: "Mercury", type: "Planet", upgrades: "Pair", cost: 3, description: "Upgrade Pair (+15 Chips, +1 Mult)" },
  { name: "Uranus", type: "Planet", upgrades: "Two Pair", cost: 3, description: "Upgrade Two Pair (+20 Chips, +2 Mult)" },
  { name: "Venus", type: "Planet", upgrades: "Three of a Kind", cost: 3, description: "Upgrade Three of a Kind (+20 Chips, +2 Mult)" },
  { name: "Saturn", type: "Planet", upgrades: "Straight", cost: 3, description: "Upgrade Straight (+30 Chips, +3 Mult)" },
  { name: "Jupiter", type: "Planet", upgrades: "Flush", cost: 3, description: "Upgrade Flush (+15 Chips, +2 Mult)" },
  { name: "Earth", type: "Planet", upgrades: "Full House", cost: 3, description: "Upgrade Full House (+25 Chips, +2 Mult)" },
  { name: "Mars", type: "Planet", upgrades: "Four of a Kind", cost: 3, description: "Upgrade Four of a Kind (+30 Chips, +3 Mult)" },
  { name: "Neptune", type: "Planet", upgrades: "Straight Flush", cost: 3, description: "Upgrade Straight Flush (+40 Chips, +4 Mult)" }
];

// Pool of Tarot cards
export const TAROTS = [
  { name: "The Fool", type: "Tarot", cost: 3, description: "Creates a copy of the last used Tarot or Planet card" },
  { name: "The Magician", type: "Tarot", cost: 3, description: "Enhances 1 selected card in hand to Lucky (1/5 chance +20 Mult, 1/15 chance +$20)" },
  { name: "The Empress", type: "Tarot", cost: 3, description: "Enhances up to 2 selected cards in hand to Mult cards (+4 Mult when scored)" },
  { name: "The Chariot", type: "Tarot", cost: 3, description: "Enhances 1 selected card in hand to Steel (+50 Chips when held in hand)" },
  { name: "Strength", type: "Tarot", cost: 3, description: "Increases rank of up to 2 selected cards by 1 (e.g. 7 becomes 8, King becomes Ace)" },
  { name: "The Hanged Man", type: "Tarot", cost: 3, description: "Destroys up to 2 selected cards from your hand permanently" }
];

/**
 * Generates items for the shop inventory.
 * Contains 2 Jokers and 1 Consumable (Planet or Tarot).
 * 
 * @returns {Object} Shop inventory { jokers: Array, consumable: Object }
 */
export function generateShopInventory() {
  const shopJokers = [];
  
  // Pick 2 random Jokers (duplicates allowed, just like Balatro)
  for (let i = 0; i < 2; i++) {
    const randomJokerTemplate = JOKERS[Math.floor(Math.random() * JOKERS.length)];
    // Instantiate it so it has its own state if needed
    shopJokers.push(createJoker(randomJokerTemplate.name));
  }

  // Pick 1 random Consumable (50% Planet, 50% Tarot)
  let shopConsumable = null;
  if (Math.random() < 0.5) {
    const template = PLANETS[Math.floor(Math.random() * PLANETS.length)];
    shopConsumable = { ...template };
  } else {
    const template = TAROTS[Math.floor(Math.random() * TAROTS.length)];
    shopConsumable = { ...template };
  }

  return {
    jokers: shopJokers,
    consumable: shopConsumable
  };
}

/**
 * Calculates interest and blind completion payout when entering the shop.
 * Mutates the session state and populates round earnings details.
 * 
 * @param {Object} state - Game session state
 */
export function calculateEndRoundPayout(state) {
  state.roundEarnings = [];

  // 1. Payout from completing the blind
  let blindPayout = 3;
  if (state.blindType === "Big") blindPayout = 4;
  if (state.blindType === "Boss") blindPayout = 5;
  
  // Apply Ante scaling if we want (e.g. +$1 per ante)
  const anteBonus = state.ante - 1;
  const totalBlindPayout = blindPayout + anteBonus;

  state.money += totalBlindPayout;
  state.roundEarnings.push({ source: `${state.blindType} Blind Reward`, amount: totalBlindPayout });

  // 2. Interest payment ($1 per $5, max $5)
  const interest = Math.min(5, Math.floor(state.money / 5));
  if (interest > 0) {
    state.money += interest;
    state.roundEarnings.push({ source: "Interest ($1 per $5 held)", amount: interest });
  }

  // 3. Trigger end-of-round Joker effects (like Golden Joker)
  const jokers = state.jokers || [];
  for (const joker of jokers) {
    if (joker.name === "Golden Joker") {
      state.money += 4;
      state.roundEarnings.push({ source: "Golden Joker", amount: 4 });
    }
  }

  // Reset reroll cost to base $5
  state.rerollCost = 5;
}
