// ui/src/shared/lib/BrandingHelper.ts
import { openDatabase, type StoreConfig } from "../../utils/indexedDb";
import {
  COMPANY_NAME,
  COMPANY_LOGO_URL,
  COMPANY_TITLE,
  COMPANY_DEVELOPED_BY,
  COMPANY_COPYRIGHT,
  COMPANY_REGISTRATION_DATE,
  COMPANY_CONTACT_EMAIL,
  COMPANY_CONTACT_PHONE,
  COMPANY_CONTACT_ADDRESS,
  COMPANY_WEBSITE,
  COMPANY_FACEBOOK,
  COMPANY_TWITTER,
  COMPANY_GOOGLE,
  COMPANY_INSTAGRAM,
  COMPANY_LINKEDIN,
  COMPANY_GITHUB,
  WL_COMPANY_NAME,
  WL_COMPANY_LOGO_URL,
  WL_COMPANY_TITLE,
  WL_COMPANY_DEVELOPED_BY,
  WL_COMPANY_COPYRIGHT,
  WL_COMPANY_REGISTRATION_DATE,
  WL_COMPANY_CONTACT_EMAIL,
  WL_COMPANY_CONTACT_PHONE,
  WL_COMPANY_CONTACT_ADDRESS,
  WL_COMPANY_WEBSITE,
  WL_COMPANY_FACEBOOK,
  WL_COMPANY_TWITTER,
  WL_COMPANY_GOOGLE,
  WL_COMPANY_INSTAGRAM,
  WL_COMPANY_LINKEDIN,
  WL_COMPANY_GITHUB,
} from "../../constants/constants";

// Configuração do IndexedDB para branding
const DB_NAME = "wl-db";
const STORE_NAME = "config";
const DB_VERSION = 2;
const KEY = "config";
const CONFIG_STORE: StoreConfig = { name: STORE_NAME };

// Interface para configuração de branding
export interface BrandingConfig {
  logo: string;
  companyName: string;
  title: string;
  developedBy: string;
  copyright: string;
  registrationDate: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactWebsite: string;
  linkFacebook: string;
  linkTwitter: string;
  linkGoogle: string;
  linkInstagram: string;
  linkLinkedin: string;
  linkGithub: string;
}

// Configuração padrão para MBRA
export const DEFAULT_CONFIG: BrandingConfig = {
  logo: COMPANY_LOGO_URL,
  companyName: COMPANY_NAME,
  title: COMPANY_TITLE,
  developedBy: COMPANY_DEVELOPED_BY,
  copyright: COMPANY_COPYRIGHT,
  registrationDate: COMPANY_REGISTRATION_DATE,
  contactEmail: COMPANY_CONTACT_EMAIL,
  contactPhone: COMPANY_CONTACT_PHONE,
  contactAddress: COMPANY_CONTACT_ADDRESS,
  contactWebsite: COMPANY_WEBSITE,
  linkFacebook: COMPANY_FACEBOOK,
  linkTwitter: COMPANY_TWITTER,
  linkGoogle: COMPANY_GOOGLE,
  linkInstagram: COMPANY_INSTAGRAM,
  linkLinkedin: COMPANY_LINKEDIN,
  linkGithub: COMPANY_GITHUB,
};

// Configuração genérica para white-label
export const WHITE_LABEL_CONFIG: BrandingConfig = {
  logo: WL_COMPANY_LOGO_URL,
  companyName: WL_COMPANY_NAME,
  title: WL_COMPANY_TITLE,
  developedBy: WL_COMPANY_DEVELOPED_BY,
  copyright: WL_COMPANY_COPYRIGHT,
  registrationDate: WL_COMPANY_REGISTRATION_DATE,
  contactEmail: WL_COMPANY_CONTACT_EMAIL,
  contactPhone: WL_COMPANY_CONTACT_PHONE,
  contactAddress: WL_COMPANY_CONTACT_ADDRESS,
  contactWebsite: WL_COMPANY_WEBSITE,
  linkFacebook: WL_COMPANY_FACEBOOK,
  linkTwitter: WL_COMPANY_TWITTER,
  linkGoogle: WL_COMPANY_GOOGLE,
  linkInstagram: WL_COMPANY_INSTAGRAM,
  linkLinkedin: WL_COMPANY_LINKEDIN,
  linkGithub: WL_COMPANY_GITHUB,
};

// Função para abrir o banco de dados
async function openDB(): Promise<IDBDatabase> {
  return openDatabase(DB_NAME, DB_VERSION, CONFIG_STORE);
}

// Função para obter valor do IndexedDB
async function wlGet<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(key) as IDBRequest<T | undefined>;
    getReq.onsuccess = () => resolve(getReq.result ?? null);
    getReq.onerror = () => reject(getReq.error);
  });
}

// Função para salvar valor no IndexedDB
async function wlSet<T>(key: string, value: T): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(value, key);
    putReq.onsuccess = () => resolve(true);
    putReq.onerror = () => reject(putReq.error);
  });
}

// Função para salvar configuração
export async function saveConfig(config: BrandingConfig): Promise<boolean> {
  return wlSet(KEY, config);
}

// Função para carregar configuração com suporte a múltiplos usuários
export async function loadConfig(): Promise<BrandingConfig> {
  try {
    const savedConfig = await wlGet<BrandingConfig>(KEY);

    // Se não há configuração salva, retornar a configuração padrão
    if (!savedConfig) {
      return DEFAULT_CONFIG;
    }

    // Mesclar configuração salva com padrão para garantir que todos os campos estejam presentes
    return { ...DEFAULT_CONFIG, ...savedConfig };
  } catch (error) {
    console.warn("Error loading branding config, using default:", error);
    return DEFAULT_CONFIG;
  }
}

// Função para carregar configuração específica de usuário
export async function loadUserConfig(userId: string): Promise<BrandingConfig> {
  try {
    const userConfigKey = `${KEY}_user_${userId}`;
    const userConfig = await wlGet<BrandingConfig>(userConfigKey);

    if (userConfig) {
      // Mesclar com configuração padrão
      return { ...DEFAULT_CONFIG, ...userConfig };
    }

    // Fallback para configuração global
    return await loadConfig();
  } catch (error) {
    console.warn(
      `Error loading user config for ${userId}, using default:`,
      error,
    );
    return DEFAULT_CONFIG;
  }
}

// Função para salvar configuração específica de usuário
export async function saveUserConfig(
  userId: string,
  config: BrandingConfig,
): Promise<boolean> {
  try {
    const userConfigKey = `${KEY}_user_${userId}`;
    return await wlSet(userConfigKey, config);
  } catch (error) {
    console.error(`Error saving user config for ${userId}:`, error);
    return false;
  }
}

// Função para exportar configuração
export async function exportConfig(
  filename: string = "config.json",
): Promise<void> {
  const config = await loadConfig();
  if (!config) return;

  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Função para importar configuração
export async function importConfig(file: File): Promise<BrandingConfig> {
  const text = await readFile(file);
  const config = JSON.parse(text) as BrandingConfig;
  await saveConfig(config);
  return config;
}

// Função auxiliar para ler arquivo
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsText(file);
  });
}

// Função para validar configuração
export function validateConfig(config: BrandingConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar campos obrigatórios
  if (!config.companyName || config.companyName.trim().length < 2) {
    errors.push("Nome da empresa deve ter pelo menos 2 caracteres");
  }

  if (!config.title || config.title.trim().length < 3) {
    errors.push("Título deve ter pelo menos 3 caracteres");
  }

  if (!config.developedBy || config.developedBy.trim().length < 2) {
    errors.push("Desenvolvido por deve ter pelo menos 2 caracteres");
  }

  if (!config.copyright || config.copyright.trim().length < 3) {
    errors.push("Copyright deve ter pelo menos 3 caracteres");
  }

  if (!config.registrationDate) {
    errors.push("Data de registro é obrigatória");
  }

  if (!config.contactEmail) {
    errors.push("Email de contato é obrigatório");
  }

  // Validar formato de email
  if (config.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.contactEmail)) {
      errors.push("Email de contato inválido");
    }
  }

  // Validar URLs
  const urlFields: (keyof BrandingConfig)[] = [
    "logo",
    "contactWebsite",
    "linkFacebook",
    "linkTwitter",
    "linkGoogle",
    "linkInstagram",
    "linkLinkedin",
    "linkGithub",
  ];

  urlFields.forEach((field) => {
    const value = config[field];
    if (value && value.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        errors.push(
          `${field} deve ser uma URL válida começando com http:// ou https://`,
        );
      }
    }
  });

  // Validar data de registro
  if (config.registrationDate) {
    const selectedDate = new Date(config.registrationDate);
    const maxDate = new Date("2024-12-31");
    if (selectedDate > maxDate) {
      errors.push("Data de registro não pode ser futura");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Função para aplicar configuração padrão
export async function resetToDefaultConfig(): Promise<BrandingConfig> {
  await saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// Função para aplicar configuração de white-label
export async function applyWhiteLabelConfig(): Promise<BrandingConfig> {
  await saveConfig(WHITE_LABEL_CONFIG);
  return WHITE_LABEL_CONFIG;
}

// Função para obter configuração atual ou padrão
export async function getCurrentConfig(): Promise<BrandingConfig> {
  try {
    return await loadConfig();
  } catch (error) {
    console.warn("Erro ao carregar configuração, usando padrão:", error);
    return DEFAULT_CONFIG;
  }
}

// Função para sincronizar configuração com variáveis VITE do docker-compose
export function syncWithViteVariables(): BrandingConfig {
  console.log(
    "Syncing branding with VITE environment variables from docker-compose",
  );

  // Get current environment variables - these come from docker-compose.yml
  const viteCompanyName = import.meta.env.VITE_COMPANY_NAME;
  const viteCompanyLogo = import.meta.env.VITE_COMPANY_LOGO_URL;
  const viteCompanyTitle = import.meta.env.VITE_COMPANY_TITLE;
  const viteCompanyDeveloped = import.meta.env.VITE_COMPANY_DEVELOPED_BY;
  const viteCompanyCopyright = import.meta.env.VITE_COMPANY_COPYRIGHT;
  const viteCompanyEmail = import.meta.env.VITE_COMPANY_CONTACT_EMAIL;
  const viteCompanyPhone = import.meta.env.VITE_COMPANY_CONTACT_PHONE;
  const viteCompanyWebsite = import.meta.env.VITE_COMPANY_WEBSITE;

  // Build configuration from environment variables with fallbacks
  const envConfig: BrandingConfig = {
    logo: viteCompanyLogo || DEFAULT_CONFIG.logo,
    companyName: viteCompanyName || DEFAULT_CONFIG.companyName,
    title: viteCompanyTitle || DEFAULT_CONFIG.title,
    developedBy: viteCompanyDeveloped || DEFAULT_CONFIG.developedBy,
    copyright: viteCompanyCopyright || DEFAULT_CONFIG.copyright,
    registrationDate: DEFAULT_CONFIG.registrationDate,
    contactEmail: viteCompanyEmail || DEFAULT_CONFIG.contactEmail,
    contactPhone: viteCompanyPhone || DEFAULT_CONFIG.contactPhone,
    contactAddress: DEFAULT_CONFIG.contactAddress,
    contactWebsite: viteCompanyWebsite || DEFAULT_CONFIG.contactWebsite,
    linkFacebook: DEFAULT_CONFIG.linkFacebook,
    linkTwitter: DEFAULT_CONFIG.linkTwitter,
    linkGoogle: DEFAULT_CONFIG.linkGoogle,
    linkInstagram: DEFAULT_CONFIG.linkInstagram,
    linkLinkedin: DEFAULT_CONFIG.linkLinkedin,
    linkGithub: DEFAULT_CONFIG.linkGithub,
  };

  return envConfig;
}

// Função para aplicar configuração sincronizada com as variáveis de ambiente
export async function applySyncedConfig(): Promise<BrandingConfig> {
  const syncedConfig = syncWithViteVariables();
  const validationResult = validateConfig(syncedConfig);

  if (!validationResult.isValid) {
    console.warn(
      "Synced config validation failed, using defaults:",
      validationResult.errors,
    );
    return DEFAULT_CONFIG;
  }

  // Save synced configuration
  await saveConfig(syncedConfig);
  return syncedConfig;
}

// Função para validar e corrigir configuração com fallbacks seguros
export function validateAndFixConfig(
  config: Partial<BrandingConfig>,
): BrandingConfig {
  const fixedConfig: BrandingConfig = { ...DEFAULT_CONFIG };

  // Apply valid values from input config
  if (config.companyName && config.companyName.trim().length >= 2) {
    fixedConfig.companyName = config.companyName.trim();
  }

  if (config.title && config.title.trim().length >= 2) {
    fixedConfig.title = config.title.trim();
  }

  if (config.logo && isValidUrl(config.logo)) {
    fixedConfig.logo = config.logo;
  }

  if (config.contactEmail && isValidEmail(config.contactEmail)) {
    fixedConfig.contactEmail = config.contactEmail;
  }

  if (config.contactWebsite && isValidUrl(config.contactWebsite)) {
    fixedConfig.contactWebsite = config.contactWebsite;
  }

  // Apply other safe string fields
  const safeStringFields: (keyof BrandingConfig)[] = [
    "developedBy",
    "copyright",
    "contactPhone",
    "contactAddress",
  ];

  safeStringFields.forEach((field) => {
    if (config[field] && typeof config[field] === "string") {
      fixedConfig[field] = config[field] as string;
    }
  });

  return fixedConfig;
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

// Helper function to validate emails
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para detectar mudanças nas variáveis VITE e recarregar configuração
export async function autoSyncWithEnvironment(): Promise<{
  updated: boolean;
  config: BrandingConfig;
  changes?: string[];
}> {
  const currentConfig = await loadConfig();
  const envConfig = syncWithViteVariables();

  // Compare configurations to detect changes
  const changes: string[] = [];

  Object.keys(envConfig).forEach((key) => {
    const configKey = key as keyof BrandingConfig;
    if (currentConfig[configKey] !== envConfig[configKey]) {
      changes.push(configKey);
    }
  });

  if (changes.length > 0) {
    console.log("Environment variables changed, updating branding:", changes);
    await saveConfig(envConfig);
    return {
      updated: true,
      config: envConfig,
      changes,
    };
  }

  return {
    updated: false,
    config: currentConfig,
  };
}
