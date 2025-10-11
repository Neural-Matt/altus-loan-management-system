// Fallback shim for TS module resolution issue with react-dom/client
// If proper types load, this is ignored; otherwise it provides minimal declarations.
import type * as React from 'react';

declare module 'react-dom/client' {
  interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  interface RootOptions { onRecoverableError?: (error: any) => void }
  export function createRoot(container: Element | DocumentFragment, options?: RootOptions): Root;
}
