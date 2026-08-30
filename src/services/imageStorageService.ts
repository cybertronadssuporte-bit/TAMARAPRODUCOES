/**
 * Serviço de Armazenamento de Imagens via IndexedDB
 * Permite salvar fotos selecionadas do computador, celular ou tablet sem sobrecarregar
 * o LocalStorage com strings base64 pesadas, retornando URLs persistentes.
 */

const DB_NAME = 'tamara_producoes_storage_v1';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;

class ImageStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  // Cache de Blob URLs em memória para renderização imediata
  private blobUrlCache: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
          reject(new Error('IndexedDB não suportado neste ambiente.'));
          return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event: any) => {
          resolve(event.target.result);
        };

        request.onerror = (event: any) => {
          reject(event.target.error);
        };
      });
    }
    return this.dbPromise;
  }

  /**
   * Salva um arquivo File selecionado pelo seletor nativo do dispositivo
   * e retorna uma URL estável para uso no site e banco de dados.
   */
  async saveFile(file: File): Promise<string> {
    const db = await this.getDB();
    const id = `storage_img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        createdAt: new Date().toISOString(),
      };

      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        // Criar Blob URL na memória do navegador
        const blobUrl = URL.createObjectURL(file);
        this.blobUrlCache.set(id, blobUrl);
        // Retorna o identificador persistente do storage
        resolve(`local-storage://${id}`);
      };

      putRequest.onerror = (e: any) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Resolve uma URL de imagem (seja externa https:// ou local-storage://id)
   * para uma URL diretamente utilizável na tag <img>
   */
  async resolveImageUrl(urlOrStorageKey: string): Promise<string> {
    if (!urlOrStorageKey) return '';
    if (!urlOrStorageKey.startsWith('local-storage://')) {
      return urlOrStorageKey; // URL web normal (unsplash, https, etc.)
    }

    const id = urlOrStorageKey.replace('local-storage://', '');

    // Se já estiver em cache na sessão atual, retorna imediatamente
    if (this.blobUrlCache.has(id)) {
      return this.blobUrlCache.get(id)!;
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = (e: any) => {
          const result = e.target.result;
          if (result && result.blob) {
            const blobUrl = URL.createObjectURL(result.blob);
            this.blobUrlCache.set(id, blobUrl);
            resolve(blobUrl);
          } else {
            resolve('');
          }
        };

        getRequest.onerror = () => {
          resolve('');
        };
      });
    } catch {
      return '';
    }
  }

  /**
   * Remove uma imagem do storage
   */
  async deleteFile(urlOrStorageKey: string): Promise<void> {
    if (!urlOrStorageKey || !urlOrStorageKey.startsWith('local-storage://')) {
      return;
    }
    const id = urlOrStorageKey.replace('local-storage://', '');
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      this.blobUrlCache.delete(id);
    } catch (e) {
      console.warn('Erro ao deletar imagem do storage:', e);
    }
  }
}

export const imageStorageService = new ImageStorageService();
