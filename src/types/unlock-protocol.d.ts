/**
 * @unlock-protocol/paywall y @unlock-protocol/networks no exponen su campo
 * "types" en package.json#exports, asi que TypeScript no los encuentra solo
 * (aunque el .d.ts si existe en node_modules). Declaracion ambiental minima
 * para no perder el tipado del resto del proyecto por ese detalle de empaquetado.
 */
declare module '@unlock-protocol/paywall' {
  export class Paywall {
    constructor(networks: Record<number, unknown>);
    connect(provider: unknown): void;
    loadCheckoutModal(paywallConfig: Record<string, unknown>): Promise<{ hash?: string; lock?: string } | undefined>;
    getProvider(accountsUrl?: string): unknown;
  }
}

declare module '@unlock-protocol/networks' {
  export const networks: Record<number, {
    id: number;
    name: string;
    unlockAddress: string;
    provider: string;
    [key: string]: unknown;
  }>;
}
