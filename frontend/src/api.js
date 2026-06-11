const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }
  return data;
}

export const api = {
  createNewGame() {
    return request("/game/new", { method: "POST" });
  },

  getGameState(gameId) {
    return request(`/game/${gameId}`);
  },

  playHand(gameId, cardIds) {
    return request(`/game/${gameId}/play`, {
      method: "POST",
      body: JSON.stringify({ cardIds })
    });
  },

  discardCards(gameId, cardIds) {
    return request(`/game/${gameId}/discard`, {
      method: "POST",
      body: JSON.stringify({ cardIds })
    });
  },

  buyShopItem(gameId, itemType, itemIndex) {
    return request(`/game/${gameId}/shop/buy`, {
      method: "POST",
      body: JSON.stringify({ itemType, itemIndex })
    });
  },

  sellItem(gameId, itemType, itemIndex) {
    return request(`/game/${gameId}/shop/sell`, {
      method: "POST",
      body: JSON.stringify({ itemType, itemIndex })
    });
  },

  rerollShop(gameId) {
    return request(`/game/${gameId}/shop/reroll`, {
      method: "POST"
    });
  },

  nextRound(gameId) {
    return request(`/game/${gameId}/shop/next`, {
      method: "POST"
    });
  },

  reorderJokers(gameId, newOrderIndices) {
    return request(`/game/${gameId}/jokers/reorder`, {
      method: "POST",
      body: JSON.stringify({ newOrderIndices })
    });
  },

  useConsumable(gameId, index, targetCardIds) {
    return request(`/game/${gameId}/consumable/use`, {
      method: "POST",
      body: JSON.stringify({ index, targetCardIds })
    });
  }
};
