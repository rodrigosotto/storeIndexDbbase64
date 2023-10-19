import { Component, AfterViewInit, OnInit } from '@angular/core';
import { IndexdbService } from './services/indexdb.service';
import { Imagem } from './models/image.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnInit {
  // Defina o tipo de imagesBase64 como um array de Imagem
  imagesBase64: Imagem[] = [];

  constructor(private indexedDBService: IndexdbService) {}
  ngOnInit(): void {
    this.removeOldImageElements();

    this.indexedDBService
      .initDB()
      .then(() => {
        return this.indexedDBService.getImagesFromDB();
      })
      .then((images: string[]) => {
        // Converte os dados do IndexedDB em objetos do tipo Imagem
        this.imagesBase64 = images.map((base64String) => {
          return {
            id: 'angular-logo', // ou qualquer outro identificador que você precise usar
            imagem: base64String,
          };
        });

        this.checkAndUpdateImage();
      })
      .catch((error) => {
        console.error('Erro ao recuperar imagens do IndexedDB:', error);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const angularLogoElement = document.getElementById(
        'img1'
      ) as HTMLImageElement;
      const angularLogoBase64 =
        this.getBase64FromImageElement(angularLogoElement);
      const imageIdentifier = 'angular-logo'; // Identificador associado à imagem

      // Salve a imagem no IndexedDB
      this.indexedDBService
        .saveImage(imageIdentifier, angularLogoBase64)
        .then(() => {
          console.log('Angular Logo salvo com sucesso no IndexedDB.');
        })
        .catch((error) => {
          console.error('Erro ao salvar Angular Logo no IndexedDB:', error);
        });

      this.indexedDBService
        .initDB()
        .then(() => {
          return this.indexedDBService.getImagesFromDB();
        })
        .then((images: string[]) => {
          this.imagesBase64 = images.map((base64String) => {
            return {
              id: 'angular-logo', // ou qualquer outro identificador que você precise usar
              imagem: base64String,
            };
          });
          this.replaceImagesInHTML(images);
          this.removeOldImageElements();
        })
        .catch((error) => {
          console.error('Erro ao recuperar imagens do IndexedDB:', error);
        });
    }, 3000);
  }
  // checkAndUpdateImage(): void {
  //   console.log('Função checkAndUpdateImage() chamada.'); // Debug

  //   // Verifica se a imagem já existe no IndexedDB e se o base64 é igual ao que está no HTML
  //   if (
  //     this.imagesBase64.length > 0 &&
  //     this.imagesBase64[0] === 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=='
  //   ) {
  //     console.log('Condição satisfeita. Substituindo a imagem.'); // Debug

  //     // Substitui a imagem no HTML pelo base64 do IndexedDB
  //     const imgElement = document.getElementById('img1') as HTMLImageElement;
  //     imgElement.src = this.imagesBase64[0];
  //   } else {
  //     console.log('Condição não satisfeita. Não há substituição de imagem.'); // Debug
  //   }
  // }

  // ESTE ESTA FUNCIONANDO NAO DELETE
  // checkAndUpdateImage(): void {
  //   console.log('Função checkAndUpdateImage() chamada.'); // Debug

  //   Remove espaços em branco, tabulações e quebras de linha dos base64
  //   const base64FromHTML =
  //     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=='.trim();
  //   const base64FromIndexedDB =
  //     this.imagesBase64.length > 0 ? this.imagesBase64[0].trim() : '';

  //   console.log('Base64 do IndexedDB (após trim):', base64FromIndexedDB); // Debug
  //   console.log('Base64 do HTML (após trim):', base64FromHTML); // Debug

  //   if (base64FromIndexedDB === base64FromHTML) {
  //     console.log('Condição satisfeita. Substituindo a imagem.'); // Debug

  //     Substitui a imagem no HTML pelo base64 do IndexedDB
  //     const imgElement: any = document.getElementById(
  //       'img1'
  //     ) as HTMLImageElement;
  //     imgElement.src = this.imagesBase64[0];
  //   } else {
  //     console.log('Condição não satisfeita. Não há substituição de imagem.'); // Debug
  //   }
  // }
  checkAndUpdateImage(): void {
    console.log('Função checkAndUpdateImage() chamada.'); // Debug

    // Remove espaços em branco, tabulações e quebras de linha dos base64
    const base64FromHTML = '...'; // Base64 da imagem do HTML
    const imageId = 'angular-logo'; // ID da imagem associada

    // Encontra a imagem correspondente no IndexedDB pelo ID
    const indexedDBImage = this.imagesBase64.find((image) => image.id === imageId);

    if (indexedDBImage && indexedDBImage.imagem.trim() === base64FromHTML.trim()) {
      console.log('Condição satisfeita. Substituindo a imagem.'); // Debug

      // Substitui a imagem no HTML pelo base64 do IndexedDB
      const imgElement = document.getElementById('img1') as HTMLImageElement;
      imgElement.src = indexedDBImage.imagem;
    } else {
      console.log('Condição não satisfeita. Não há substituição de imagem.'); // Debug
    }
  }

  replaceImagesInHTML(imagesBase64FromDB: string[]): void {
    // Itera sobre os base64 do IndexedDB e substitui as imagens correspondentes no HTML
    imagesBase64FromDB.forEach((base64FromDB, index) => {
      const imgElement = document.createElement('img');
      imgElement.src = base64FromDB;

      console.log('IMG ELEMENTS->', imgElement.src);
      // Substitui a imagem no HTML (suponha que você tenha IDs únicos para as imagens no HTML)
      const existingImgElement: any = document.getElementById(
        `img${index + 1}`
      );
      if (existingImgElement) {
        existingImgElement.parentNode.replaceChild(
          imgElement,
          existingImgElement
        );
      }
    });
  }

  removeOldImageElements(): void {
    // Itera sobre os IDs dos elementos HTML que você deseja remover
    const elementsToRemove = ['img1', 'img2', 'img3']; // Adapte conforme necessário

    elementsToRemove.forEach((elementId: any) => {
      const elementToRemove: any = document.getElementById(elementId);
      if (elementToRemove) {
        const base64FromIndexedDB = this.imagesBase64.find(
          (entry) => entry.id === elementId
        );

        if (base64FromIndexedDB) {
          elementToRemove.parentNode.removeChild(elementToRemove);
        }
      }
    });
  }

  getBase64FromImageElement(imageElement: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    const ctx: any = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

    const base64 = canvas.toDataURL('image/png');
    return base64;
  }
}
