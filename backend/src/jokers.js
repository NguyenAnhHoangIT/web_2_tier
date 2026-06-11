import { RANK_VALUES } from "./hands.js";

// List of all 15 available Jokers in the game
export const JOKERS = [
  // COMMON JOKERS
  {
    name: "Joker",
    rarity: "Common",
    cost: 4,
    emoji: "🃏",
    description: "+4 Mult",
    applyScoring: (context) => {
      context.mult += 4;
      context.breakdown.push({ source: "Joker", type: "mult", value: "+4", detail: "Flat +4 Mult" });
    }
  },
  {
    name: "Greedy Joker",
    rarity: "Common",
    cost: 5,
    emoji: "♦️",
    description: "Played ♦️ cards give +3 Mult when scored",
    applyScoring: (context) => {
      let count = 0;
      for (const card of context.scoringCards) {
        if (card.suit === "D" && !card.debuffed) {
          context.mult += 3;
          count++;
        }
      }
      if (count > 0) {
        context.breakdown.push({ 
          source: "Greedy Joker", 
          type: "mult", 
          value: `+${count * 3}`, 
          detail: `${count} Diamonds scored` 
        });
      }
    }
  },
  {
    name: "Lusty Joker",
    rarity: "Common",
    cost: 5,
    emoji: "♥️",
    description: "Played ♥️ cards give +3 Mult when scored",
    applyScoring: (context) => {
      let count = 0;
      for (const card of context.scoringCards) {
        if (card.suit === "H" && !card.debuffed) {
          context.mult += 3;
          count++;
        }
      }
      if (count > 0) {
        context.breakdown.push({ 
          source: "Lusty Joker", 
          type: "mult", 
          value: `+${count * 3}`, 
          detail: `${count} Hearts scored` 
        });
      }
    }
  },
  {
    name: "Wrathful Joker",
    rarity: "Common",
    cost: 5,
    emoji: "♠️",
    description: "Played ♠️ cards give +3 Mult when scored",
    applyScoring: (context) => {
      let count = 0;
      for (const card of context.scoringCards) {
        if (card.suit === "S" && !card.debuffed) {
          context.mult += 3;
          count++;
        }
      }
      if (count > 0) {
        context.breakdown.push({ 
          source: "Wrathful Joker", 
          type: "mult", 
          value: `+${count * 3}`, 
          detail: `${count} Spades scored` 
        });
      }
    }
  },
  {
    name: "Gluttonous Joker",
    rarity: "Common",
    cost: 5,
    emoji: "♣️",
    description: "Played ♣️ cards give +3 Mult when scored",
    applyScoring: (context) => {
      let count = 0;
      for (const card of context.scoringCards) {
        if (card.suit === "C" && !card.debuffed) {
          context.mult += 3;
          count++;
        }
      }
      if (count > 0) {
        context.breakdown.push({ 
          source: "Gluttonous Joker", 
          type: "mult", 
          value: `+${count * 3}`, 
          detail: `${count} Clubs scored` 
        });
      }
    }
  },
  {
    name: "Banner",
    rarity: "Common",
    cost: 5,
    emoji: "🚩",
    description: "+30 Chips per discard remaining",
    applyScoring: (context) => {
      const discards = context.discardsRemaining;
      if (discards > 0) {
        const bonus = discards * 30;
        context.chips += bonus;
        context.breakdown.push({ 
          source: "Banner", 
          type: "chips", 
          value: `+${bonus}`, 
          detail: `${discards} discards left` 
        });
      }
    }
  },
  {
    name: "Mystic Summit",
    rarity: "Common",
    cost: 5,
    emoji: "🏔️",
    description: "+15 Mult when 0 discards remaining",
    applyScoring: (context) => {
      if (context.discardsRemaining === 0) {
        context.mult += 15;
        context.breakdown.push({ 
          source: "Mystic Summit", 
          type: "mult", 
          value: "+15", 
          detail: "0 discards left" 
        });
      }
    }
  },
  {
    name: "Ice Cream",
    rarity: "Common",
    cost: 5,
    emoji: "🍦",
    description: "+100 Chips, loses -5 Chips for every hand played",
    state: { chips: 100 },
    applyScoring: (context, jokerState) => {
      const currentChips = jokerState ? jokerState.chips : 100;
      if (currentChips > 0) {
        context.chips += currentChips;
        context.breakdown.push({ 
          source: "Ice Cream", 
          type: "chips", 
          value: `+${currentChips}`, 
          detail: "Melting ice cream" 
        });
      }
    },
    onHandPlayed: (jokerState) => {
      if (jokerState) {
        jokerState.chips = Math.max(0, jokerState.chips - 5);
      }
    }
  },
  {
    name: "Golden Joker",
    rarity: "Common",
    cost: 6,
    emoji: "🪙",
    description: "Earn $4 at the end of each round",
    applyScoring: () => {}, // No scoring effect
    onRoundEnd: (gameSession) => {
      gameSession.money += 4;
      // We can push to round earnings summary
      gameSession.roundEarnings = gameSession.roundEarnings || [];
      gameSession.roundEarnings.push({ source: "Golden Joker", amount: 4 });
    }
  },

  // UNCOMMON JOKERS
  {
    name: "Steel Joker",
    rarity: "Uncommon",
    cost: 6,
    emoji: "🔩",
    description: "+20 Chips for each Steel card in your deck",
    applyScoring: (context) => {
      // Look at all cards in the deck that are enhanced with "Steel"
      let steelCount = 0;
      if (context.deck) {
        for (const card of context.deck) {
          if (card.enhancement === "Steel") {
            steelCount++;
          }
        }
      }
      if (steelCount > 0) {
        const bonus = steelCount * 20;
        context.chips += bonus;
        context.breakdown.push({ 
          source: "Steel Joker", 
          type: "chips", 
          value: `+${bonus}`, 
          detail: `${steelCount} Steel cards in deck` 
        });
      }
    }
  },
  {
    name: "Supernova",
    rarity: "Uncommon",
    cost: 6,
    emoji: "💥",
    description: "+1 Mult per time this poker hand has been played this run",
    applyScoring: (context) => {
      const playCount = context.handHistory[context.handType] || 0;
      if (playCount > 0) {
        context.mult += playCount;
        context.breakdown.push({ 
          source: "Supernova", 
          type: "mult", 
          value: `+${playCount}`, 
          detail: `${context.handType} played ${playCount} times` 
        });
      }
    }
  },
  {
    name: "Ride the Bus",
    rarity: "Uncommon",
    cost: 6,
    emoji: "🚌",
    description: "+1 Mult per consecutive hand played without scoring a Face card (J, Q, K)",
    state: { mult: 0 },
    applyScoring: (context, jokerState) => {
      const currentMult = jokerState ? jokerState.mult : 0;
      if (currentMult > 0) {
        context.mult += currentMult;
        context.breakdown.push({ 
          source: "Ride the Bus", 
          type: "mult", 
          value: `+${currentMult}`, 
          detail: `${currentMult} consecutive non-face hands` 
        });
      }
    },
    onHandPlayed: (jokerState, context) => {
      if (jokerState) {
        // Check if any scored (scoring) card was a Face card
        const hasFace = context.scoringCards.some(card => 
          ["J", "Q", "K"].includes(card.rank) && !card.debuffed
        );
        if (hasFace) {
          jokerState.mult = 0; // Reset
        } else {
          jokerState.mult += 1; // Increment
        }
      }
    }
  },

  // RARE JOKERS
  {
    name: "Blueprint",
    rarity: "Rare",
    cost: 8,
    emoji: "📐",
    description: "Copies the ability of the Joker to its right",
    applyScoring: () => {} // Handled specially in scoring logic
  },
  {
    name: "The Duo",
    rarity: "Rare",
    cost: 8,
    emoji: "👥",
    description: "x2 Mult if played hand contains a Pair",
    applyScoring: (context) => {
      // True if hand is Pair, Two Pair, Full House, Three of a Kind, Four of a Kind
      const containsPair = [
        "Pair", "Two Pair", "Full House", "Three of a Kind", "Four of a Kind"
      ].includes(context.handType);
      if (containsPair) {
        context.mult = context.mult * 2;
        context.breakdown.push({ 
          source: "The Duo", 
          type: "xmult", 
          value: "x2", 
          detail: `Hand has a Pair` 
        });
      }
    }
  },
  {
    name: "Baseball Card",
    rarity: "Rare",
    cost: 8,
    emoji: "⚾",
    description: "Uncommon Jokers each give x1.5 Mult",
    applyScoring: () => {} // Handled specially in scoring logic
  }
];

/**
 * Returns a deep copy of a Joker with its state initialized.
 * 
 * @param {string} name - Name of the Joker
 * @returns {Object} Joker instance
 */
export function createJoker(name) {
  const template = JOKERS.find(j => j.name === name);
  if (!template) return null;
  
  // Clone template and clone state if present
  const joker = { ...template };
  if (template.state) {
    joker.state = { ...template.state };
  }
  return joker;
}
