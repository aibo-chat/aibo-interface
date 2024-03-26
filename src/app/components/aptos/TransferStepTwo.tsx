import { Box, Button } from "@mui/material";
import React from "react";
import { formatAddress } from "../../hooks/aptos/utils";

export function AptosTransferStepTwo({
  handleBack,
  toAddress,
  fromAddress,
  handleConfirm
}: {
  handleBack: () => void
  toAddress: string
  fromAddress: string | undefined
  handleConfirm: () => void
}) {
  return (
    <Box>

      <InfoLabel label="From" value={formatAddress(fromAddress ?? '')} />

      <InfoLabel label="To" value={formatAddress(toAddress)} />

      <InfoLabel
        label="Total Cost(Amount+Fee)"
        value={'xxxx'}
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


function InfoLabel({ label, value }: { label: string; value: string }) {
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