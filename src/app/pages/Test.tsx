import React from "react"
import WalletButtons from "../components/aptos/WalletButtons"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AptosTransfer } from "../components/aptos/Transfer"
import { formatAddress } from "../hooks/aptos/utils"

export function TestPage() {
  const { disconnect, connected, account } = useWallet()

  return (
    <div>
      {account?.address ? formatAddress(account.address) : <WalletButtons />}

      <br />
      <button onClick={() => {
        if (connected) {
          console.log('disconnect')
          disconnect()
        }
      }}>
        disconnect
      </button>

      <AptosTransfer aiInputAmount="0.3" aiTokenSymbol="USDT" />

    </div>
  )
}