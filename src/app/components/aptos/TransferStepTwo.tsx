import { Box, Button } from "@mui/material";
import React from "react";
import TransferSvg from '../../../../public/aptos/Transfer.svg?react'

export function AptosTransferStepTwo({
  handleBack
}: {
  handleBack: () => void
}) {
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

      <InfoLabel label="From" />

      <InfoLabel label="To" />

      <InfoLabel label="Total Cost(Amount+Fee)" />

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

        <Button sx={{
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


function InfoLabel({ label }: { label: string }) {
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
        0x000000
      </Box>
    </Box>
  )
}