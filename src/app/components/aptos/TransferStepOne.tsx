import { Box, Button, InputBase } from "@mui/material";
import React from "react";
import TransferSvg from '../../../../public/aptos/Transfer.svg?react'

export function AptosTransferStepOne({
  handleNext
}: {
  handleNext: () => void;
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

      <TransferInput label="Token" />

      <TransferInput label="Amount" />

      <TransferInput label="Address" />

      <Box sx={{ display: 'flex', mt: 6 }}>
        <Button sx={{
          bgcolor: '#25B1FF',
          borderRadius: '8px',
          height: 34,
          width: 150,
          color: '#fff',
          fontSize: '14px',
          m: 'auto',
          fontWeight: 700,
          ':hover': {
            bgcolor: '#25B1FF',
            opacity: '.8',
          }
        }} onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

function TransferInput({
  label
}: {
  label: string
}) {
  return (
    <Box sx={{ mt: 4, fontSize: '14px' }}>
      <Box sx={{ mb: 2 }}>{label}</Box>

      <Box sx={{
        borderRadius: '8px',
        px: 2,
        height: 36,
        border: '1px solid #F0F5FA',
        bgcolor: '#FAFAFA'
      }}>
        <InputBase fullWidth sx={{ height: 36 }} />
      </Box>
    </Box>
  )
}