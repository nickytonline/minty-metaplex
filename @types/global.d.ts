import { Wallet } from '@project-serum/anchor';

type PhantomEvents = 'connect';

export type PhantomResponse = {
  publicKey: { toString(): string };
};

export type SolanaProvider = {
  isPhantom: boolean;
  connect(options?: { onlyIfTrusted: boolean }): Promise<PhantomResponse>;
  on: (event: PhantomEvents, callback: (...args: any[]) => void) => void;
};
declare global {
  interface Window {
    solana: SolanaProvider & Wallet;
  }
}
