import { Box, SelectChangeEvent } from "@mui/material";
import { AptosTransferStepOne } from "./TransferStepOne"
import { AptosTransferStepTwo } from "./TransferStepTwo"
import React, { useMemo, useState } from "react";
import { AccountAddress, APTOS_COIN } from "@aptos-labs/ts-sdk";
import TransferSvg from '../../../../public/aptos/Transfer.svg?react'
import { useTransaction } from "../../hooks/aptos/useTransaction"
import { AptosUserAssetData, BASE_COIN_DATA } from "../../hooks/aptos/type"
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosTransferStepThree } from "./TransferStepThree";
import { valueToBigNumber } from "../../utils/math-utils-v2";
import { formatAmount } from "../../hooks/aptos/utils";
import snackbarUtils from '../../../util/SnackbarUtils'

//aiSelectTokenSymbol 通过 AI 识别出的 aiSelectTokenSymbol
export function AptosTransfer({
  aiTokenSymbol,
  aiInputAmount,
  aiToAddress,
}: {
  aiTokenSymbol?: string
  aiInputAmount?: string
  aiToAddress?: string
}) {
  const { account, network } = useWallet()

  const { getCoinBalance, transfer, userAsset } = useTransaction()

  const [step, setStep] = useState(1)

  //aiTokenSymbol => token 地址
  const [selectCoin, setSelectCoin] = useState(aiTokenSymbol || APTOS_COIN)

  //账户持有的所有 token
  const userHoldCoinList: AptosUserAssetData[] = useMemo(() => {
    if (!userAsset) return []
    if (userAsset.length === 0) return [BASE_COIN_DATA]
    return userAsset
  }, [userAsset])

  const selectCoinData = useMemo(() => {
    return userHoldCoinList.find((asset) => asset.asset_type === selectCoin) || BASE_COIN_DATA
  }, [userHoldCoinList, selectCoin])

  const [sendAmount, setSendAmount] = useState(aiInputAmount || '')
  const [toAddress, setToAddress] = useState(aiToAddress || '')
  const [percentage, setPercentage] = useState(0)

  const handleSelectCoin = (event: SelectChangeEvent) => {
    setSelectCoin(event.target.value)
    setSendAmount('')
  }

  const changeAmountByBar = (value: number) => {
    // const computedAmount = valueToBigNumber(maxAmountToTransfer).times(value).shiftedBy(-2).toFixed(4, 1)
    // setSendAmount(computedAmount)
  }

  const handleNext = () => {
    if (!sendAmount || !toAddress || !selectCoinData) return
    //校验余额是否足够
    const inputAmount = valueToBigNumber(sendAmount).shiftedBy(selectCoinData.metadata.decimals)
    if (inputAmount.gt(selectCoinData.amount)) {
      //转账的数量大于了余额
      snackbarUtils.error('The amount transferred exceeds the balance')
      return
    }
    //校验地址是否合法
    const result = AccountAddress.isValid({ input: toAddress, strict: true })
    if (result.valid === false) {
      //转账地址不合法
      snackbarUtils.error('Invalid transfer address')
      return
    }
    setStep(2)
  }

  //确认转账
  const [txHash, setTxHash] = useState('')
  const handleConfirm = () => {
    if (!toAddress || !sendAmount) return
    //sendAmount + 精度
    const amount = valueToBigNumber(sendAmount).shiftedBy(selectCoinData.metadata.decimals).toFixed(0, 1)

    transfer({
      address: toAddress,
      amount,
      coinType: selectCoinData.asset_type,
    }).then((result) => {
      // result 包含交易 hash 和输出结果
      // console.log(result)
      //刷新余额
      getCoinBalance()
      setTxHash(result.hash)
      setStep(3)
    }).catch((error: Error) => {
      snackbarUtils.error(error.message)
    })
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <Box sx={{
      p: 4,
      borderRadius: '0 8px 8px',
      bgcolor: '#fff',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <Box>
          <TransferSvg />
        </Box>

        <Box sx={{
          ml: 'auto',
          fontSize: '12px',
          color: '#25B1FF'
        }}>
          BALANCE: {formatAmount(selectCoinData)}
        </Box>
      </Box>

      {step === 1 ? (
        <AptosTransferStepOne
          handleNext={handleNext}
          setToAddress={setToAddress}
          toAddress={toAddress}
          sendAmount={sendAmount}
          setSendAmount={setSendAmount}
          percentage={percentage}
          setPercentage={setPercentage}
          changeAmountByBar={changeAmountByBar}
          handleSelectCoin={handleSelectCoin}
          selectCoin={selectCoin}
          userHoldCoinList={userHoldCoinList}
          selectCoinData={selectCoinData}
        />
      ) : step === 2 ? (
        <AptosTransferStepTwo
          handleBack={handleBack}
          toAddress={toAddress}
          fromAddress={account?.address}
          handleConfirm={handleConfirm}
          sendAmount={sendAmount}
          selectCoinData={selectCoinData}
        />
      ) : (
        <AptosTransferStepThree
          toAddress={toAddress}
          fromAddress={account?.address}
          coin={selectCoinData.metadata.symbol}
          sendAmount={sendAmount}
          txHash={txHash}
          networkName={network?.name}
        />
      )}
    </Box>
  )
}