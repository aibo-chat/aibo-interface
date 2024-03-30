import { useMemo } from 'react'
import rawTokenListJson from './pancakeToken.json'
import { useTransaction } from './useTransaction'
import { valueToBigNumber } from '../../utils/math-utils-v2'
import { getRouter } from '../../../api/aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptosClient } from './utils';
import CryptoJS from 'crypto-js'

type TxPayloadCallFunction = {
  type: 'entry_function_payload';
  function: string;
  type_arguments: string[];
  arguments: string[];
};

export interface IConvertTokenList {
  balance: number;
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
  address: string; // token 的地址，用于做唯一标识符
  logoURI: string;
}

interface IBaiceEstimateParams {
  from_token: string
  to_token: string
  amount: string
  by_amount_in?: boolean
  slippage?: number
  allow_split?: boolean
}

export interface IEstimateParams extends IBaiceEstimateParams {
  sender_address: string
  request_id: string
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

  const estimateToAmount = async ({
    from_token,
    to_token,
    amount,
    allow_split = true,
    by_amount_in = true,
    slippage = 50,
  }: IBaiceEstimateParams) => {

    const sender_address = account?.publicKey as string || ''
    const request_id = CryptoJS.SHA256(sender_address + Date.now()).toString()

    console.log({
      from_token,
      to_token,
      amount,
      sender_address,
      request_id,
      slippage,
      by_amount_in,
      allow_split
    })

    // const result = await getRouter({
    //   from_token,
    //   to_token,
    //   amount,
    //   allow_split,
    //   by_amount_in,
    //   slippage,
    //   sender_address,
    //   request_id
    // })
    // return result
  }

  const signConvertTx = async (transaction: TxPayloadCallFunction) => {
    if (!account || !network) return

    try {
      //@ts-ignore
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