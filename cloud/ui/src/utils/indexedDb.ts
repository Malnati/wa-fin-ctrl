const MISSING_STORE_ERROR = "Object store not found after initialization.";
const DELETE_DB_ERROR = "Unable to recreate IndexedDB due to deletion failure.";
const RETRY_FLAG_INITIAL = false;
const RETRY_FLAG_FINAL = true;

export interface StoreIndexConfig {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface StoreConfig {
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: StoreIndexConfig[];
}

async function openDatabaseInternal(
  dbName: string,
  dbVersion: number,
  storeConfig: StoreConfig,
  hasRetried: boolean,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeConfig.name)) {
        const store = db.createObjectStore(
          storeConfig.name,
          storeConfig.options,
        );
        storeConfig.indexes?.forEach((index) => {
          store.createIndex(index.name, index.keyPath, index.options);
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeConfig.name)) {
        db.close();

        if (hasRetried === RETRY_FLAG_FINAL) {
          reject(new Error(MISSING_STORE_ERROR));
          return;
        }

        const deleteRequest = indexedDB.deleteDatabase(dbName);

        deleteRequest.onsuccess = () => {
          openDatabaseInternal(dbName, dbVersion, storeConfig, RETRY_FLAG_FINAL)
            .then(resolve)
            .catch(reject);
        };

        deleteRequest.onerror = () => {
          reject(deleteRequest.error ?? new Error(DELETE_DB_ERROR));
        };

        return;
      }

      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function openDatabase(
  dbName: string,
  dbVersion: number,
  storeConfig: StoreConfig,
): Promise<IDBDatabase> {
  return openDatabaseInternal(
    dbName,
    dbVersion,
    storeConfig,
    RETRY_FLAG_INITIAL,
  );
}
