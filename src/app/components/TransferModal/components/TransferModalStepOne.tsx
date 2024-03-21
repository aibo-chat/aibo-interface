import React from 'react'
import { Box, FormControl, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SelectInputProps } from '@mui/material/Select/SelectInput'
import TransferModalInput from './TransferModalInput'
import TransferModalSelectItem from './TransferModalSelectItem'
import { TransferState } from '../index'
import TransferModalNamePart from './TransferModalNamePart'
import { UserToken } from '../../../../stores/user-asset-store'

interface ITransferModalStepOneProps {
  currentReserve: UserToken
  transferState: TransferState
  handleChange: (value: string) => void
  maxAmountToTransfer: string
  handleChangeReserve: (token: string) => void
  handleTransferTypeChange: SelectInputProps<string>['onChange']
  canUseCredit: boolean
  isUSDInputMode: boolean
  changeEditMode: () => void
  isMobile?: boolean
  targetProxy: string
}

const TransferModalStepOne: React.FC<ITransferModalStepOneProps> = (props) => {
  const { currentReserve, targetProxy, transferState, handleChange, maxAmountToTransfer, handleChangeReserve, handleTransferTypeChange, canUseCredit, isUSDInputMode, changeEditMode, isMobile } = props
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <TransferModalNamePart proxy={targetProxy} />
      <TransferModalInput
        value={transferState.amount}
        onChange={handleChange}
        asset={currentReserve}
        maxValue={maxAmountToTransfer}
        onSelect={handleChangeReserve}
        isUSDInputMode={isUSDInputMode}
        changeEditMode={changeEditMode}
        isMobile={isMobile}
      />
      <FormControl fullWidth>
        <Select
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '12px',
                border: '1px solid #E6EBF0',
              },
            },
            MenuListProps: {
              sx: { paddingTop: 0, paddingBottom: 0 },
            },
          }}
          value={transferState.transferType}
          onChange={handleTransferTypeChange}
          inputProps={{ 'aria-label': t('Transfer Modal Select Input'), sx: { padding: '10px 12px' } }}
          sx={{ bgcolor: '#fff', fontSize: { xs: '14px', lg: '16px' } }}
          renderValue={(value) => <TransferModalSelectItem value={value} isRenderInSelect currentReserve={currentReserve} />}
        >
          <TransferModalSelectItem value="defed" />
          {canUseCredit ? <TransferModalSelectItem value="credit" /> : null}
        </Select>
      </FormControl>
    </Box>
  )
}
export default TransferModalStepOne
