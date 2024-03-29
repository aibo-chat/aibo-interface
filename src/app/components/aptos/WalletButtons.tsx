import React from "react";
import {
  useWallet,
  WalletReadyState,
  Wallet,
  isRedirectable,
  WalletName,
} from "@aptos-labs/wallet-adapter-react";

const WalletButtons = () => {
  const { wallets } = useWallet();

  return (
    <>
      {wallets.map((wallet: Wallet) => {
        return WalletView(wallet);
      })}
    </>
  );
};

const WalletView = (wallet: Wallet) => {
  const { connect } = useWallet();

  const isWalletReady =
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable;
  const mobileSupport = wallet.deeplinkProvider;

  const onWalletConnectRequest = async (walletName: WalletName) => {
    try {
      await connect(walletName);
    } catch (error: any) {
      console.error(error);
    }
  };

  if (!isWalletReady && isRedirectable()) {
    // wallet has mobile app
    if (mobileSupport) {
      return (
        <button
          disabled={false}
          key={wallet.name}
          onClick={() => onWalletConnectRequest(wallet.name)}
        >
          <>{wallet.name}</>
        </button>
      );
    }
    // wallet does not have mobile app
    return (
      <button
        disabled={true}
        key={wallet.name}
      >
        <>{wallet.name}</>
      </button>
    );
  } else {
    // we are on desktop view
    return (
      <button
        disabled={!isWalletReady}
        key={wallet.name}
        onClick={() => onWalletConnectRequest(wallet.name)}
        style={{
          margin: '0 24px',
          color: !isWalletReady ? 'red' : 'green'
        }}
      >
        <>{wallet.name} Wallet</>
      </button>
    );
  }
};

export default WalletButtons;