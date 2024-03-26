// import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import React, { FC, ReactNode } from "react";

const wallets = [
  // new PontemWallet(),
  new PetraWallet()
];

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error) => {
        console.log("Custom error handling", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};