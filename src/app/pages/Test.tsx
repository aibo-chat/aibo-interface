import React from "react"
import WalletButtons from "../components/aptos/WalletButtons"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

export function TestPage() {
  const { disconnect, connected } = useWallet()

  console.log('connected', connected)

  return (
    <div>
      <WalletButtons />

      <button onClick={() => {
        if (connected) {
          console.log('disconnect')
          disconnect()
        }
      }}>
        disconnect
      </button>
    </div>
  )
}