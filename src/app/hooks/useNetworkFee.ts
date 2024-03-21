import Web3 from 'web3'
import { useEffect, useState } from 'react'
import NetworkFeeController from '../../abis/NetworkFee.json'
import { UserToken } from '../../stores/user-asset-store'
import { L2_NETWORK_FEE_CONTROLLER, L2_WEB3_URL } from '../../constant'
import { fromTokenAmount, normalize } from '../utils/math-utils-v2'

const networkFeeTransferMethod = '0xdbba0f01'
const networkFeeTransferCreditMethod = '0xffb2a8b5'
export function useNetworkFeeV2({ currentLoginAddress, reserve, amount, isSavingTransfer }: { currentLoginAddress?: string; reserve: UserToken | null; amount: string; isSavingTransfer: boolean }) {
  const web3 = new Web3(L2_WEB3_URL)
  const networkContract = new web3.eth.Contract(NetworkFeeController as any, L2_NETWORK_FEE_CONTROLLER)

  const [loading, setLoading] = useState(false)

  const [networkFee, setNetworkFee] = useState('0')

  const getNetworkFee = async (reserve: UserToken, amount: string, isSavingTransfer: boolean) => {
    setLoading(true)
    const txMethod = isSavingTransfer ? networkFeeTransferMethod : networkFeeTransferCreditMethod
    const amountWithDecimals = fromTokenAmount(amount, reserve.tokenDecimal).toFixed(0, 1)
    // @ts-ignore
    const netWordFeeToken = await networkContract.methods.getNetworkFee(currentLoginAddress, txMethod, reserve.vtokenAddress, amountWithDecimals).call()
    // console.log('netWorkFeeToken', netWordFeeToken)
    // @ts-ignore
    const _networkFee = normalize(netWordFeeToken[0], Number(reserve.tokenDecimal))

    setLoading(false)
    setNetworkFee(_networkFee)
  }

  useEffect(() => {
    if (currentLoginAddress && Number(amount) && reserve) {
      getNetworkFee(reserve, amount, isSavingTransfer)
    }
  }, [amount, isSavingTransfer, currentLoginAddress])

  return {
    loading,
    networkFee,
  }
}
