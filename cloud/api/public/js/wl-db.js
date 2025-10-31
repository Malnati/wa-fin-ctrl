// public/js/wl-db.js

// Configuração unificada do IndexedDB
const DB_NAME = 'wl-db';
const STORE_NAME = 'config';
const DB_VERSION = 1;

// Chave "padrão" para salvar/ler a configuração completa (atalho)
const KEY = 'config';

// Abre (ou cria) o banco/loja
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- API "baixa" (chave/valor genérico) ----------

export async function wlGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(key);
    getReq.onsuccess = () => resolve(getReq.result ?? null);
    getReq.onerror = () => reject(getReq.error);
    // não fechamos db aqui; o GC do browser lida com isso
  });
}

export async function wlSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(value, key);
    putReq.onsuccess = () => resolve(true);
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function wlClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const clrReq = store.clear();
    clrReq.onsuccess = () => resolve(true);
    clrReq.onerror = () => reject(clrReq.error);
  });
}

// ---------- API "alta" (atalhos para config completa) ----------

export async function saveConfig(config) {
  return wlSet(KEY, config);
}

export async function loadConfig() {
  return wlGet(KEY);
}

export async function exportConfig(filename = 'config.json') {
  const config = await loadConfig();
  if (!config) return;
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importConfig(file) {
  const text = await readFile(file);
  const config = JSON.parse(text);
  await saveConfig(config);
  return config;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsText(file);
  });
}
