import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "./utils";
import { AptosUserAssetData } from "./type";

export function useTransaction() {
  const {
    account,
    network,
    signAndSubmitTransaction,
  } = useWallet();

  const getCoinBalance = async () => {
    if (!account || !network) {
      throw new Error("no wallet connect");
    }
    const result = await aptosClient(network.name.toLowerCase()).getAccountCoinsData({
      accountAddress: account.address,
    })
    return result
  }

  /**
   * 
   * @param address 转账地址
   * @param amount 转账的数量，需要带精度
   * @param coinType 转账的 Token 类型
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
      await aptosClient(network?.name.toLowerCase()).waitForTransaction({ transactionHash: response.hash });
      //交易成功 => 返回结果
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    getCoinBalance,
    transfer
  }
}