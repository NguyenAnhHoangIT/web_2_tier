# Implementation Plan — Balatro-Lite 2-Tier Web Game

A simplified but visually faithful web clone of the roguelike poker deck-builder **Balatro**. The game captures Balatro's core identity: the **Chips × Mult** scoring formula, the Joker modifier system with left-to-right execution order, the Ante → Blind progression, the between-round Shop, and the iconic **green-felt + CRT scanline** retro aesthetic.

---

## Game UI Design Mockup

![UI Mockup](C:\Users\Admin\.gemini\antigravity\brain\fc230072-25a1-48ee-b4b6-a6b3991d9a1e\artifacts\balatro_ui_mockup.png)

---

## Core Mechanics (Faithful to Balatro)

### Scoring Formula
```
Total Score = Chips × Mult
```

1. Start with the **base Chips** and **base Mult** of the detected poker hand.
2. Add **card rank chips** for each scoring card (2→2, 3→3 … 10→10, J/Q/K→10, A→11).
3. Apply each Joker from **left to right**: `+Chips`, `+Mult` are additive; `×Mult` is multiplicative.
4. Final result = accumulated Chips × accumulated Mult.

### Poker Hand Base Values (Level 1)

| Hand | Base Chips | Base Mult |
|:---|:---:|:---:|
| High Card | 5 | 1 |
| Pair | 10 | 2 |
| Two Pair | 20 | 2 |
| Three of a Kind | 30 | 3 |
| Straight | 30 | 4 |
| Flush | 35 | 4 |
| Full House | 40 | 4 |
| Four of a Kind | 60 | 7 |
| Straight Flush | 100 | 8 |
| Royal Flush | 100 | 8 |

Hand levels can be upgraded via **Planet cards** (each level-up: +Chips increment, +Mult increment per hand type).

### Ante & Blind Structure

The game has **3 Antes** (simplified from Balatro's 8). Each Ante has 3 Blinds:

| Blind | Score Multiplier | Special Rule |
|:---|:---:|:---|
| **Small Blind** | 1× base | Can skip for a Tag reward |
| **Big Blind** | 1.5× base | Can skip for a Tag reward |
| **Boss Blind** | 2× base | Mandatory + unique modifier |

**Ante base scores:**
| Ante | Base Score |
|:---|:---:|
| 1 | 300 |
| 2 | 800 |
| 3 | 2,000 |

### Boss Blind Modifiers (Simplified set of 6)
| Boss | Effect |
|:---|:---|
| The Hook | Discards 2 random cards from hand each play |
| The Wall | Target score is 4× base instead of 2× |
| The Flint | Base Chips and Mult are halved |
| The Mark | All face cards are drawn face-down (unknown) |
| The Plant | All face cards are debuffed (don't score) |
| The Needle | Only 1 hand allowed this round |

### Round Flow
```
┌─── Ante ──────────────────────────────────────────┐
│  Small Blind → [Shop] → Big Blind → [Shop] → Boss Blind → [Shop] │
└───────────────────────────────────────────────────┘
          ↓ beat boss → next Ante (or Win if Ante 3)
```

Each round: **4 hands**, **3 discards**, draw **8 cards** from deck.

### Economy System
- Earn **$3–5** for beating a blind (scales with ante).
- **Interest**: Earn $1 per $5 held, max $5 interest per round.
- **Spending**: Jokers cost $4–8, Planet cards $3, Tarot cards $3, Reroll $5.
- **Selling**: Jokers can be sold for half their cost.

### Joker System (15 Jokers, faithful to Balatro categories)

**Common (+Chips / +Mult / Economy):**
| Joker | Effect | Cost |
|:---|:---|:---:|
| Joker | +4 Mult | $4 |
| Greedy Joker | Played ♦ cards give +3 Mult | $5 |
| Lusty Joker | Played ♥ cards give +3 Mult | $5 |
| Wrathful Joker | Played ♠ cards give +3 Mult | $5 |
| Gluttonous Joker | Played ♣ cards give +3 Mult | $5 |
| Banner | +30 Chips per discard remaining | $5 |
| Mystic Summit | +15 Mult when 0 discards left | $5 |
| Ice Cream | +100 Chips, −5 each hand played | $5 |
| Golden Joker | Earn $4 at end of round | $6 |

**Uncommon (Scaling / Conditional):**
| Joker | Effect | Cost |
|:---|:---|:---:|
| Steel Joker | +20 Chips per Steel card in deck | $6 |
| Supernova | +1 Mult per time played hand has been played this run | $6 |
| Ride the Bus | +1 Mult per consecutive hand without a face card (resets) | $6 |

**Rare (Powerful / Game-changing):**
| Joker | Effect | Cost |
|:---|:---|:---:|
| Blueprint | Copies ability of Joker to its right | $8 |
| The Duo | ×2 Mult if hand contains a Pair | $8 |
| Baseball Card | Uncommon Jokers each give ×1.5 Mult | $8 |

**Max 5 Joker slots.** Order matters — Jokers execute left to right (drag to reorder).

### Consumable Cards (Max 2 slots)

**Planet Cards** — level up a specific hand type:
| Card | Upgrades |
|:---|:---|
| Mercury | Pair (+15 Chips, +1 Mult) |
| Venus | Three of a Kind (+20 Chips, +2 Mult) |
| Earth | Full House (+25 Chips, +2 Mult) |
| Mars | Four of a Kind (+30 Chips, +3 Mult) |
| Jupiter | Flush (+15 Chips, +2 Mult) |
| Saturn | Straight (+30 Chips, +3 Mult) |
| Neptune | Straight Flush (+40 Chips, +4 Mult) |
| Pluto | High Card (+10 Chips, +1 Mult) |

**Tarot Cards** — modify cards in hand:
| Card | Effect |
|:---|:---|
| The Fool | Creates a copy of the last Tarot/Planet used |
| The Magician | Enhances 1 selected card to Lucky (1 in 5 → +20 Mult) |
| The Empress | Enhances 2 selected cards to Mult cards (+4 Mult each) |
| The Chariot | Enhances 1 selected card to Steel (+50 Chips when in hand) |
| Strength | Increases rank of up to 2 selected cards by 1 |
| The Hanged Man | Destroys up to 2 selected cards |

---

## Visual Design — Green Felt + CRT Retro

> [!IMPORTANT]
> The visual design must evoke Balatro's signature look, **not** a generic neon/synthwave theme.

### Color Palette
| Element | Color |
|:---|:---|
| Table background | `#1a472a` (dark green felt) with subtle fabric noise texture |
| UI panels / sidebar | `#0b1120` (deep navy-black) with rounded corners |
| Primary accent | `#f0c040` (warm gold/yellow for scores and highlights) |
| Chips text | `#4a9eff` (Balatro blue) |
| Mult text | `#ff4444` (Balatro red) |
| Card backs | `#c23c3c` (classic red card back) |
| Money/gold | `#f5c542` |
| Suit colors | ♥♦ = `#d44` red, ♠♣ = `#333` black |

### CRT / Retro Effects
- **Scanlines**: Semi-transparent horizontal lines overlay (`repeating-linear-gradient`)
- **Vignette**: Radial gradient darkening edges of viewport
- **Slight curvature**: Subtle barrel distortion on outer container (optional CSS `perspective`)
- **Pixel-style font**: Use a monospace/pixel font (e.g., `"Press Start 2P"` from Google Fonts) for score displays; clean sans-serif (`Inter`) for descriptions

### Card Design
- White card face with **rounded corners**, clear rank + suit in top-left
- Slight **drop shadow** and **tilt on hover** (CSS `transform: translateY(-10px) rotate(-2deg)`)
- **Selection glow**: Selected cards lift higher with a warm gold outline
- Scoring animation: Cards flip/pulse when scoring, numbers count up sequentially

### Score Animation (Juice)
- When a hand is played, show hand type label (e.g. "Full House") with a pop-in animation
- Display sequential Chips + Mult calculation: each Joker triggers left-to-right with a brief delay
- Final score slams in with a **screen shake** CSS animation
- Numbers count up rapidly (not instant) for that slot-machine dopamine hit

### UI Layout (3-Zone, matches Balatro)

```
┌─────────────────────────────────────────────────────┐
│  TOP BAR: [Ante X] [Round: Small/Big/Boss Blind]    │
│           [Target: 450]  [$12]                      │
├──────────┬──────────────────────────────────────────┤
│ LEFT     │  CENTER                                   │
│ PANEL    │                                           │
│          │  ┌─────────────────────────────────┐     │
│ Score:   │  │      JOKER SLOTS (up to 5)       │     │
│ 0/450    │  └─────────────────────────────────┘     │
│          │                                           │
│ Hands: 4 │  ┌─────────────────────────────────┐     │
│ Discards │  │   CONSUMABLE SLOTS (up to 2)     │     │
│ : 3      │  └─────────────────────────────────┘     │
│          │                                           │
│ Hand     │  ┌─────────────────────────────────┐     │
│ Level:   │  │   PLAYED HAND AREA / SCORING     │     │
│ Pair     │  └─────────────────────────────────┘     │
│ Lv.1     │                                           │
│ 10×2     │  ┌────┬────┬────┬────┬────┬────┬────┬────┐│
│          │  │ 4♠ │ 7♥ │ 7♦ │ J♣ │ Q♥ │ K♠ │ A♦ │ 2♣ ││
│          │  └────┴────┴────┴────┴────┴────┴────┴────┘│
│          │                                           │
│          │      [PLAY HAND]    [DISCARD]             │
└──────────┴──────────────────────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> **Simplifications vs full Balatro** (to keep scope manageable):
> 1. **3 Antes** instead of 8 — shorter games, ~15 min per run.
> 2. **15 Jokers** instead of 150 — covers common/uncommon/rare archetypes.
> 3. **No card enhancements/editions/seals** — no Foil/Holographic/Polychrome modifiers on playing cards (but Mult/Steel/Lucky enhancements via Tarots are included).
> 4. **No Vouchers or Spectral cards** — removed to simplify shop.
> 5. **No skip-blind Tags** — Small/Big blinds cannot be skipped (always played).
> 6. **No deck selection** — always uses the standard 52-card deck.

> [!WARNING]
> This is a **Balatro-inspired** game for learning and demonstration purposes. No assets or code from the original game are used.

---

## Open Questions

> [!NOTE]
> 1. **Sound effects**: Should we add retro chip/card sounds using HTML5 Audio? (Adds immersion but increases scope)
> 2. **Boss blind count**: Should all 6 boss modifiers rotate, or would you prefer just 3 simpler ones?
> 3. **Difficulty**: With 3 antes, the final target is 4,000 — want it harder or easier?

---

## Proposed Changes

Code organized into two distinct tiers: `backend/` and `frontend/`.

### Project Infrastructure

#### [NEW] [package.json](file:///d:/aws/web2tier/package.json)
Root workspace manifest. Single `npm run dev` starts both tiers via `concurrently`. Single `npm install` bootstraps everything.

#### [NEW] [.gitignore](file:///d:/aws/web2tier/.gitignore)
Ignore `node_modules/`, `dist/`, and `.env`.

---

### Backend (Tier 2 — Express API)

Stateful Node.js + Express server. All game logic runs server-side to prevent cheating and maintain clean FE/BE separation.

#### [NEW] [backend/package.json](file:///d:/aws/web2tier/backend/package.json)
Dependencies: `express`, `cors`, `uuid`.

#### [NEW] [backend/server.js](file:///d:/aws/web2tier/backend/server.js)
Express entry point. CORS-enabled, JSON body parser. Mounts all API routes:

| Method | Route | Purpose |
|:---|:---|:---|
| `POST` | `/api/game/new` | Create new game session, return `gameId` + initial state |
| `GET` | `/api/game/:id` | Get full game state |
| `POST` | `/api/game/:id/play` | Play selected cards (indices), return scoring breakdown |
| `POST` | `/api/game/:id/discard` | Discard selected cards, draw replacements |
| `POST` | `/api/game/:id/shop/buy` | Buy item from shop |
| `POST` | `/api/game/:id/shop/sell` | Sell a Joker |
| `POST` | `/api/game/:id/shop/reroll` | Reroll shop inventory ($5) |
| `POST` | `/api/game/:id/shop/next` | Leave shop, advance to next blind |
| `POST` | `/api/game/:id/jokers/reorder` | Reorder Joker array |
| `POST` | `/api/game/:id/consumable/use` | Use a Tarot/Planet card |

#### [NEW] [backend/src/store.js](file:///d:/aws/web2tier/backend/src/store.js)
In-memory `Map<gameId, GameState>`. GameState includes: deck, hand, jokers, consumables, score, money, ante, blind, hands remaining, discards remaining, hand levels, played-hand history.

#### [NEW] [backend/src/hands.js](file:///d:/aws/web2tier/backend/src/hands.js)
Poker hand evaluator. Detects the best hand from 1–5 cards. Returns `{ handType, scoringCards, baseChips, baseMult }`. Handles all 10 hand types from High Card to Royal Flush.

#### [NEW] [backend/src/scoring.js](file:///d:/aws/web2tier/backend/src/scoring.js)
Scoring engine:
1. Get base chips/mult from detected hand + hand level.
2. Add rank chip values for each scoring card.
3. Apply each Joker effect left-to-right (additive chips, additive mult, then xMult).
4. Return `{ chips, mult, totalScore, breakdown[] }` where `breakdown` is a step-by-step array for the frontend animation.

#### [NEW] [backend/src/jokers.js](file:///d:/aws/web2tier/backend/src/jokers.js)
Joker definitions (all 15) with `apply(context)` functions. Each Joker modifies the scoring context or triggers economy effects.

#### [NEW] [backend/src/shop.js](file:///d:/aws/web2tier/backend/src/shop.js)
Shop generation logic. Generates 2 Jokers + 1 consumable per visit. Handles buy/sell/reroll. Implements interest calculation.

#### [NEW] [backend/src/game.js](file:///d:/aws/web2tier/backend/src/game.js)
Core game controller. Creates deck, shuffles, deals hands, processes plays/discards, manages blind transitions, boss blind modifiers, and win/loss conditions.

#### [NEW] [backend/src/bosses.js](file:///d:/aws/web2tier/backend/src/bosses.js)
Boss blind modifier definitions and their `apply()` / `onDraw()` / `onPlay()` hooks.

---

### Frontend (Tier 1 — React + Vite)

#### [NEW] [frontend/package.json](file:///d:/aws/web2tier/frontend/package.json)
Vite + React. Proxy API requests to backend on port 3001.

#### [NEW] [frontend/vite.config.js](file:///d:/aws/web2tier/frontend/vite.config.js)
Vite config with proxy: `/api` → `http://localhost:3001`.

#### [NEW] [frontend/index.html](file:///d:/aws/web2tier/frontend/index.html)
HTML shell. Loads Google Fonts: `Press Start 2P` (pixel scores), `Inter` (UI text).

#### [NEW] [frontend/src/main.jsx](file:///d:/aws/web2tier/frontend/src/main.jsx)
React entry point.

#### [NEW] [frontend/src/index.css](file:///d:/aws/web2tier/frontend/src/index.css)
Global design system:
- CSS custom properties for the Balatro color palette
- Green felt background with noise texture (CSS-generated)
- CRT scanline overlay (pseudo-element)
- Vignette effect (radial gradient overlay)
- Card animations (`@keyframes` for lift, flip, shake, count-up)
- Responsive breakpoints

#### [NEW] [frontend/src/api.js](file:///d:/aws/web2tier/frontend/src/api.js)
Fetch wrapper for all backend endpoints.

#### [NEW] [frontend/src/App.jsx](file:///d:/aws/web2tier/frontend/src/App.jsx)
Root component. Manages game screens:
- **Title Screen** — "BALATRO LITE" with retro animation, "New Run" button
- **Game Screen** — 3-zone layout (sidebar + center + hand area)
- **Shop Screen** — Between-round shopping overlay
- **Score Screen** — Animated scoring breakdown
- **Game Over / Victory** — End-of-run summary

#### [NEW] [frontend/src/components/Card.jsx](file:///d:/aws/web2tier/frontend/src/components/Card.jsx)
Playing card component. White face, suit-colored rank, rounded corners, hover lift, selection glow. Supports face-down state (for Boss Blind effects).

#### [NEW] [frontend/src/components/Hand.jsx](file:///d:/aws/web2tier/frontend/src/components/Hand.jsx)
Fan layout of cards in hand. Handles card selection (click to toggle), max 5 selection. Cards fan with CSS transforms.

#### [NEW] [frontend/src/components/JokerSlots.jsx](file:///d:/aws/web2tier/frontend/src/components/JokerSlots.jsx)
Horizontal Joker tray (5 slots). Drag-to-reorder. Hover shows tooltip with effect description. Emoji-based icons per Joker.

#### [NEW] [frontend/src/components/Sidebar.jsx](file:///d:/aws/web2tier/frontend/src/components/Sidebar.jsx)
Left panel: current score / target, hands remaining, discards remaining, current hand type detection (live preview as you select cards), hand level info.

#### [NEW] [frontend/src/components/TopBar.jsx](file:///d:/aws/web2tier/frontend/src/components/TopBar.jsx)
Top status bar: Ante number, Blind name + type indicator, target score, wallet ($).

#### [NEW] [frontend/src/components/ScoreAnimation.jsx](file:///d:/aws/web2tier/frontend/src/components/ScoreAnimation.jsx)
Animated scoring breakdown overlay. Shows hand type label → base chips/mult → each Joker effect triggering sequentially → final score with screen shake.

#### [NEW] [frontend/src/components/Shop.jsx](file:///d:/aws/web2tier/frontend/src/components/Shop.jsx)
Shop overlay: 2 Joker cards + 1 consumable for purchase. Reroll button ($5). Sell area for existing Jokers. "Next Round" button.

#### [NEW] [frontend/src/components/ConsumableSlots.jsx](file:///d:/aws/web2tier/frontend/src/components/ConsumableSlots.jsx)
2-slot consumable tray. Click to use Tarots (select target cards) / Planets (instant level-up).

#### [NEW] [frontend/src/components/TitleScreen.jsx](file:///d:/aws/web2tier/frontend/src/components/TitleScreen.jsx)
Retro title screen with CRT-style "BALATRO LITE" text, flickering animation, and "New Run" button.

---

## Verification Plan

### Automated Tests

#### [NEW] [backend/tests/hands.test.js](file:///d:/aws/web2tier/backend/tests/hands.test.js)
Unit tests for the poker hand evaluator:
- High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush
- Edge cases: Ace-low straight (A-2-3-4-5), single card

#### [NEW] [backend/tests/scoring.test.js](file:///d:/aws/web2tier/backend/tests/scoring.test.js)
Unit tests for scoring engine:
- Base hand scoring without Jokers
- Scoring with +Chips, +Mult, and ×Mult Jokers
- Joker order matters (additive before multiplicative)

Run all tests: `node backend/tests/run.js`

### Manual Verification
- Start dev environment: `npm run dev`
- Browser test flow:
  1. Start a new run from the title screen
  2. Select cards → verify live hand detection in sidebar
  3. Play a hand → verify animated scoring breakdown (chips × mult)
  4. Discard cards → verify draw replacements
  5. Beat the blind → verify shop appears with purchasable items
  6. Buy a Joker → verify it appears in Joker tray
  7. Reorder Jokers → verify drag-and-drop works
  8. Use a Planet card → verify hand level increases
  9. Beat all 3 antes → verify victory screen
  10. Lose a round → verify game over screen
