/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Service de gestion de base de données locale (IndexedDB) pour le mode hors-ligne.
 * Protégé contre les plantages lors du rendu côté serveur (SSR).
 */
export class OfflineDB {
  private dbName = "epi-manager-offline";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  async init(): Promise<IDBDatabase | null> {
    if (!this.isBrowser()) return null;
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("Erreur d'ouverture d'IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("stock")) {
          db.createObjectStore("stock", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("queue")) {
          db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }

  async getStock(): Promise<any[]> {
    if (!this.isBrowser()) return [];
    try {
      const db = await this.init();
      if (!db) return [];
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("stock", "readonly");
        const store = transaction.objectStore("stock");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("Erreur lors de la récupération du stock en cache:", e);
      return [];
    }
  }

  async saveStock(items: any[]): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.init();
      if (!db) return;
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("stock", "readwrite");
        const store = transaction.objectStore("stock");
        
        store.clear(); // Vider le cache précédent
        for (const item of items) {
          store.put(item);
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du stock en cache:", e);
    }
  }

  async enqueueRequest(req: any): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.init();
      if (!db) return;
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("queue", "readwrite");
        const store = transaction.objectStore("queue");
        
        store.add({ ...req, queuedAt: new Date().toISOString() });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error("Erreur lors de la mise en file d'attente de la demande:", e);
      throw e;
    }
  }

  async getQueue(): Promise<any[]> {
    if (!this.isBrowser()) return [];
    try {
      const db = await this.init();
      if (!db) return [];
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("queue", "readonly");
        const store = transaction.objectStore("queue");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("Erreur lors de la récupération de la file d'attente:", e);
      return [];
    }
  }

  async dequeueRequest(id: number): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.init();
      if (!db) return;
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("queue", "readwrite");
        const store = transaction.objectStore("queue");
        
        store.delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error("Erreur lors de la suppression de la demande de la file d'attente:", e);
    }
  }
}

export const offlineDB = new OfflineDB();
