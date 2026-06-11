import { evaluateHand } from "../src/hands.js";

export function runHandsTests(assert) {
  // Test 1: High Card
  {
    const cards = [
      { rank: "2", suit: "S" },
      { rank: "7", suit: "H" },
      { rank: "K", suit: "D" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "High Card");
    assert.equal(result.scoringCards.length, 1);
    assert.equal(result.scoringCards[0].rank, "K");
  }

  // Test 2: Pair
  {
    const cards = [
      { rank: "J", suit: "S" },
      { rank: "J", suit: "H" },
      { rank: "4", suit: "D" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Pair");
    assert.equal(result.scoringCards.length, 2);
    assert.equal(result.scoringCards[0].rank, "J");
    assert.equal(result.scoringCards[1].rank, "J");
  }

  // Test 3: Two Pair
  {
    const cards = [
      { rank: "10", suit: "S" },
      { rank: "10", suit: "H" },
      { rank: "A", suit: "D" },
      { rank: "A", suit: "C" },
      { rank: "5", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Two Pair");
    assert.equal(result.scoringCards.length, 4);
    assert.equal(result.scoringCards[0].rank, "A"); // sorted by rank desc
    assert.equal(result.scoringCards[2].rank, "10");
  }

  // Test 4: Three of a Kind
  {
    const cards = [
      { rank: "8", suit: "S" },
      { rank: "8", suit: "H" },
      { rank: "8", suit: "D" },
      { rank: "2", suit: "C" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Three of a Kind");
    assert.equal(result.scoringCards.length, 3);
    assert.equal(result.scoringCards[0].rank, "8");
  }

  // Test 5: Straight (Ace High)
  {
    const cards = [
      { rank: "10", suit: "S" },
      { rank: "J", suit: "H" },
      { rank: "Q", suit: "D" },
      { rank: "K", suit: "C" },
      { rank: "A", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Straight");
    assert.equal(result.scoringCards.length, 5);
  }

  // Test 6: Straight (Ace Low)
  {
    const cards = [
      { rank: "A", suit: "S" },
      { rank: "2", suit: "H" },
      { rank: "3", suit: "D" },
      { rank: "4", suit: "C" },
      { rank: "5", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Straight");
    assert.equal(result.scoringCards.length, 5);
  }

  // Test 7: Flush
  {
    const cards = [
      { rank: "2", suit: "H" },
      { rank: "7", suit: "H" },
      { rank: "9", suit: "H" },
      { rank: "J", suit: "H" },
      { rank: "A", suit: "H" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Flush");
    assert.equal(result.scoringCards.length, 5);
  }

  // Test 8: Full House
  {
    const cards = [
      { rank: "9", suit: "S" },
      { rank: "9", suit: "H" },
      { rank: "9", suit: "D" },
      { rank: "A", suit: "C" },
      { rank: "A", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Full House");
    assert.equal(result.scoringCards.length, 5);
  }

  // Test 9: Four of a Kind
  {
    const cards = [
      { rank: "Q", suit: "S" },
      { rank: "Q", suit: "H" },
      { rank: "Q", suit: "D" },
      { rank: "Q", suit: "C" },
      { rank: "3", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Four of a Kind");
    assert.equal(result.scoringCards.length, 4);
    assert.equal(result.scoringCards[0].rank, "Q");
  }

  // Test 10: Royal Flush
  {
    const cards = [
      { rank: "10", suit: "S" },
      { rank: "J", suit: "S" },
      { rank: "Q", suit: "S" },
      { rank: "K", suit: "S" },
      { rank: "A", suit: "S" }
    ];
    const result = evaluateHand(cards);
    assert.equal(result.handType, "Royal Flush");
    assert.equal(result.scoringCards.length, 5);
  }
}
