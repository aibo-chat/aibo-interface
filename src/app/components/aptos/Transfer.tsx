import { Box } from "@mui/material";
import { AptosTransferStepOne } from "./TransferStepOne"
import { AptosTransferStepTwo } from "./TransferStepTwo"
import React, { useState } from "react";

export function AptosTransfer() {
  const [step, setStep] = useState(1)

  const handleNext = () => {
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <Box>
      {step === 1 ? (
        <AptosTransferStepOne
          handleNext={handleNext}
        />
      ) : (
        <AptosTransferStepTwo
          handleBack={handleBack}
        />
      )}
    </Box>
  )
}