import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexdbService {
  private db: IDBDatabase | null = null;
  private objectStoreName = 'imagensB64';

  constructor() {
    this.initDB()
      .then(() => {
        console.log('Banco de dados inicializado com sucesso.');
      })
      .catch((error) => {
        console.error('Erro ao inicializar o banco de dados:', error);
      });
  }

  public async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('imageDB', 1);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.createObjectStore(this.objectStoreName, {
          autoIncrement: true,
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error(
          'Erro ao abrir o banco de dados:',
          (event.target as IDBOpenDBRequest).error
        );
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // saveImage(id: string, imagensB64: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     if (this.db) {
  //       const transaction = this.db.transaction(['imagensB64'], 'readwrite');
  //       const objectStore = transaction.objectStore('imagensB64');
  //       const request = objectStore.add({ id: id, imagensB64: imagensB64 });

  //       request.onsuccess = () => {
  //         console.log('Imagem salva com sucesso no IndexedDB.');
  //         resolve();
  //       };

  //       request.onerror = (event: any) => {
  //         console.error(
  //           'Erro ao salvar imagem no IndexedDB:',
  //           event.target.error
  //         );
  //         reject(event.target.error);
  //       };
  //     } else {
  //       console.error('Banco de dados não inicializado.');
  //       reject('Banco de dados não inicializado.');
  //     }
  //   });
  // }
  saveImage(id: string, imageBase64: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        const transaction = this.db.transaction(
          [this.objectStoreName],
          'readonly'
        );
        const objectStore = transaction.objectStore(this.objectStoreName);
        const request = objectStore.openCursor();
        let addRequest: IDBRequest<IDBValidKey> | null = null;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (cursor) {
            if (cursor.value.imagem === imageBase64) {
              console.log(
                'Imagem já existe no IndexedDB. Não será adicionada novamente.'
              );
              resolve();
              return;
            }
            cursor.continue();
          } else {
            // Se chegamos aqui, a imagem não foi encontrada, então podemos adicioná-la
            const addTransaction = this.db?.transaction(
              [this.objectStoreName],
              'readwrite'
            );
            const addObjectStore = addTransaction?.objectStore(
              this.objectStoreName
            );
            if (addObjectStore) {
              addRequest = addObjectStore.add({ id: id, imagem: imageBase64 });
              addRequest.onsuccess = () => {
                console.log('Imagem salva com sucesso no IndexedDB.');
                resolve();
              };

              addRequest.onerror = (event: any) => {
                console.error(
                  'Erro ao salvar imagem no IndexedDB:',
                  event.target.error
                );
                reject(event.target.error);
              };
            } else {
              console.error('Object Store não encontrado.');
              reject('Object Store não encontrado.');
            }
          }
        };

        request.onerror = (event: any) => {
          console.error(
            'Erro ao verificar imagens no IndexedDB:',
            event.target.error
          );
          reject(event.target.error);
        };
      } else {
        console.error('Banco de dados não inicializado.');
        reject('Banco de dados não inicializado.');
      }
    });
  }

  async getImagesFromDB(): Promise<string[]> {
    if (!this.db) {
      console.error('Banco de dados não inicializado.');
      throw new Error('Banco de dados não inicializado.');
    }

    const transaction = this.db.transaction([this.objectStoreName], 'readonly');
    const objectStore = transaction.objectStore(this.objectStoreName);
    const images: string[] = [];

    return new Promise<string[]>((resolve, reject) => {
      const cursorRequest = objectStore.openCursor();
      cursorRequest.onsuccess = async (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          images.push(cursor.value.imagem);
          cursor.continue();
        } else {
          resolve(images);
        }
      };

      cursorRequest.onerror = (event: any) => {
        console.error(
          'Erro ao recuperar imagensB64 do IndexedDB:',
          event.target.error
        );
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        console.log('ImagensB64 recuperadas com sucesso do IndexedDB.');
      };
    });
  }

}
