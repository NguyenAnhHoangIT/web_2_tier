import { v4 as uuidv4 } from "uuid";

// Simple in-memory storage for active game sessions
const sessions = new Map();

/**
 * Creates and stores a new game session with a unique UUID.
 * 
 * @returns {Object} Newly created game session state skeleton
 */
export function createSession() {
  const id = uuidv4();
  const session = {
    id,
    createdAt: new Date().toISOString()
  };
  sessions.set(id, session);
  return session;
}

/**
 * Retrieves a game session by its ID.
 * 
 * @param {string} id - Game ID
 * @returns {Object|null} Game session state or null if not found
 */
export function getSession(id) {
  return sessions.get(id) || null;
}

/**
 * Deletes a game session from storage.
 * 
 * @param {string} id - Game ID
 * @returns {boolean} True if successfully deleted
 */
export function deleteSession(id) {
  return sessions.delete(id);
}
