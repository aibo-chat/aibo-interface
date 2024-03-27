import { Box, Button, CircularProgress } from "@mui/material";
import React, { ReactNode, useEffect, useState } from "react";
import { formatAddress } from "../../hooks/aptos/utils";
import { AptosUserAssetData } from "../../hooks/aptos/type";
import { useTransaction } from "../../hooks/aptos/useTransaction";
import { valueToBigNumber } from "../../utils/math-utils-v2";

export function AptosTransferStepTwo({
  handleBack,
  toAddress,
  fromAddress,
  handleConfirm,
  sendAmount,
  selectCoinData
}: {
  handleBack: () => void
  toAddress: string
  fromAddress: string | undefined
  handleConfirm: () => void
  sendAmount: string
  selectCoinData: AptosUserAssetData
}) {

  const { simulateTransferFee } = useTransaction()
  const [txFee, setTxFee] = useState('')

  const getTxFee = async () => {
    const amount = valueToBigNumber(sendAmount).shiftedBy(selectCoinData.metadata.decimals).toFixed(0, 1)
    const result = await simulateTransferFee({
      amount,
      address: toAddress,
      coinType: selectCoinData.asset_type
    })
    if (result) {
      // console.log('result', result);
      const { gas_unit_price, gas_used } = result
      const fee = valueToBigNumber(gas_unit_price).times(gas_used).shiftedBy(-8).toString()
      setTxFee(fee)
    }
  }

  useEffect(() => {
    getTxFee()
  }, [])

  return (
    <Box>

      <InfoLabel label="From" value={formatAddress(fromAddress ?? '')} />

      <InfoLabel label="To" value={formatAddress(toAddress)} />

      <InfoLabel
        label="Total Cost(Amount + Fee)"
        value={(
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <Box component={'span'}>
              {sendAmount} {selectCoinData.metadata.symbol} +
            </Box>
            <Box sx={{ ml: 1 }}>
              {!txFee ? (
                <CircularProgress color="inherit" size="16px" />
              ) : (
                <Box sx={{
                  bgcolor: '#BBEBFF',
                  fontSize: '12px',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                }}>
                  {txFee} APT
                </Box>
              )}
            </Box>
          </Box>
        )}
      />

      <Box sx={{ display: 'flex', mt: 6, justifyContent: 'space-between' }}>
        <Button sx={{
          bgcolor: '#fff',
          borderRadius: '8px',
          border: '1px solid #25B1FF',
          height: 34,
          width: 150,
          color: '#25B1FF',
          fontSize: '14px',
          fontWeight: 700,
          ':hover': {
            bgcolor: '#fff',
            opacity: '.8',
          }
        }} onClick={handleBack}>
          Back
        </Button>

        <Button onClick={handleConfirm} sx={{
          bgcolor: '#25B1FF',
          borderRadius: '8px',
          height: 34,
          width: 150,
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          ':hover': {
            bgcolor: '#25B1FF',
            opacity: '.8',
          }
        }}>
          Confirm
        </Button>
      </Box>
    </Box>
  )
}


function InfoLabel({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 1, color: '#78828C', fontSize: '14px' }}>
        {label}
      </Box>

      <Box sx={{
        height: 36,
        borderBottom: '1px solid #E6E9EC',
        display: 'flex',
        alignItems: 'center'
      }}>
        {value}
      </Box>
    </Box>
  )
}