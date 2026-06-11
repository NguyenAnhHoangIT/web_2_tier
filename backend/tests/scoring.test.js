import { calculateScore } from "../src/scoring.js";
import { createJoker } from "../src/jokers.js";

export function runScoringTests(assert) {
  // Test 1: Base Hand Scoring without Jokers
  {
    const playedCards = [
      { rank: "A", suit: "S", enhancement: null },
      { rank: "A", suit: "H", enhancement: null }
    ];
    const session = {
      handLevels: { "Pair": 1 },
      jokers: [],
      hand: [],
      discardsRemaining: 3
    };

    const result = calculateScore(playedCards, session);
    assert.equal(result.handType, "Pair");
    // Pair Base Level 1: 10 Chips, 2 Mult
    // Card chips: Ace (11) + Ace (11) = 22
    // Total Chips: 10 + 22 = 32
    // Total Mult: 2
    // Final Score: 32 * 2 = 64
    assert.equal(result.finalChips, 32);
    assert.equal(result.finalMult, 2);
    assert.equal(result.totalScore, 64);
  }

  // Test 2: Hand Leveling Upgrades
  {
    const playedCards = [
      { rank: "A", suit: "S", enhancement: null },
      { rank: "A", suit: "H", enhancement: null }
    ];
    const session = {
      handLevels: { "Pair": 2 }, // level 2! Mercury upgrade is +15 Chips, +1 Mult
      jokers: [],
      hand: [],
      discardsRemaining: 3
    };

    const result = calculateScore(playedCards, session);
    assert.equal(result.handType, "Pair");
    // Pair Base Level 2: (10 + 15) = 25 Chips, (2 + 1) = 3 Mult
    // Card chips: Ace (11) + Ace (11) = 22
    // Total Chips: 25 + 22 = 47
    // Total Mult: 3
    // Final Score: 47 * 3 = 141
    assert.equal(result.finalChips, 47);
    assert.equal(result.finalMult, 3);
    assert.equal(result.totalScore, 141);
  }

  // Test 3: Simple +Chips / +Mult Jokers
  {
    const playedCards = [
      { rank: "A", suit: "S", enhancement: null },
      { rank: "A", suit: "H", enhancement: null }
    ];
    // Add "Joker" (+4 Mult) and "Banner" (+30 Chips per discard)
    const session = {
      handLevels: { "Pair": 1 },
      jokers: [
        createJoker("Joker"),
        createJoker("Banner")
      ],
      hand: [],
      discardsRemaining: 2 // 2 discards remaining * 30 = +60 chips
    };

    const result = calculateScore(playedCards, session);
    // Base Chips = 10 + 22 = 32. +60 (Banner) = 92
    // Base Mult = 2. +4 (Joker) = 6
    // Final Score = 92 * 6 = 552
    assert.equal(result.finalChips, 92);
    assert.equal(result.finalMult, 6);
    assert.equal(result.totalScore, 552);
  }

  // Test 4: Blueprint Copying
  {
    const playedCards = [
      { rank: "A", suit: "S", enhancement: null },
      { rank: "A", suit: "H", enhancement: null }
    ];
    // Blueprint is left of Joker, should copy Joker (+4 Mult)
    const session = {
      handLevels: { "Pair": 1 },
      jokers: [
        createJoker("Blueprint"),
        createJoker("Joker")
      ],
      hand: [],
      discardsRemaining: 3
    };

    const result = calculateScore(playedCards, session);
    // Base Chips = 32
    // Base Mult = 2. Joker (+4) + Blueprint copying Joker (+4) = 10 Mult
    // Final Score = 32 * 10 = 320
    assert.equal(result.finalMult, 10);
    assert.equal(result.totalScore, 320);
  }

  // Test 5: Baseball Card multiplying Uncommon Jokers
  {
    const playedCards = [
      { rank: "A", suit: "S", enhancement: null },
      { rank: "A", suit: "H", enhancement: null }
    ];
    // Supernova (Uncommon) is present, Baseball Card (Rare) multiplies its trigger by x1.5
    // Session hand history has Pair played 2 times
    const session = {
      handLevels: { "Pair": 1 },
      jokers: [
        createJoker("Supernova"), // +2 Mult (from handHistory)
        createJoker("Baseball Card") // x1.5 Mult on Uncommon Jokers
      ],
      hand: [],
      discardsRemaining: 3,
      handHistory: { "Pair": 2 }
    };

    const result = calculateScore(playedCards, session);
    // Base Chips = 32
    // Base Mult = 2. Supernova (+2) = 4 Mult. Baseball Card triggers on Supernova = 4 * 1.5 = 6 Mult.
    // Final Score = 32 * 6 = 192
    assert.equal(result.finalMult, 6);
    assert.equal(result.totalScore, 192);
  }
}
