"use client"

export interface OfflineAction {
    id: string; // Unique ID, can be the requestId
    type: 'VALIDATE_REQUEST';
    payload: {
        requestId: string;
        signatureData?: string;
        employeeName: string;
    };
    timestamp: number;
}

const DB_NAME = 'epi-offline-db';
const STORE_NAME = 'offline-actions';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database.
 */
function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            return reject(new Error("IndexedDB is only available in the browser"));
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Adds an action to the offline queue.
 */
export async function addOfflineAction(action: OfflineAction): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(action);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Gets all pending offline actions, sorted by timestamp.
 */
export async function getOfflineActions(): Promise<OfflineAction[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const result = request.result || [];
            result.sort((a, b) => a.timestamp - b.timestamp);
            resolve(result);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Removes an action from the offline queue.
 */
export async function removeOfflineAction(id: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Gets the count of pending offline actions.
 */
export async function getOfflineQueueCount(): Promise<number> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
