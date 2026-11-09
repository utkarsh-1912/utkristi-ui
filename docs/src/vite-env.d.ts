/// <reference types="vite/client" />

declare module 'virtual:utkristi-examples' {
  export const examples: Record<string, { code: string; components: string[] }>;
  export const api: Record<string, { name: string; type: string; required: boolean; description: string }[]>;
}

declare module 'virtual:utkristi-runtime' {
  export const script: string;
  export const styles: string;
}
