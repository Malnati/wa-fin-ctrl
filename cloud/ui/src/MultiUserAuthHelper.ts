// ui/src/MultiUserAuthHelper.ts
// Enhanced authentication helper supporting multiple user sessions with secure storage

import { openDatabase, type StoreConfig } from "./utils/indexedDb";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  picture?: string;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  lastUsed: number;
  loginMethod: "google" | "jwt" | "demo";
  isActive: boolean;
  branding?: {
    configId?: string;
    customizations?: Record<string, unknown>;
  };
}

export interface AuthState {
  currentUserId: string | null;
  sessions: Record<string, UserSession>;
  lastActivity: number;
}

// IndexedDB configuration for authentication
const AUTH_DB_NAME = "yagnostic-auth-db";
const AUTH_DB_VERSION = 1;
const AUTH_STORE_NAME = "auth_sessions";
const AUTH_STORE: StoreConfig = { name: AUTH_STORE_NAME };
const AUTH_STATE_KEY = "auth_state";

// Session timeout (24 hours)
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

/**
 * Open authentication database
 */
async function openAuthDB(): Promise<IDBDatabase> {
  return openDatabase(AUTH_DB_NAME, AUTH_DB_VERSION, AUTH_STORE);
}

/**
 * Save authentication state to IndexedDB
 */
export async function saveAuthState(state: AuthState): Promise<boolean> {
  try {
    const db = await openAuthDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUTH_STORE_NAME, "readwrite");
      const store = tx.objectStore(AUTH_STORE_NAME);
      const putReq = store.put(state, AUTH_STATE_KEY);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (error) {
    console.error("Error saving auth state:", error);
    return false;
  }
}

/**
 * Load authentication state from IndexedDB
 */
export async function loadAuthState(): Promise<AuthState | null> {
  try {
    const db = await openAuthDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUTH_STORE_NAME, "readonly");
      const store = tx.objectStore(AUTH_STORE_NAME);
      const getReq = store.get(AUTH_STATE_KEY) as IDBRequest<
        AuthState | undefined
      >;
      getReq.onsuccess = () => resolve(getReq.result ?? null);
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (error) {
    console.error("Error loading auth state:", error);
    return null;
  }
}

/**
 * Generate cryptographically secure random string
 */
function generateSecureId(): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return array[0].toString(36) + array[1].toString(36);
}

/**
 * Create a new user session
 */
export function createUserSession(
  email: string,
  name: string,
  token: string,
  loginMethod: UserSession["loginMethod"],
  picture?: string,
  refreshToken?: string,
): UserSession {
  const now = Date.now();
  return {
    id: `user_${now}_${generateSecureId()}`,
    email,
    name,
    picture,
    token,
    refreshToken,
    expiresAt: now + SESSION_TIMEOUT_MS,
    lastUsed: now,
    loginMethod,
    isActive: true,
    branding: {},
  };
}

/**
 * Add or update user session
 */
export async function addUserSession(session: UserSession): Promise<boolean> {
  const state = (await loadAuthState()) || {
    currentUserId: null,
    sessions: {},
    lastActivity: Date.now(),
  };

  // Clean up expired sessions before adding new one
  await cleanupExpiredSessions();

  // Add or update session
  state.sessions[session.id] = session;
  state.currentUserId = session.id;
  state.lastActivity = Date.now();

  return await saveAuthState(state);
}

/**
 * Switch to a different user session
 */
export async function switchUserSession(userId: string): Promise<boolean> {
  const state = await loadAuthState();
  if (!state || !state.sessions[userId]) {
    return false;
  }

  // Check if session is still valid
  const session = state.sessions[userId];
  if (session.expiresAt < Date.now()) {
    delete state.sessions[userId];
    await saveAuthState(state);
    return false;
  }

  // Update current user and last used timestamp
  state.currentUserId = userId;
  state.sessions[userId].lastUsed = Date.now();
  state.sessions[userId].isActive = true;
  state.lastActivity = Date.now();

  // Set other sessions to inactive
  Object.keys(state.sessions).forEach((id) => {
    if (id !== userId) {
      state.sessions[id].isActive = false;
    }
  });

  return await saveAuthState(state);
}

/**
 * Get current active user session
 */
export async function getCurrentUserSession(): Promise<UserSession | null> {
  const state = await loadAuthState();
  if (!state || !state.currentUserId) {
    return null;
  }

  const session = state.sessions[state.currentUserId];
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

/**
 * Get all valid user sessions
 */
export async function getAllUserSessions(): Promise<UserSession[]> {
  const state = await loadAuthState();
  if (!state) {
    return [];
  }

  const now = Date.now();
  return Object.values(state.sessions)
    .filter((session) => session.expiresAt > now)
    .sort((a, b) => b.lastUsed - a.lastUsed);
}

/**
 * Remove user session
 */
export async function removeUserSession(userId: string): Promise<boolean> {
  const state = await loadAuthState();
  if (!state) {
    return false;
  }

  delete state.sessions[userId];

  // If this was the current user, switch to another session or clear
  if (state.currentUserId === userId) {
    const remainingSessions = Object.keys(state.sessions);
    state.currentUserId =
      remainingSessions.length > 0 ? remainingSessions[0] : null;
  }

  state.lastActivity = Date.now();
  return await saveAuthState(state);
}

/**
 * Clear all user sessions (logout all)
 */
export async function clearAllSessions(): Promise<boolean> {
  const emptyState: AuthState = {
    currentUserId: null,
    sessions: {},
    lastActivity: Date.now(),
  };

  return await saveAuthState(emptyState);
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const state = await loadAuthState();
  if (!state) {
    return 0;
  }

  const now = Date.now();
  let removedCount = 0;

  Object.keys(state.sessions).forEach((userId) => {
    if (state.sessions[userId].expiresAt < now) {
      delete state.sessions[userId];
      removedCount++;
    }
  });

  if (removedCount > 0) {
    // Check if current user was expired
    if (state.currentUserId && !state.sessions[state.currentUserId]) {
      const remainingSessions = Object.keys(state.sessions);
      state.currentUserId =
        remainingSessions.length > 0 ? remainingSessions[0] : null;
    }

    state.lastActivity = Date.now();
    await saveAuthState(state);
  }

  return removedCount;
}

/**
 * Validate session token with API
 */
export async function validateSessionToken(token: string): Promise<{
  isValid: boolean;
  userInfo?: { email: string; name: string; picture?: string };
  error?: string;
}> {
  try {
    const response = await fetch("/auth/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        userInfo: data.user,
      };
    } else {
      return {
        isValid: false,
        error: `Validation failed: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Refresh session token if refresh token is available
 */
export async function refreshSessionToken(session: UserSession): Promise<{
  success: boolean;
  newToken?: string;
  error?: string;
}> {
  if (!session.refreshToken) {
    return { success: false, error: "No refresh token available" };
  }

  try {
    const response = await fetch("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        newToken: data.token,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Refresh failed: ${response.status} - ${errorText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Update session branding preferences
 */
export async function updateSessionBranding(
  userId: string,
  brandingConfig: {
    configId?: string;
    customizations?: Record<string, unknown>;
  },
): Promise<boolean> {
  const state = await loadAuthState();
  if (!state || !state.sessions[userId]) {
    return false;
  }

  state.sessions[userId].branding = brandingConfig;
  state.lastActivity = Date.now();

  return await saveAuthState(state);
}

/**
 * Check if user is authenticated and session is valid
 */
export async function isAuthenticated(): Promise<boolean> {
  await cleanupExpiredSessions();
  const session = await getCurrentUserSession();
  return session !== null;
}

/**
 * Get current user info for compatibility with existing code
 */
export async function getCurrentUserInfo(): Promise<{
  token: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  const session = await getCurrentUserSession();
  if (!session) {
    return null;
  }

  return {
    token: session.token,
    email: session.email,
    name: session.name,
    picture: session.picture,
  };
}

/**
 * Logout current user but keep other sessions active
 */
export async function logoutCurrentUser(): Promise<boolean> {
  const state = await loadAuthState();
  if (!state || !state.currentUserId) {
    return false;
  }

  return await removeUserSession(state.currentUserId);
}

/**
 * Auto-refresh expired tokens
 */
export async function autoRefreshTokens(): Promise<{
  refreshed: number;
  failed: number;
}> {
  const sessions = await getAllUserSessions();
  let refreshed = 0;
  let failed = 0;

  for (const session of sessions) {
    // Check if token will expire in next 10 minutes
    const willExpireSoon = session.expiresAt - Date.now() < 10 * 60 * 1000;

    if (willExpireSoon && session.refreshToken) {
      const result = await refreshSessionToken(session);

      if (result.success && result.newToken) {
        // Update session with new token
        session.token = result.newToken;
        session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;

        const state = await loadAuthState();
        if (state) {
          state.sessions[session.id] = session;
          await saveAuthState(state);
          refreshed++;
        }
      } else {
        failed++;
      }
    }
  }

  return { refreshed, failed };
}
