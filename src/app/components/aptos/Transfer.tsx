import { Box } from "@mui/material";
import { AptosTransferStepOne } from "./TransferStepOne"
import { AptosTransferStepTwo } from "./TransferStepTwo"
import React, { useEffect, useState } from "react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import TransferSvg from '../../../../public/aptos/Transfer.svg?react'
import { useTransaction } from "../../hooks/aptos/useTransaction"
import { AptosUserAssetData } from "../../hooks/aptos/type"
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosTransferStepThree } from "./TransferStepThree";
import { valueToBigNumber } from "../../utils/math-utils-v2";

const USDT_COIN = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT'

export function AptosTransfer() {

  const { account, network } = useWallet()

  const [step, setStep] = useState(1)

  const [sendAmount, setSendAmount] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [percentage, setPercentage] = useState(0)

  const changeAmountByBar = (value: number) => {
    // const computedAmount = valueToBigNumber(maxAmountToTransfer).times(value).shiftedBy(-2).toFixed(4, 1)
    // setSendAmount(computedAmount)
  }

  const handleNext = () => {
    if (!sendAmount || !toAddress) return
    //校验参数是否合法
    const result = AccountAddress.isValid({ input: toAddress, strict: true })
    console.log(result);
    if (result.valid === false) {
      return
    }
    setStep(2)
  }

  const handleConfirm = () => {
    setStep(3)
  }

  const handleBack = () => {
    setStep(1)
  }

  const { getCoinBalance, transfer } = useTransaction()
  const [userAsset, setUserAsset] = useState<AptosUserAssetData[]>()

  useEffect(() => {
    if (account?.address && network?.name) {
      getCoinBalance().then((data: any) => {
        setUserAsset(data)
      }).catch((error) => {
        console.log(error);
      })
    } else {
      setUserAsset(undefined)
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
          BALANCE: 0
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
        />
      ) : step === 2 ? (
        <AptosTransferStepTwo
          handleBack={handleBack}
          toAddress={toAddress}
          fromAddress={account?.address}
          handleConfirm={handleConfirm}
        />
      ) : (
        <AptosTransferStepThree
          toAddress={toAddress}
          fromAddress={account?.address}
        />
      )}
    </Box>
  )
}