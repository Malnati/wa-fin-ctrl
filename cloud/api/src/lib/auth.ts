/* eslint-disable */
// Caminho relativo ao projeto: src/lib/auth.ts
// Integração de autenticação legada desativada; código preservado comentado para futura referência.

const AUTH_LIB_DISABLED_MESSAGE = 'Fluxo de autenticação legado desativado.';
const AUTH_LIB_DISABLED_FLAG = true;

export const AUTH_LIB_STATUS_MESSAGE = AUTH_LIB_DISABLED_MESSAGE;
export const AUTH_LIB_IS_DISABLED = AUTH_LIB_DISABLED_FLAG;

// Código legado preservado comentado conforme plano de desativação.
// /* eslint-disable */
// // Caminho relativo ao projeto: src/lib/auth.ts
// // Sistema de autenticação com bypass temporário da integração Google
//
// const AUTH_TOKEN_KEY = 'authToken';
// const USER_EMAIL_KEY = 'userEmail';
// const USER_NAME_KEY = 'userName';
// const INDEX_PATH = '/index';
// const ROOT_PATH = '/';
// const ACCESS_REVOKED_MESSAGE = 'Seu acesso foi revogado. Faça login novamente.';
// const MESSAGE_ELEMENT_ID = 'message';
// const AUTH_CHECK_ELEMENT_ID = 'authCheck';
// const MAIN_CONTENT_ELEMENT_ID = 'mainContent';
// const USER_NAME_ELEMENT_ID = 'userName';
// const USER_EMAIL_ELEMENT_ID = 'userEmail';
// const USER_INFO_ELEMENT_ID = 'userInfo';
// const DISPLAY_BLOCK = 'block';
// const DISPLAY_NONE = 'none';
// const DISPLAY_FLEX = 'flex';
// const DOM_CONTENT_LOADED_EVENT = 'DOMContentLoaded';
// const BEFORE_UNLOAD_EVENT = 'beforeunload';
// const AUTH_LOG_PREFIX = '[auth-bypass]';
// const AUTH_BYPASS_AUTHORIZED_LOG = `${AUTH_LOG_PREFIX} Bypass de autorização ativo para email:`;
// const AUTH_BYPASS_LOGIN_LOG = `${AUTH_LOG_PREFIX} Ignorando resposta real do Google:`;
// const AUTH_BYPASS_ERROR_PREFIX = `${AUTH_LOG_PREFIX} Erro no login bypass:`;
// const AUTH_BYPASS_STORAGE_ERROR = `${AUTH_LOG_PREFIX} Erro ao validar autenticação:`;
// const AUTH_BYPASS_LOGOUT_LOG = `${AUTH_LOG_PREFIX} Logout executado sob bypass.`;
// const AUTH_BYPASS_REDIRECT_MESSAGE = `${AUTH_LOG_PREFIX} Redirecionamento para rota autenticada concluído.`;
// const AUTH_BYPASS_LOGOUT_REDIRECT_MESSAGE = `${AUTH_LOG_PREFIX} Redirecionamento para rota pública concluído.`;
// const AUTH_BYPASS_INTERVAL_MESSAGE = `${AUTH_LOG_PREFIX} Validação periódica desativada.`;
// const AUTH_BYPASS_INITIALIZED_LOG = `${AUTH_LOG_PREFIX} Fluxo de autenticação bypass inicializado.`;
// const AUTH_BYPASS_MAIN_PAGE_LOG = `${AUTH_LOG_PREFIX} Página principal auditada sob bypass.`;
// const AUTH_BYPASS_LOGIN_PAGE_LOG = `${AUTH_LOG_PREFIX} Página de login auditada sob bypass.`;
// const AUTH_BYPASS_UNAUTHORIZED_WARNING = `${AUTH_LOG_PREFIX} Usuário não autorizado durante bypass.`;
// const AUTH_BYPASS_MESSAGE_FALLBACK = 'Erro inesperado no fluxo de autenticação.';
// const ALERT_METHOD_NAME = 'alert';
// const TOKEN_VALIDATION_INTERVAL_MS = 60000;
// const AUTHORIZED_STATUS = true;
// const UNAUTHORIZED_STATUS = false;
// const BYPASS_DEFAULT_TOKEN = 'bypass-token';
// const BYPASS_DEFAULT_EMAIL = 'usuario.demo@yagnostic.local';
// const BYPASS_DEFAULT_NAME = 'Usuário Demo';
// const NON_CLIENT_CONTEXT_MESSAGE = 'contexto não-cliente';
//
// const isClient = typeof window !== 'undefined';
// let tokenValidationInterval: ReturnType<typeof setInterval> | null = null;
//
// export interface GoogleCredentialResponse {
//   credential: string;
// }
//
// export interface BypassUser {
//   token: string;
//   email: string;
//   name: string;
// }
//
// const BYPASS_DEFAULT_USER: BypassUser = {
//   token: BYPASS_DEFAULT_TOKEN,
//   email: BYPASS_DEFAULT_EMAIL,
//   name: BYPASS_DEFAULT_NAME,
// };
//
// export function isAuthenticated(): boolean {
//   if (!isClient) {
//     console.warn(AUTH_BYPASS_STORAGE_ERROR, NON_CLIENT_CONTEXT_MESSAGE);
//     return UNAUTHORIZED_STATUS;
//   }
//
//   try {
//     const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
//     const userEmail = window.localStorage.getItem(USER_EMAIL_KEY);
//     const isAuth = Boolean(token && userEmail);
//     console.debug(`${AUTH_LOG_PREFIX} Estado de autenticação avaliado:`, isAuth);
//     return isAuth;
//   } catch (error) {
//     console.error(AUTH_BYPASS_STORAGE_ERROR, error);
//     return UNAUTHORIZED_STATUS;
//   }
// }
//
// export async function isUserAuthorized(email: string): Promise<boolean> {
//   console.log(AUTH_BYPASS_AUTHORIZED_LOG, email);
//   return AUTHORIZED_STATUS;
// }
//
// export async function handleGoogleLogin(
//   response: GoogleCredentialResponse,
// ): Promise<void> {
//   if (!isClient) {
//     console.warn(AUTH_BYPASS_LOGIN_LOG, NON_CLIENT_CONTEXT_MESSAGE);
//     return;
//   }
//
//   try {
//     console.log(AUTH_BYPASS_LOGIN_LOG, response);
//     persistBypassCredentials();
//     stopTokenValidation();
//     window.location.assign(INDEX_PATH);
//     console.info(AUTH_BYPASS_REDIRECT_MESSAGE);
//   } catch (error) {
//     handleAuthError(error);
//   }
// }
//
// export function logout(): void {
//   if (!isClient) {
//     console.warn(AUTH_BYPASS_LOGOUT_LOG, NON_CLIENT_CONTEXT_MESSAGE);
//     return;
//   }
//
//   try {
//     stopTokenValidation();
//     clearStoredCredentials();
//     window.location.href = ROOT_PATH;
//     console.info(AUTH_BYPASS_LOGOUT_REDIRECT_MESSAGE);
//   } catch (error) {
//     console.error(AUTH_BYPASS_LOGOUT_LOG, error);
//   }
// }
//
// export function initializeAuthFlow(): void {
//   if (!isClient) {
//     console.warn(AUTH_BYPASS_INITIALIZED_LOG, NON_CLIENT_CONTEXT_MESSAGE);
//     return;
//   }
//
//   document.addEventListener(DOM_CONTENT_LOADED_EVENT, () => {
//     const currentPage = window.location.pathname;
//
//     if (currentPage === INDEX_PATH) {
//       checkAuthOnMainPage();
//     } else if (currentPage === ROOT_PATH) {
//       checkAuthOnLoginPage();
//     }
//   });
//
//   window.addEventListener(BEFORE_UNLOAD_EVENT, () => {
//     stopTokenValidation();
//   });
//
//   console.info(AUTH_BYPASS_INITIALIZED_LOG);
// }
//
// function persistBypassCredentials(): void {
//   window.localStorage.setItem(AUTH_TOKEN_KEY, BYPASS_DEFAULT_USER.token);
//   window.localStorage.setItem(USER_EMAIL_KEY, BYPASS_DEFAULT_USER.email);
//   window.localStorage.setItem(USER_NAME_KEY, BYPASS_DEFAULT_USER.name);
// }
//
// function clearStoredCredentials(): void {
//   window.localStorage.removeItem(AUTH_TOKEN_KEY);
//   window.localStorage.removeItem(USER_EMAIL_KEY);
//   window.localStorage.removeItem(USER_NAME_KEY);
// }
//
// async function checkAuthOnMainPage(): Promise<void> {
//   console.debug(AUTH_BYPASS_MAIN_PAGE_LOG);
//   if (!isClient) {
//     return;
//   }
//
//   const authCheck = document.getElementById(AUTH_CHECK_ELEMENT_ID);
//   const mainContent = document.getElementById(MAIN_CONTENT_ELEMENT_ID);
//
//   if (!authCheck || !mainContent) {
//     return;
//   }
//
//   authCheck.style.display = DISPLAY_BLOCK;
//   mainContent.style.display = DISPLAY_NONE;
//
//   if (!isAuthenticated()) {
//     window.location.href = ROOT_PATH;
//     return;
//   }
//
//   const userEmail = window.localStorage.getItem(USER_EMAIL_KEY) ?? '';
//   const authorized = await isUserAuthorized(userEmail);
//
//   if (!authorized) {
//     console.warn(AUTH_BYPASS_UNAUTHORIZED_WARNING, userEmail);
//     triggerAlert(ACCESS_REVOKED_MESSAGE);
//     logout();
//     return;
//   }
//
//   authCheck.style.display = DISPLAY_NONE;
//   mainContent.style.display = DISPLAY_BLOCK;
//
//   addUserInfoToInterface();
//   startTokenValidation();
// }
//
// function addUserInfoToInterface(): void {
//   if (!isClient) {
//     return;
//   }
//
//   const userName = window.localStorage.getItem(USER_NAME_KEY);
//   const userEmail = window.localStorage.getItem(USER_EMAIL_KEY);
//
//   if (!userName || !userEmail) {
//     return;
//   }
//
//   const userNameElement = document.getElementById(USER_NAME_ELEMENT_ID);
//   const userEmailElement = document.getElementById(USER_EMAIL_ELEMENT_ID);
//   const userInfoElement = document.getElementById(USER_INFO_ELEMENT_ID);
//
//   if (userNameElement) {
//     userNameElement.textContent = userName;
//   }
//
//   if (userEmailElement) {
//     userEmailElement.textContent = userEmail;
//   }
//
//   if (userInfoElement) {
//     userInfoElement.style.display = DISPLAY_FLEX;
//   }
// }
//
// function checkAuthOnLoginPage(): void {
//   console.debug(AUTH_BYPASS_LOGIN_PAGE_LOG);
//   if (!isClient) {
//     return;
//   }
//
//   if (isAuthenticated()) {
//     window.location.assign(INDEX_PATH);
//   }
// }
//
// function validateToken(): boolean {
//   if (!isClient) {
//     return UNAUTHORIZED_STATUS;
//   }
//
//   const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
//   return Boolean(token);
// }
//
// function startTokenValidation(): void {
//   if (!isClient) {
//     return;
//   }
//
//   stopTokenValidation();
//
//   tokenValidationInterval = window.setInterval(() => {
//     if (!validateToken()) {
//       logout();
//     }
//   }, TOKEN_VALIDATION_INTERVAL_MS);
// }
//
// function stopTokenValidation(): void {
//   if (!isClient) {
//     return;
//   }
//
//   if (tokenValidationInterval) {
//     clearInterval(tokenValidationInterval);
//     tokenValidationInterval = null;
//   }
//
//   console.debug(AUTH_BYPASS_INTERVAL_MESSAGE);
// }
//
// function handleAuthError(error: unknown): void {
//   console.error(AUTH_BYPASS_ERROR_PREFIX, error);
//
//   const messageElement = document.getElementById(MESSAGE_ELEMENT_ID);
//   const message =
//     error instanceof Error && error.message ? error.message : AUTH_BYPASS_MESSAGE_FALLBACK;
//
//   if (messageElement) {
//     messageElement.textContent = message;
//     messageElement.style.display = DISPLAY_BLOCK;
//     return;
//   }
//
//   triggerAlert(message);
// }
//
// if (isClient) {
//   initializeAuthFlow();
// }
//
// function triggerAlert(message: string): void {
//   const alertMethod = window[ALERT_METHOD_NAME as keyof Window];
//   if (typeof alertMethod === 'function') {
//     (alertMethod as (value?: string) => void)(message);
//   }
// }
//
// /*
// Código original que dependia da integração Google mantido comentado para futura reversão.
// - Carregamento do script `https://accounts.google.com/gsi/client`.
// - Inicialização de `google.accounts.id`.
// - Renderização do botão com o Google One Tap.
// O bypass atual ignora essas etapas, persistindo o usuário padrão definido em `BYPASS_DEFAULT_USER`.
// */
