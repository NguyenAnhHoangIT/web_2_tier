export const BOSSES = [
  {
    name: "The Hook",
    emoji: "🪝",
    description: "Discards 2 random cards from hand after playing a hand",
    applyTargetScore: (score) => score,
    applyStartRound: (state) => {},
    applyScoring: (context) => {},
    onDrawCard: (card) => {},
    onHandPlayed: (state) => {
      // Discard 2 random cards from the player's hand, if they have any left.
      // Need to perform this in the game state.
      if (state.hand && state.hand.length > 0) {
        const discardsCount = Math.min(2, state.hand.length);
        const discardedList = [];
        for (let i = 0; i < discardsCount; i++) {
          const randomIndex = Math.floor(Math.random() * state.hand.length);
          const [card] = state.hand.splice(randomIndex, 1);
          discardedList.push(card);
        }
        state.discardedHistory = state.discardedHistory || [];
        state.discardedHistory.push(...discardedList);
      }
    }
  },
  {
    name: "The Wall",
    emoji: "🧱",
    description: "Target score is 4x instead of 2x",
    applyTargetScore: (score) => score * 2, // The base boss blind is already 2x, so we multiply by 2 to make it 4x
    applyStartRound: (state) => {},
    applyScoring: (context) => {},
    onDrawCard: (card) => {},
    onHandPlayed: (state) => {}
  },
  {
    name: "The Flint",
    emoji: "🔥",
    description: "Base Chips and base Mult are halved",
    applyTargetScore: (score) => score,
    applyStartRound: (state) => {},
    applyScoring: (context) => {
      context.chips = Math.max(1, Math.floor(context.chips / 2));
      context.mult = Math.max(1, Math.floor(context.mult / 2));
      context.breakdown.push({
        source: "The Flint",
        type: "both",
        value: "Halved",
        detail: "Base chips and mult cut in half"
      });
    },
    onDrawCard: (card) => {},
    onHandPlayed: (state) => {}
  },
  {
    name: "The Mark",
    emoji: "👁️",
    description: "All face cards (J, Q, K) are drawn face-down",
    applyTargetScore: (score) => score,
    applyStartRound: (state) => {
      // Apply to existing cards in hand
      for (const card of state.hand) {
        if (["J", "Q", "K"].includes(card.rank)) {
          card.faceDown = true;
        }
      }
    },
    applyScoring: (context) => {},
    onDrawCard: (card) => {
      if (["J", "Q", "K"].includes(card.rank)) {
        card.faceDown = true;
      }
    },
    onHandPlayed: (state) => {}
  },
  {
    name: "The Plant",
    emoji: "🌱",
    description: "All face cards (J, Q, K) are debuffed (don't score)",
    applyTargetScore: (score) => score,
    applyStartRound: (state) => {
      for (const card of state.hand) {
        if (["J", "Q", "K"].includes(card.rank)) {
          card.debuffed = true;
        }
      }
    },
    applyScoring: (context) => {},
    onDrawCard: (card) => {
      if (["J", "Q", "K"].includes(card.rank)) {
        card.debuffed = true;
      }
    },
    onHandPlayed: (state) => {}
  },
  {
    name: "The Needle",
    emoji: "🪡",
    description: "Only 1 hand allowed this round",
    applyTargetScore: (score) => score,
    applyStartRound: (state) => {
      state.handsRemaining = 1;
    },
    applyScoring: (context) => {},
    onDrawCard: (card) => {},
    onHandPlayed: (state) => {}
  }
];

export function getBoss(name) {
  return BOSSES.find(b => b.name === name) || null;
}
