import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, MenuItem } from '@mui/material'
import i18n from '../../../../i18n/_'
import { FormattedNumber } from '../../common/FormattedNumber'
import { UserToken } from '../../../../stores/user-asset-store'
import imageMap from '../../../../images/imageMap'

interface ITransferModalSelectItemProps {
  value: string
  isRenderInSelect?: boolean
  ['data-value']?: string
  currentReserve?: UserToken
}
const SelectItems = [
  {
    icon: imageMap.transfer.transferFromDefedBalance,
    value: 'defed',
    title: i18n.t('From DEFED Balance'),
  },
  {
    icon: imageMap.transfer.transferFromCreditBalance,
    value: 'credit',
    title: i18n.t('From Credit Balance'),
  },
]
const TransferModalSelectItem: React.FC<ITransferModalSelectItemProps> = (props) => {
  const { value, isRenderInSelect = false, currentReserve, ...otherProps } = props
  const { t } = useTranslation()
  const currentSelectItem = useMemo(() => SelectItems.find((item) => item.value === (props['data-value'] || value)), [props, value])
  const renderContent = () => {
    if (!currentSelectItem) return null
    return (
      <>
        <Box
          src={currentSelectItem.icon}
          component="img"
          sx={{
            width: { xs: '36px', xsm: '40px' },
            height: { xs: '36px', xsm: '40px' },
            marginRight: '10px',
          }}
        />
        <Box>
          <Box
            sx={{
              fontWeight: 500,
              fontSize: { xs: '14px', xsm: '16px' },
              color: '#141416',
            }}
          >
            {currentSelectItem.title}
          </Box>
          {isRenderInSelect && currentReserve ? (
            <Box
              sx={{
                fontSize: { xs: '12px', xsm: '14px' },
                color: '#777E90',
                fontWeight: 400,
              }}
            >
              <Box
                component="span"
                sx={{
                  marginRight: '4px',
                }}
              >
                {t('available')}
              </Box>
              <FormattedNumber value={value === 'defed' ? currentReserve.amountDecimal : currentReserve.creditBalance} visibleDecimals={4} sx={{ mr: 1, fontSize: { xs: '14px', lg: '16px' } }} floor />
              {currentReserve.tokenSymbol}
            </Box>
          ) : null}
        </Box>
      </>
    )
  }
  return isRenderInSelect ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {renderContent()}
    </Box>
  ) : (
    <MenuItem {...otherProps} value={value}>
      {renderContent()}
    </MenuItem>
  )
}
export default TransferModalSelectItem
