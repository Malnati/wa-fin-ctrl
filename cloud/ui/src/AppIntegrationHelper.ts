// ui/src/AppIntegrationHelper.ts
// Integration layer connecting multi-user authentication with branding system

import {
  getCurrentUserSession,
  addUserSession,
  createUserSession,
  updateSessionBranding,
  switchUserSession,
  type UserSession,
} from "./MultiUserAuthHelper";
import {
  loadUserConfig,
  saveUserConfig,
  applySyncedConfig,
  autoSyncWithEnvironment,
  type BrandingConfig,
} from "./shared/lib/BrandingHelper";
import { getAuthInfo as legacyGetAuthInfo } from "./LoginHelper";

export interface AppContext {
  user: UserSession | null;
  branding: BrandingConfig;
  isInitialized: boolean;
  lastSync: number;
}

const CONTEXT_STORAGE_KEY = "yagnostic-app-context";
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize application context with user session and branding
 */
export async function initializeAppContext(): Promise<AppContext> {
  try {
    console.log("🚀 Initializing app context...");

    // First, sync with environment variables
    const envSync = await autoSyncWithEnvironment();
    if (envSync.updated) {
      console.log("📱 Environment sync updated branding:", envSync.changes);
    }

    // Get current user session
    let currentUser = await getCurrentUserSession();

    // If no multi-user session exists, check legacy auth
    if (!currentUser) {
      const legacyAuth = legacyGetAuthInfo();
      if (legacyAuth) {
        console.log("🔄 Migrating legacy auth to multi-user system");
        currentUser = await migrateLegacyAuth(legacyAuth);
      }
    }

    // Load branding configuration
    let branding: BrandingConfig;
    if (currentUser) {
      // Load user-specific branding if available
      branding = await loadUserConfig(currentUser.id);

      // Update session with current branding info
      await updateSessionBranding(currentUser.id, {
        configId: "user_config",
        customizations: branding as unknown as Record<string, unknown>,
      });
    } else {
      // Use environment-synced branding for non-authenticated users
      branding = envSync.config;
    }

    const context: AppContext = {
      user: currentUser,
      branding,
      isInitialized: true,
      lastSync: Date.now(),
    };

    // Save context to localStorage for quick access
    localStorage.setItem(
      CONTEXT_STORAGE_KEY,
      JSON.stringify({
        lastSync: context.lastSync,
        hasUser: !!context.user,
        userId: context.user?.id,
      }),
    );

    console.log("✅ App context initialized:", {
      hasUser: !!context.user,
      userEmail: context.user?.email,
      brandingCompany: context.branding.companyName,
    });

    return context;
  } catch (error) {
    console.error("❌ Failed to initialize app context:", error);

    // Return fallback context
    const fallbackBranding = await applySyncedConfig();
    return {
      user: null,
      branding: fallbackBranding,
      isInitialized: false,
      lastSync: 0,
    };
  }
}

/**
 * Migrate legacy authentication to multi-user system
 */
async function migrateLegacyAuth(legacyAuth: {
  token: string;
  email: string;
  name: string;
}): Promise<UserSession> {
  const session = createUserSession(
    legacyAuth.email,
    legacyAuth.name,
    legacyAuth.token,
    "jwt", // Assume JWT for legacy auth
  );

  const success = await addUserSession(session);
  if (!success) {
    throw new Error("Failed to migrate legacy auth");
  }

  console.log("✅ Legacy auth migrated for:", legacyAuth.email);
  return session;
}

/**
 * Switch user context and update branding
 */
export async function switchUserContext(userId: string): Promise<AppContext> {
  const success = await switchUserSession(userId);
  if (!success) {
    throw new Error(`Failed to switch to user ${userId}`);
  }

  // Reinitialize context with new user
  return await initializeAppContext();
}

/**
 * Update user branding preferences
 */
export async function updateUserBranding(
  userId: string,
  branding: BrandingConfig,
): Promise<boolean> {
  try {
    // Save user-specific branding configuration
    const saveSuccess = await saveUserConfig(userId, branding);
    if (!saveSuccess) {
      return false;
    }

    // Update session branding info
    await updateSessionBranding(userId, {
      configId: "user_config",
      customizations: branding as unknown as Record<string, unknown>,
    });

    console.log("✅ User branding updated for:", userId);
    return true;
  } catch (error) {
    console.error("❌ Failed to update user branding:", error);
    return false;
  }
}

/**
 * Sync app context with latest environment and user data
 */
export async function syncAppContext(
  currentContext: AppContext,
): Promise<AppContext> {
  const now = Date.now();

  // Only sync if enough time has passed
  if (now - currentContext.lastSync < SYNC_INTERVAL_MS) {
    return currentContext;
  }

  console.log("🔄 Syncing app context...");

  try {
    // Check for environment changes
    const envSync = await autoSyncWithEnvironment();

    // Get current user (may have changed in another tab)
    const currentUser = await getCurrentUserSession();

    let updatedBranding = currentContext.branding;

    // Update branding if environment changed or user changed
    if (envSync.updated || currentUser?.id !== currentContext.user?.id) {
      if (currentUser) {
        updatedBranding = await loadUserConfig(currentUser.id);
      } else {
        updatedBranding = envSync.config;
      }
    }

    const updatedContext: AppContext = {
      user: currentUser,
      branding: updatedBranding,
      isInitialized: true,
      lastSync: now,
    };

    // Update localStorage cache
    localStorage.setItem(
      CONTEXT_STORAGE_KEY,
      JSON.stringify({
        lastSync: updatedContext.lastSync,
        hasUser: !!updatedContext.user,
        userId: updatedContext.user?.id,
      }),
    );

    if (envSync.updated || currentUser?.id !== currentContext.user?.id) {
      console.log("✅ App context synced with changes");
    }

    return updatedContext;
  } catch (error) {
    console.error("❌ Failed to sync app context:", error);
    return currentContext;
  }
}

/**
 * Get cached context info from localStorage (quick check)
 */
export function getCachedContextInfo(): {
  lastSync: number;
  hasUser: boolean;
  userId?: string;
} | null {
  try {
    const cached = localStorage.getItem(CONTEXT_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Check if app context needs refresh
 */
export function shouldRefreshContext(): boolean {
  const cached = getCachedContextInfo();
  if (!cached) return true;

  const timeSinceLastSync = Date.now() - cached.lastSync;
  return timeSinceLastSync > SYNC_INTERVAL_MS;
}

/**
 * Validate app context integrity
 */
export async function validateAppContext(context: AppContext): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if context is properly initialized
  if (!context.isInitialized) {
    issues.push("App context not properly initialized");
    recommendations.push("Re-run initializeAppContext()");
  }

  // Check user session validity
  if (context.user) {
    const now = Date.now();
    if (context.user.expiresAt < now) {
      issues.push("User session expired");
      recommendations.push("Refresh token or re-authenticate user");
    }

    if (!context.user.email || !context.user.name) {
      issues.push("Incomplete user information");
      recommendations.push("Update user session with complete info");
    }
  }

  // Check branding configuration
  if (!context.branding.companyName) {
    issues.push("Missing company name in branding");
    recommendations.push("Update branding configuration");
  }

  // Check last sync time
  const timeSinceSync = Date.now() - context.lastSync;
  if (timeSinceSync > SYNC_INTERVAL_MS * 2) {
    issues.push("Context sync is overdue");
    recommendations.push("Run syncAppContext() to refresh");
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Reset app context (for logout or error recovery)
 */
export async function resetAppContext(): Promise<AppContext> {
  // Clear cached context
  localStorage.removeItem(CONTEXT_STORAGE_KEY);

  // Initialize fresh context
  return await initializeAppContext();
}

/**
 * Export context for debugging
 */
export async function exportAppContext(): Promise<{
  context: AppContext;
  validation: Awaited<ReturnType<typeof validateAppContext>>;
  environmentVars: Record<string, string>;
}> {
  const context = await initializeAppContext();
  const validation = await validateAppContext(context);

  // Safe environment variable export (no sensitive data)
  const environmentVars = {
    VITE_COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || "not set",
    VITE_COMPANY_LOGO_URL: import.meta.env.VITE_COMPANY_LOGO_URL || "not set",
    VITE_API_URL: import.meta.env.VITE_API_URL || "not set",
    NODE_ENV: import.meta.env.NODE_ENV || "not set",
  };

  return {
    context,
    validation,
    environmentVars,
  };
}
