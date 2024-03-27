import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box } from '@mui/material'

interface IStepTwoProps {}

const StepTwo: React.FC<IStepTwoProps> = () => (
  <Box
    sx={{
      width: '100%',
      height: '250px',
      backgroundColor: 'blue',
      marginTop: '12px',
      boxSizing: 'border-box',
    }}
  >
    2
  </Box>
)
export default observer(StepTwo)
