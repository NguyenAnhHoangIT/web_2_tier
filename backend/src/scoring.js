import { evaluateHand, RANK_VALUES } from "./hands.js";
import { getBoss } from "./bosses.js";

// Planet upgrades mapping for each hand type
export const HAND_UPGRADE_VALUES = {
  "High Card": { chips: 10, mult: 1 },
  "Pair": { chips: 15, mult: 1 },
  "Two Pair": { chips: 20, mult: 2 },
  "Three of a Kind": { chips: 20, mult: 2 },
  "Straight": { chips: 30, mult: 3 },
  "Flush": { chips: 15, mult: 2 },
  "Full House": { chips: 25, mult: 2 },
  "Four of a Kind": { chips: 30, mult: 3 },
  "Straight Flush": { chips: 40, mult: 4 },
  "Royal Flush": { chips: 40, mult: 4 }
};

/**
 * Calculates the score of a played hand.
 * 
 * @param {Array} playedCards - Array of selected cards being played
 * @param {Object} gameSession - Current game session object
 * @returns {Object} Score details and animation breakdown
 */
export function calculateScore(playedCards, gameSession) {
  // 1. Evaluate the base poker hand
  const evaluation = evaluateHand(playedCards);
  const { handType, scoringCards, chips: baseChips, mult: baseMult } = evaluation;

  // 2. Adjust base chips & mult based on hand level
  const level = gameSession.handLevels[handType] || 1;
  const upgrade = HAND_UPGRADE_VALUES[handType] || { chips: 0, mult: 0 };
  
  const leveledChips = baseChips + (level - 1) * upgrade.chips;
  const leveledMult = baseMult + (level - 1) * upgrade.mult;

  // 3. Construct the scoring context
  const context = {
    handType,
    scoringCards: [...scoringCards],
    playedCards: [...playedCards],
    deck: gameSession.deck,
    discardsRemaining: gameSession.discardsRemaining,
    handHistory: gameSession.handHistory || {},
    chips: leveledChips,
    mult: leveledMult,
    breakdown: [
      { 
        source: handType, 
        type: "base", 
        chips: leveledChips, 
        mult: leveledMult, 
        detail: `Level ${level} base` 
      }
    ]
  };

  // 4. Apply Boss Blind modifications to base values (e.g. The Flint halves base values)
  if (gameSession.blindType === "Boss" && gameSession.bossBlind) {
    const boss = getBoss(gameSession.bossBlind);
    if (boss && boss.applyScoring) {
      boss.applyScoring(context);
    }
  }

  // 5. Score individual cards
  for (const card of context.scoringCards) {
    if (card.debuffed) {
      context.breakdown.push({
        source: `${card.rank}${card.suit}`,
        type: "debuff",
        value: "0",
        detail: "Debuffed card"
      });
      continue;
    }

    // Base card chip value
    let cardChips = RANK_VALUES[card.rank] || 0;
    // J, Q, K are 10. Ace is 11.
    if (["J", "Q", "K"].includes(card.rank)) cardChips = 10;
    if (card.rank === "A") cardChips = 11;

    context.chips += cardChips;
    context.breakdown.push({
      source: `${card.rank}${card.suit}`,
      type: "card-chips",
      value: `+${cardChips}`,
      detail: "Card rank value"
    });

    // Card Enhancements from Tarots
    if (card.enhancement === "Bonus") {
      context.chips += 30;
      context.breakdown.push({
        source: `${card.rank}${card.suit} (Bonus)`,
        type: "chips",
        value: "+30",
        detail: "Bonus enhancement"
      });
    } else if (card.enhancement === "Mult") {
      context.mult += 4;
      context.breakdown.push({
        source: `${card.rank}${card.suit} (Mult)`,
        type: "mult",
        value: "+4",
        detail: "Mult enhancement"
      });
    } else if (card.enhancement === "Lucky") {
      // 1 in 5 chance to get +20 Mult
      const rollsMult = Math.random() < 0.2;
      if (rollsMult) {
        context.mult += 20;
        context.breakdown.push({
          source: `${card.rank}${card.suit} (Lucky)`,
          type: "mult",
          value: "+20",
          detail: "Lucky trigger!"
        });
      }
      // 1 in 15 chance to get $20
      const rollsMoney = Math.random() < (1 / 15);
      if (rollsMoney) {
        gameSession.money += 20;
        context.breakdown.push({
          source: `${card.rank}${card.suit} (Lucky)`,
          type: "money",
          value: "+$20",
          detail: "Lucky payout!"
        });
      }
    }
  }

  // 6. Apply Steel card enhancement (+50 Chips when held in hand)
  // These are cards remaining in hand, i.e., in gameSession.hand
  let steelCount = 0;
  for (const card of gameSession.hand) {
    if (card.enhancement === "Steel" && !card.debuffed) {
      context.chips += 50;
      steelCount++;
    }
  }
  if (steelCount > 0) {
    context.breakdown.push({
      source: "Steel Card(s) in hand",
      type: "chips",
      value: `+${steelCount * 50}`,
      detail: `${steelCount} Steel cards held`
    });
  }

  // Helper to apply a Joker's scoring logic
  const applyJokerLogic = (joker, jokerIndex, isCopied = false) => {
    if (joker.applyScoring) {
      joker.applyScoring(context, joker.state);
    }

    // Check for Baseball Card effect (Uncommon Jokers get x1.5 Mult)
    if (joker.rarity === "Uncommon") {
      const baseballCardsCount = gameSession.jokers.filter(j => j.name === "Baseball Card").length;
      for (let b = 0; b < baseballCardsCount; b++) {
        context.mult = context.mult * 1.5;
        context.breakdown.push({
          source: `Baseball Card`,
          type: "xmult",
          value: "x1.5",
          detail: `Triggered on ${isCopied ? "copied " : ""}${joker.name}`
        });
      }
    }
  };

  // 7. Apply Jokers left-to-right
  const jokers = gameSession.jokers || [];
  for (let i = 0; i < jokers.length; i++) {
    const joker = jokers[i];
    
    if (joker.name === "Blueprint") {
      // Look for Joker to the right
      const rightJoker = jokers[i + 1];
      if (rightJoker) {
        if (rightJoker.name === "Blueprint") {
          // Blueprint cannot copy Blueprint
          context.breakdown.push({
            source: "Blueprint",
            type: "blueprint",
            value: "Inactive",
            detail: "Cannot copy Blueprint"
          });
        } else {
          // Temporarily show that Blueprint is copying
          context.breakdown.push({
            source: "Blueprint",
            type: "blueprint-copy",
            value: "Copying",
            detail: `Copying ${rightJoker.name}`
          });
          applyJokerLogic(rightJoker, i, true);
        }
      } else {
        context.breakdown.push({
          source: "Blueprint",
          type: "blueprint",
          value: "Inactive",
          detail: "No Joker to copy"
        });
      }
    } else {
      applyJokerLogic(joker, i, false);
    }
  }

  // 8. Calculate total score
  const finalChips = Math.max(0, Math.floor(context.chips));
  const finalMult = Math.max(1, Math.floor(context.mult));
  const totalScore = finalChips * finalMult;

  return {
    handType,
    scoringCards,
    finalChips,
    finalMult,
    totalScore,
    breakdown: context.breakdown
  };
}
