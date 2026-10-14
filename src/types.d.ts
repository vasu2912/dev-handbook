declare module "@pagefind/default-ui" {
  export class PagefindUI {
    constructor(options: {
      element: HTMLElement;
      bundlePath: string;
      baseUrl: string;
      showSubResults: boolean;
      showImages: boolean;
      autofocus: boolean;
      translations: { placeholder: string };
    });
    destroy(): void;
  }
}
