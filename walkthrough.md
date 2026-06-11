# Walkthrough: Balatro Lite Roguelike Poker Deckbuilder

We have successfully built and verified **Balatro Lite**, a 2-tier web application featuring a Node/Express backend and a React/Vite/CSS frontend. The game matches Balatro's exact look and feel, including dark green felt, CRT screen curves, vignette lighting, scanlines, fanned card layouts, and slot-machine tally count-up animations.

---

## 1. Project Architecture

The codebase is organized into a clean 2-tier separation:

```mermaid
graph TD
    subgraph Frontend (React / Vite / CSS)
        A[TitleScreen.jsx] --> B[App.jsx]
        B --> C[Sidebar.jsx]
        B --> D[TopBar.jsx]
        B --> E[Hand.jsx]
        B --> F[JokerSlots.jsx]
        B --> G[ConsumableSlots.jsx]
        B --> H[Shop.jsx]
        B --> I[ScoreAnimation.jsx]
        B --> J[api.js]
    end
    subgraph Backend (Node / Express)
        J --> K[server.js]
        K --> L[game.js Engine]
        L --> M[store.js Session Store]
        L --> N[scoring.js Calculator]
        L --> O[shop.js Payouts]
        L --> P[jokers.js Definitions]
        L --> Q[bosses.js Blinds]
        L --> R[hands.js Evaluator]
    end
```

---

## 2. Completed Implementation Details

### Backend Components (Tier 2)
1. **Poker Hand Evaluator** ([hands.js](file:///d:/aws/web2tier/backend/src/hands.js)): Classifies 1-5 card hands, identifying scoring sub-hands and rank hierarchies (Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight including Ace-low/high, Three of a Kind, Two Pair, Pair, High Card).
2. **Joker Definitions** ([jokers.js](file:///d:/aws/web2tier/backend/src/jokers.js)): Defines the 15 distinct Jokers with their pricing, rarity tags, descriptions, and interactive hooks for play scoring and status progression (e.g., Ice Cream, Ride the Bus, Blueprint, Baseball Card).
3. **Boss Blinds** ([bosses.js](file:///d:/aws/web2tier/backend/src/bosses.js)): Implements custom rules for 6 boss modifiers: The Hook (discards 2 random cards), The Wall (4x target score), The Flint (halves base chips/mult), The Mark (facedown face cards), The Plant (debuffs face cards), and The Needle (1 hand only).
4. **Scoring Calculator** ([scoring.js](file:///d:/aws/web2tier/backend/src/scoring.js)): Scores hands based on levels, individual rank values, card enhancements (Bonus, Mult, Steel, Lucky), and loops active Jokers left-to-right (copying neighbor logic for Blueprint and triggering Baseball Card multiplier bonuses on Uncommon Jokers).
5. **Shop System** ([shop.js](file:///d:/aws/web2tier/backend/src/shop.js)): Manages inventory generation (offering 2 random Jokers + 1 consumable Planet or Tarot card), interest earnings ($1 per $5 held, max $5), and scaling reroll costs.
6. **Session Storage** ([store.js](file:///d:/aws/web2tier/backend/src/store.js)): In-memory cache holding game sessions by UUID.
7. **Express Routes** ([server.js](file:///d:/aws/web2tier/backend/server.js)): Exposes endpoints for all gameplay operations (play, discard, buy, sell, reroll, next blind, consumable use, and Joker reordering).

### Frontend Components (Tier 1)
1. **Global Stylesheet** ([index.css](file:///d:/aws/web2tier/frontend/src/index.css)): Features CRT overlays, dark glassmorphism backdrops, scanline layers, vignette corner-shading, poker felt green backgrounds, selection glows, and shake animations.
2. **API Client** ([api.js](file:///d:/aws/web2tier/frontend/src/api.js)): Network wrapper forwarding JSON payloads to the Express server.
3. **Card & Hand Components** ([Card.jsx](file:///d:/aws/web2tier/frontend/src/components/Card.jsx) & [Hand.jsx](file:///d:/aws/web2tier/frontend/src/components/Hand.jsx)): Renders card faces, backs, and debuffed/enhanced states, displaying them in a curved fanned stack.
4. **Joker Slots** ([JokerSlots.jsx](file:///d:/aws/web2tier/frontend/src/components/JokerSlots.jsx)): Displays Jokers with rarity-coded frames, selling tools, and custom HTML5 drag-and-drop ordering.
5. **Consumables Slots** ([ConsumableSlots.jsx](file:///d:/aws/web2tier/frontend/src/components/ConsumableSlots.jsx)): Handles Planet/Tarot slots, validating target card counts (e.g. Strength or Magician) before allowing activation.
6. **HUD Panels** ([Sidebar.jsx](file:///d:/aws/web2tier/frontend/src/components/Sidebar.jsx) & [TopBar.jsx](file:///d:/aws/web2tier/frontend/src/components/TopBar.jsx)): Displays round scores, target progression bars, wallets, remaining plays/discards, active ante/boss rules, and inspector dropdowns showing active hand upgrade levels.
7. **Shop Overlay** ([Shop.jsx](file:///d:/aws/web2tier/frontend/src/components/Shop.jsx)): Reveals shelves containing items, showing detailed descriptions on hover, buy triggers, payouts summaries, and round transitions.
8. **Scoring Overlay** ([ScoreAnimation.jsx](file:///d:/aws/web2tier/frontend/src/components/ScoreAnimation.jsx)): Runs a step-by-step tally of played hands, highlighting individual triggers and rolling up the total product.

---

## 3. Verification & Testing

### Automated Unit Tests
We wrote custom unit tests verifying our hand evaluations and scoring engine rules:
- **Hand Classification Test**: Correctly classified pairs, flushes, full houses, and Ace-low straights.
- **Scoring Engine Test**: Verified base hand stats, hand level upgrades, simple Joker bonuses, Blueprint copies, and Baseball Card multipliers.
- **Result**: Run and passed successfully with exit code 0.
```bash
node tests/run.js
```

### Visual Verification
Using the browser automation agent, we validated all gameplay mechanics:
1. **Startup**: Loaded the title screen and triggered a run.
2. **Gameplay**: Selected and played a pair, watched the scoring ticker animation roll up the tally, and verified the score sidebar updated. Discarded low cards to draw replacements.
3. **Transitions**: Reached the 300-point threshold, entered the Shop, viewed our payout summary, purchased **Ride the Bus** Joker, and proceeded to the Big Blind.

---

## 4. Visual Gameplay Assets

Here is a recording of the gameplay session and a snapshot of the retro Shop overlay:

### Gameplay Recording
![Gameplay Session](C:/Users/Admin/.gemini/antigravity/brain/fc230072-25a1-48ee-b4b6-a6b3991d9a1e/artifacts/balatro_gameplay_test.webp)

### Shop Transition Snapshot
![Shop Screen](C:/Users/Admin/.gemini/antigravity/brain/fc230072-25a1-48ee-b4b6-a6b3991d9a1e/artifacts/balatro_shop_screenshot.png)

---

## 5. Dockerization & Production Build

We have containerized the unified 2-tier application for single-command production deployment:
- **Dockerfile** ([Dockerfile](file:///d:/aws/web2tier/Dockerfile)): Runs the Node/Express server and serves the React/Vite assets dynamically on `PORT 3001`.
- **Dockerignore** ([.dockerignore](file:///d:/aws/web2tier/.dockerignore)): Optimizes image contexts, excluding package directories and temporary logs.
- **Docker Build script** ([package.json](file:///d:/aws/web2tier/package.json)): Added a helper script to compile the frontend locally and pack the Docker image:
  ```bash
  npm run docker:build
  ```
- **Running the Container**:
  To launch the containerized application on port 3001:
  ```bash
  docker run -d -p 3001:3001 balatro-lite:latest
  ```

---

## 6. Docker Compose & GitHub Actions Automation

We have introduced multi-container orchestration support and CI/CD pipelines:
- **Docker Compose** ([docker-compose.yml](file:///d:/aws/web2tier/docker-compose.yml)): Defines the service orchestration settings. You can now build and run the application with a single command:
  ```bash
  docker compose up --build -d
  ```
- **GitHub Actions Workflow** ([docker-build.yml](file:///d:/aws/web2tier/.github/workflows/docker-build.yml)): Automatically triggers on pushes or PRs targeting `main` or `master` branches. It checks out code, setups Node.js, compiles production frontend static files, sets up Docker Buildx, and runs `docker compose build` to verify the deployment container compiles successfully.
- **Kubernetes Compatibility (Service Names)**: Because the React frontend compiles into JavaScript and runs inside the user's client browser, the browser cannot resolve internal Kubernetes Service DNS names (like `http://backend-service:3001`) directly. The application supports K8s service resolution through:
  1. **Relative Path Routing (Recommended)**: The frontend communicates via relative `/api` paths. In Kubernetes, you deploy an Ingress controller (or API Gateway) that maps `/api/*` traffic to the backend Service name (e.g. `http://backend-service:3001`), and all other paths to the frontend Service.
  2. **Dynamic API Endpoint Override**: The API client checks for `import.meta.env.VITE_API_URL` at build time, allowing you to inject a specific external DNS endpoint if needed.


