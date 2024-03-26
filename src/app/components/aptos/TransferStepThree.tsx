import { Box } from "@mui/material";
import React from "react";
import { formatAddress } from "../../hooks/aptos/utils";
import SuccessSvg from '../../../../public/aptos/Success.svg?react'
import LinkSvg from '../../../../public/aptos/Link.svg?react'

export function AptosTransferStepThree({
  toAddress,
  fromAddress,
}: {
  toAddress: string
  fromAddress: string | undefined
}) {
  return (
    <Box>
      <Box sx={{
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <SuccessSvg />
        <Box sx={{ mt: 3 }}>
          0.002 APT
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        mt: 6,
        bgcolor: '#FAFAFA',
        borderRadius: '8px',
        p: 4,
        fontSize: '14px',
        flexDirection: 'column'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#78828C' }}>From</span>
          <span>{formatAddress(fromAddress ?? '')}</span>
        </Box>

        <Box sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#78828C' }}>To</span>
          <span>{formatAddress(toAddress)}</span>
        </Box>

        <Box sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#78828C' }}>Tx hash</span>
          <span style={{ marginBottom: -2 }}><LinkSvg /></span>
        </Box>
      </Box>
    </Box>
  )
}