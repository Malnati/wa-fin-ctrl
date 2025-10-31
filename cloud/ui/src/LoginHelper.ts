import { API_BASE_URL } from "./constants/api";
import {
  HTTPS_PROTOCOL,
  COOKIE_PATH_ATTR,
  COOKIE_SAME_SITE_ATTR,
  COOKIE_DELETE_DATE,
  COOKIE_MAX_AGE_MS,
  AUTH_TOKEN_COOKIE_KEY,
  USER_EMAIL_COOKIE_KEY,
  USER_NAME_COOKIE_KEY,
  USER_PICTURE_COOKIE_KEY,
  LOCAL_STORAGE_AUTH_TOKEN_KEY,
  LOCAL_STORAGE_USER_EMAIL_KEY,
  LOCAL_STORAGE_USER_NAME_KEY,
  LOCAL_STORAGE_USER_PICTURE_KEY,
  BYPASS_DEFAULT_TOKEN,
  BYPASS_DEFAULT_EMAIL,
  BYPASS_DEFAULT_NAME,
} from "./constants/constants";
// src/LoginHelper.ts - Funções auxiliares para Login

export const BYPASS_DEFAULT_USER = {
  token: BYPASS_DEFAULT_TOKEN,
  email: BYPASS_DEFAULT_EMAIL,
  name: BYPASS_DEFAULT_NAME,
  picture: undefined as string | undefined,
};

function shouldUseSecureCookies(): boolean {
  if (globalThis.window === undefined) {
    return true;
  }
  return globalThis.window.location.protocol === HTTPS_PROTOCOL;
}

function buildCookieAttributes(expires: string): string {
  const secureSegment = shouldUseSecureCookies() ? ";secure" : "";
  return `expires=${expires};${COOKIE_PATH_ATTR};${COOKIE_SAME_SITE_ATTR}${secureSegment}`;
}

function setCookie(key: string, value: string, expires: Date): void {
  document.cookie = `${key}=${value};${buildCookieAttributes(expires.toUTCString())}`;
}

function deleteCookie(key: string): void {
  const secureSegment = shouldUseSecureCookies() ? ";secure" : "";
  document.cookie = `${key}=;expires=${COOKIE_DELETE_DATE};${COOKIE_PATH_ATTR}${secureSegment}`;
}

export interface ConfigResponse {
  googleClientId?: string;
  allowedOrigins?: string[];
}

export interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Carrega configuração do servidor
 */
export async function loadConfig(): Promise<ConfigResponse> {
  try {
    console.log("🔧 Carregando configuração...");
    const resp = await fetch(`${API_BASE_URL}/api/config`, {
      cache: "no-store",
    });
    console.log("📡 Resposta da API:", resp.status, resp.statusText);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    const json = (await resp.json()) as ConfigResponse;
    console.log("✅ Configuração carregada:", json);
    return json;
  } catch (error) {
    console.error("❌ Erro ao carregar configuração:", error);
    return { googleClientId: "", allowedOrigins: [] };
  }
}

/**
 * Verifica se a origem atual está permitida
 */
export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[],
): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * Decodifica JWT e extrai informações do usuário
 */
export function decodeJWT(token: string): UserInfo | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) {
      throw new Error("Token inválido");
    }

    const payload = JSON.parse(
      atob(payloadB64.replaceAll("-", "+").replaceAll("_", "/")),
    );

    return {
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Salva informações de autenticação em cookies e localStorage
 */
export function saveAuthInfo(token: string, userInfo: UserInfo): void {
  // Salvar em localStorage para compatibilidade
  localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, token);
  localStorage.setItem(LOCAL_STORAGE_USER_EMAIL_KEY, userInfo.email);
  localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, userInfo.name);
  if (userInfo.picture) {
    localStorage.setItem(LOCAL_STORAGE_USER_PICTURE_KEY, userInfo.picture);
  }

  // Salvar em cookies para funcionar com HTTPS e middleware
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE_MS); // 24 horas

  setCookie(AUTH_TOKEN_COOKIE_KEY, token, expires);
  setCookie(USER_EMAIL_COOKIE_KEY, userInfo.email, expires);
  setCookie(USER_NAME_COOKIE_KEY, userInfo.name, expires);
  if (userInfo.picture) {
    setCookie(USER_PICTURE_COOKIE_KEY, userInfo.picture, expires);
  }
}

/**
 * Limpa informações de autenticação
 */
export function clearAuthInfo(): void {
  localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  localStorage.removeItem(LOCAL_STORAGE_USER_EMAIL_KEY);
  localStorage.removeItem(LOCAL_STORAGE_USER_NAME_KEY);
  localStorage.removeItem(LOCAL_STORAGE_USER_PICTURE_KEY);

  // Limpar cookies também
  deleteCookie(AUTH_TOKEN_COOKIE_KEY);
  deleteCookie(USER_EMAIL_COOKIE_KEY);
  deleteCookie(USER_NAME_COOKIE_KEY);
  deleteCookie(USER_PICTURE_COOKIE_KEY);
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  // Verificar localStorage primeiro
  const authToken = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  const userEmail = localStorage.getItem(LOCAL_STORAGE_USER_EMAIL_KEY);

  if (authToken && userEmail) {
    return true;
  }

  // Verificar cookies como fallback
  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_TOKEN_COOKIE_KEY}=`),
  );
  const emailCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${USER_EMAIL_COOKIE_KEY}=`),
  );

  return !!(authCookie && emailCookie);
}

/**
 * Obtém informações do usuário autenticado
 */
export function getAuthInfo(): {
  token: string;
  email: string;
  name: string;
} | null {
  // Tentar localStorage primeiro
  const authToken = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  const userEmail = localStorage.getItem(LOCAL_STORAGE_USER_EMAIL_KEY);
  const userName = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);

  if (authToken && userEmail && userName) {
    return { token: authToken, email: userEmail, name: userName };
  }

  // Fallback para cookies
  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_TOKEN_COOKIE_KEY}=`),
  );
  const emailCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${USER_EMAIL_COOKIE_KEY}=`),
  );
  const nameCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${USER_NAME_COOKIE_KEY}=`),
  );

  if (authCookie && emailCookie && nameCookie) {
    return {
      token: authCookie.split("=")[1],
      email: emailCookie.split("=")[1],
      name: nameCookie.split("=")[1],
    };
  }

  return null;
}

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    email_verified: boolean;
  };
  success: boolean;
  timestamp: string;
  request_id: string;
}

/**
 * Autentica com Google OAuth via nossa API
 */
export async function authenticateWithGoogle(
  credential: string,
  clientId?: string,
): Promise<GoogleAuthResponse> {
  try {
    console.log("🔐 Authenticating with Google via API...");

    const requestBody = {
      credential,
      ...(clientId && { clientId }),
      context: "web-app",
    };

    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📡 Auth API response:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro de autenticação: ${response.status} - ${errorText}`,
      );
    }

    const result = (await response.json()) as GoogleAuthResponse;
    console.log("✅ Authentication successful:", {
      success: result.success,
      userEmail: result.user?.email,
      requestId: result.request_id,
    });

    return result;
  } catch (error) {
    console.error("❌ Google authentication failed:", error);
    throw error instanceof Error ? error : new Error("Falha na autenticação");
  }
}

/**
 * Valida se o token JWT ainda é válido
 */
export function isTokenValid(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload) return false;

    // Check if token has exp claim
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return false;

    const parsedPayload = JSON.parse(
      atob(payloadB64.replaceAll("-", "+").replaceAll("_", "/")),
    );

    // If no expiration claim, consider token valid (for backward compatibility)
    if (!parsedPayload.exp) return true;

    // Check if token is expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    const buffer = 5 * 60; // 5 minutes

    return parsedPayload.exp > now + buffer;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}

/**
 * Verifica se o usuário precisa renovar o token
 */
export function shouldRenewToken(token: string): boolean {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return false;

    const parsedPayload = JSON.parse(
      atob(payloadB64.replaceAll("-", "+").replaceAll("_", "/")),
    );

    // If no expiration claim, no need to renew
    if (!parsedPayload.exp) return false;

    // Renew if token expires in less than 10 minutes
    const now = Math.floor(Date.now() / 1000);
    const renewBuffer = 10 * 60; // 10 minutes

    return parsedPayload.exp < now + renewBuffer;
  } catch (error) {
    console.error("Error checking token renewal:", error);
    return false;
  }
}

/**
 * Faz logout completo limpando todos os dados de autenticação
 */
export function logout(): void {
  console.log("🔒 Performing logout...");

  try {
    // Clear authentication info
    clearAuthInfo();

    // Revoke Google session if available
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.warn("Could not disable Google auto-select:", error);
      }
    }

    console.log("✅ Logout completed");
  } catch (error) {
    console.error("❌ Error during logout:", error);
  }
}
