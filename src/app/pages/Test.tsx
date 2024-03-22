import React, { useEffect, useState } from "react"
import WalletButtons from "../components/aptos/WalletButtons"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useTransaction } from "../hooks/aptos/useTransaction"
import { AptosUserAssetData } from "../hooks/aptos/type"

const USDT_COIN = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT'

export function TestPage() {
  const { disconnect, connected, account, network, wallet } = useWallet()
  // console.log('当前连接的钱包', wallet)

  const { getCoinBalance, transfer } = useTransaction()
  const [userAsset, setUserAsset] = useState<AptosUserAssetData[]>()
  // console.log(userAsset)

  useEffect(() => {
    if (account?.address && network?.name) {
      getCoinBalance().then((data: any) => {
        setUserAsset(data)
      }).catch((error) => {
        console.log(error);
      })
    }
  }, [account?.address, network?.name])

  const handleTransfer = () => {
    transfer({
      address: '0xa5e5c1d29207b0efb7cb05df7de84ebb49bd37f473c67803c82e91eabacde9',
      amount: '100000',
      coinType: USDT_COIN,
    }).then((result) => {
      console.log(result)
    }).catch((error: Error) => {
      console.error(error)
    })
  }

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
      <br />
      <button onClick={handleTransfer}>
        transfer
      </button>
    </div>
  )
}