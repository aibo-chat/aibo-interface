import { useWallet } from "@aptos-labs/wallet-adapter-react";
import snackbarUtils from '../../../util/SnackbarUtils'

export function useConnectPetra() {
  const { connect, wallets } = useWallet()

  //检测用户是否下载了 petra 钱包
  const isInPetra = !!window.petra

  const connectPetraWallet = async () => {
    if (!isInPetra) {
      return snackbarUtils.error('Please connect wallet')
    }
    await connect(wallets[0].name)
  }

  return { connectPetraWallet }
}