// Rank values for comparison and base scoring
export const RANK_VALUES = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  "J": 11, "Q": 12, "K": 13, "A": 14
};

// Base stats for each hand type at Level 1
export const BASE_HAND_STATS = {
  "Royal Flush": { chips: 100, mult: 8 },
  "Straight Flush": { chips: 100, mult: 8 },
  "Four of a Kind": { chips: 60, mult: 7 },
  "Full House": { chips: 40, mult: 4 },
  "Flush": { chips: 35, mult: 4 },
  "Straight": { chips: 30, mult: 4 },
  "Three of a Kind": { chips: 30, mult: 3 },
  "Two Pair": { chips: 20, mult: 2 },
  "Pair": { chips: 10, mult: 2 },
  "High Card": { chips: 5, mult: 1 }
};

/**
 * Evaluates a set of 1 to 5 cards and returns the highest poker hand type,
 * the cards that score, and their base level-1 stats.
 * 
 * @param {Array} cards - Array of card objects: { rank: string, suit: string, id: string }
 * @returns {Object} { handType: string, scoringCards: Array, baseChips: number, baseMult: number }
 */
export function evaluateHand(cards) {
  if (!cards || cards.length === 0) {
    return { handType: "High Card", scoringCards: [], baseChips: 0, baseMult: 0 };
  }

  // Sort cards descending by rank value
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const len = sortedCards.length;

  // Group cards by rank and suit to make checks easier
  const rankGroups = {};
  const suitGroups = {};
  for (const card of sortedCards) {
    rankGroups[card.rank] = rankGroups[card.rank] || [];
    rankGroups[card.rank].push(card);

    suitGroups[card.suit] = suitGroups[card.suit] || [];
    suitGroups[card.suit].push(card);
  }

  const rankCounts = Object.entries(rankGroups).map(([rank, list]) => ({ rank, count: list.length, cards: list }));
  rankCounts.sort((a, b) => b.count - a.count || RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  const suitCounts = Object.entries(suitGroups).map(([suit, list]) => ({ suit, count: list.length, cards: list }));

  const isFlush = len === 5 && suitCounts.length === 1;

  // Check for Straight
  let isStraight = false;
  let straightCards = [];
  if (len === 5) {
    // Standard straight check (e.g. A K Q J 10 down to 5 4 3 2 A)
    // Extract unique values sorted descending
    const vals = sortedCards.map(c => RANK_VALUES[c.rank]);
    
    // Check standard straight (consecutive differences of 1)
    let consecutive = true;
    for (let i = 0; i < len - 1; i++) {
      if (vals[i] - vals[i+1] !== 1) {
        consecutive = false;
        break;
      }
    }

    if (consecutive) {
      isStraight = true;
      straightCards = sortedCards;
    } else {
      // Ace-low straight check: Ace (14), 5 (5), 4 (4), 3 (3), 2 (2)
      // Check if vals match exactly [14, 5, 4, 3, 2]
      const isAceLow = vals[0] === 14 && vals[1] === 5 && vals[2] === 4 && vals[3] === 3 && vals[4] === 2;
      if (isAceLow) {
        isStraight = true;
        // In Ace-low, Ace is low card, but let's score it.
        straightCards = sortedCards;
      }
    }
  }

  // 1. Royal Flush / Straight Flush
  if (isFlush && isStraight) {
    // Check if Ace-high (Royal)
    const hasAce = sortedCards.some(c => c.rank === "A");
    const hasTen = sortedCards.some(c => c.rank === "10");
    if (hasAce && hasTen) {
      return {
        handType: "Royal Flush",
        scoringCards: sortedCards,
        ...BASE_HAND_STATS["Royal Flush"]
      };
    }
    return {
      handType: "Straight Flush",
      scoringCards: sortedCards,
      ...BASE_HAND_STATS["Straight Flush"]
    };
  }

  // 2. Four of a Kind
  if (rankCounts[0].count === 4) {
    return {
      handType: "Four of a Kind",
      scoringCards: rankCounts[0].cards,
      ...BASE_HAND_STATS["Four of a Kind"]
    };
  }

  // 3. Full House
  if (len === 5 && rankCounts[0].count === 3 && rankCounts[1] && rankCounts[1].count === 2) {
    return {
      handType: "Full House",
      scoringCards: sortedCards, // All 5 score in Full House
      ...BASE_HAND_STATS["Full House"]
    };
  }

  // 4. Flush
  if (isFlush) {
    return {
      handType: "Flush",
      scoringCards: sortedCards,
      ...BASE_HAND_STATS["Flush"]
    };
  }

  // 5. Straight
  if (isStraight) {
    return {
      handType: "Straight",
      scoringCards: straightCards,
      ...BASE_HAND_STATS["Straight"]
    };
  }

  // 6. Three of a Kind
  if (rankCounts[0].count === 3) {
    return {
      handType: "Three of a Kind",
      scoringCards: rankCounts[0].cards,
      ...BASE_HAND_STATS["Three of a Kind"]
    };
  }

  // 7. Two Pair
  if (rankCounts[0].count === 2 && rankCounts[1] && rankCounts[1].count === 2) {
    // The scoring cards are the two pairs (4 cards total)
    const pairCards = [...rankCounts[0].cards, ...rankCounts[1].cards];
    return {
      handType: "Two Pair",
      scoringCards: pairCards.sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]),
      ...BASE_HAND_STATS["Two Pair"]
    };
  }

  // 8. Pair
  if (rankCounts[0].count === 2) {
    return {
      handType: "Pair",
      scoringCards: rankCounts[0].cards,
      ...BASE_HAND_STATS["Pair"]
    };
  }

  // 9. High Card
  // Highest rank card scores
  return {
    handType: "High Card",
    scoringCards: [sortedCards[0]],
    ...BASE_HAND_STATS["High Card"]
  };
}
