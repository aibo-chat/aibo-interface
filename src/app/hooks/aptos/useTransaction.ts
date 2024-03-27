import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "./utils";
import { Ed25519PublicKey } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { AptosUserAssetData } from "./type";

export function useTransaction() {
  const {
    account,
    network,
    signAndSubmitTransaction,
  } = useWallet();

  //账户资产列表
  const [userAsset, setUserAsset] = useState<AptosUserAssetData[]>()
  useEffect(() => {
    if (account?.address && network?.name) {
      getCoinBalance()
    } else {
      setUserAsset([])
    }
  }, [account?.address, network?.name])

  //获取用户已经注册过的 Token 余额列表
  const getCoinBalance = async () => {
    if (!account || !network) {
      throw new Error("no wallet connect");
    }
    const result = await aptosClient(network.name.toLowerCase()).getAccountCoinsData({
      accountAddress: account.address,
    }) as any
    setUserAsset(result)
  }

  /**
   * 
   * @param address 转账地址
   * @param amount 转账的数量，需要处理好精度
   * @param coinType 转账的 Token 类型（地址）
   */
  const transfer = async ({
    address,
    amount,
    coinType,
  }: {
    address: string
    amount: string
    coinType: string
  }) => {
    if (!account || !address || !amount || !coinType) return;

    const transaction: InputTransactionData = {
      data: {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [coinType],
        functionArguments: [address, amount],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      //开始 Pending
      await aptosClient(network?.name.toLowerCase()).waitForTransaction({ transactionHash: response.hash });
      //交易成功 => 返回交易的结果
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
  * 
  * @param address 转账地址
  * @param amount 转账的数量，需要处理好精度
  * @param coinType 转账的 Token 类型（地址）
  */
  const simulateTransferFee = async ({
    address,
    amount,
    coinType,
  }: {
    address: string
    amount: string
    coinType: string
  }) => {
    if (!account) return
    //构建交易
    const rawTx = await aptosClient(network?.name.toLowerCase()).transaction.build.simple({
      sender: account.address,
      data: {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [coinType],
        functionArguments: [address, amount],
      },
    })
    //模拟执行交易
    const data = await aptosClient(network?.name.toLowerCase()).transaction.simulate.simple({
      signerPublicKey: new Ed25519PublicKey(account.publicKey as string),
      transaction: rawTx,
      options: {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
      }
    })
    return data[0]
  }

  return {
    userAsset,
    getCoinBalance,
    transfer,
    simulateTransferFee
  }
}