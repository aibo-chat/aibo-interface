import { useMemo } from 'react'
import rawTokenListJson from './pancakeToken.json'
import { useTransaction } from './useTransaction'
import { valueToBigNumber } from '../../utils/math-utils-v2'
import { getRouter } from '../../../api/aptos';
import { InputTransactionData, useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptosClient } from './utils';

export interface IConvertTokenList {
  balance: number;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  address: string; // token 的地址，用于做唯一标识符
  logoURI: string;
}

export interface IEstimateParams {
  fromToken: string
  toToken: string
  byAmountIn: boolean
  amount: string
  allowMultiHops: boolean
  allowSplit: boolean
}

const rawTokenList = rawTokenListJson.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((item) => {
  return {
    ...item,
    balance: 0
  }
})

export function useConvert() {
  const { userAsset } = useTransaction()
  const { signAndSubmitTransaction, account, network } = useWallet()

  const convertTokenList: IConvertTokenList[] = useMemo(() => {
    if (!userAsset || userAsset.length === 0) return rawTokenList
    //data 存储用户对应 coin 地址的余额
    const balanceData: { [key: string]: number } = {}
    userAsset.forEach((coinData) => {
      const { amount, metadata: { decimals } } = coinData
      balanceData[coinData.asset_type] = valueToBigNumber(amount).shiftedBy(-decimals).toNumber()
    })
    const tokenListSortBySymbol = rawTokenList.map((item) => ({
      ...item,
      balance: balanceData[item.address] || 0
    }))
    //将有余额的数据按照symbol的字母顺序排序到前面
    return tokenListSortBySymbol.filter((item) => item.balance).concat(tokenListSortBySymbol.filter((item) => !item.balance))
  }, [userAsset])

  const estimateToAmount = async (params: IEstimateParams) => {
    const result = await getRouter(params)
    return result
  }

  const signConvertTx = async (transaction: InputTransactionData) => {
    if (!account || !network) return

    try {
      const response = await signAndSubmitTransaction(transaction);
      //开始 Pending
      await aptosClient(network.name.toLowerCase()).waitForTransaction({ transactionHash: response.hash });
      //交易成功 => 返回交易的结果
      return response;
    } catch (error) {
      throw error;
    }
  }

  return {
    convertTokenList,
    estimateToAmount,
    signConvertTx
  }
}