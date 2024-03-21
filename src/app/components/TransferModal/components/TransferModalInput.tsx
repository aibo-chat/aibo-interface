import { Box, InputBase, SelectChangeEvent, Select, MenuItem, Typography, ButtonBase } from '@mui/material'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'
import { UserToken } from '../../../../stores/user-asset-store'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { nativeToUSDWithoutDecimal, USDToNativeWithoutDecimal } from '../../../utils/math-utils-v2'
import { TokenIcon } from '../../common/TokenIcon'
import { FormattedNumber } from '../../common/FormattedNumber'
import imageMap from '../../../../images/imageMap'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
  value: string
  decimalScale: number
}

export const NumberFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>((props, ref) => {
  const { onChange, decimalScale, ...other } = props
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values: { value: string }) => {
        if (values.value !== props.value)
          onChange({
            target: {
              name: props.name,
              value: values.value || '',
            },
          })
      }}
      thousandSeparator
      valueIsNumericString
      decimalScale={decimalScale}
      allowNegative={false}
    />
  )
})
export interface ITransferModalInputProps {
  value: string
  onChange?: (value: string) => void
  asset: UserToken
  maxValue?: string
  onSelect: (token: string) => void
  isUSDInputMode: boolean
  changeEditMode: () => void
  isMobile?: boolean
}

const TransferModalInput: React.FC<ITransferModalInputProps> = (props) => {
  const { value, onChange, asset, maxValue, onSelect, isUSDInputMode, changeEditMode, isMobile } = props
  const {
    userAssetStore: { userAsset },
  } = useMobxStore()
  const usdValue = value ? nativeToUSDWithoutDecimal(value, asset.price) : ''

  const currentMaxValue = maxValue ? (isUSDInputMode ? nativeToUSDWithoutDecimal(maxValue, asset.price) : maxValue) : '0'
  const handleSelect = (event: SelectChangeEvent) => {
    onSelect && onSelect(event.target.value)
  }
  const scalePx = useMemo(() => {
    const maxValue = isMobile ? 40 : 80
    const minValue = isMobile ? 12 : 24
    let gapPx = 0
    const targetValue = isUSDInputMode ? usdValue : value
    if (targetValue?.length) {
      let integerPartLength: number
      let decimalPartLength = 0
      if (/\./.test(targetValue)) {
        const maxDecimalPartLength = isUSDInputMode ? 2 : 4
        decimalPartLength = Math.min(maxDecimalPartLength, targetValue.replace(/[\d,]*\./, '').length)
        integerPartLength = targetValue.replace(/\.[\d,]*/, '').length
      } else {
        integerPartLength = targetValue.length
      }
      const length = integerPartLength + decimalPartLength
      if (length <= 6) {
        gapPx = 0
      } else if (length <= 10) {
        gapPx = 14
      } else if (length <= 15) {
        gapPx = 28
      } else if (length <= 20) {
        gapPx = 42
      } else if (length <= 25) {
        gapPx = 56
      } else {
        gapPx = 68
      }
    }
    if (isMobile) {
      gapPx /= 2
    }
    return Math.max(minValue, maxValue - gapPx)
  }, [isMobile, isUSDInputMode, usdValue, value])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        height: { xs: '102px', xsm: '132px' },
        marginBottom: '24px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          padding: { xs: `0 62px`, xsm: `0 80px` },
        }}
      >
        <InputBase
          sx={{ '.MuiInputBase-input': { p: 0 }, textAlign: 'center', alignItems: 'baseline' }}
          placeholder="0.00"
          value={isUSDInputMode ? usdValue : value}
          autoFocus
          onChange={(e) => {
            if (!onChange) return
            const newValue = e.target.value
            if (isUSDInputMode) {
              onChange(newValue === '' ? '' : USDToNativeWithoutDecimal(newValue, asset.price))
            } else {
              onChange(newValue)
            }
          }}
          inputProps={{
            sx: {
              textAlign: 'center',
              fontSize: `${scalePx}px`,
              color: '#4685FF',
              height: { xs: '46px', xsm: '84px' },
            },
            decimalScale: isUSDInputMode ? 2 : 4,
            'aria-label': 'amount input',
            isAllowed: (values: { floatValue: number }) => {
              const { floatValue } = values
              if (floatValue === undefined) {
                return true
              }
              if (floatValue >= 0) {
                if (new BigNumber(floatValue).isLessThanOrEqualTo(new BigNumber(currentMaxValue))) {
                  return true
                }
                onChange?.('-1')
              }
              return false
            },
          }}
          inputComponent={NumberFormatCustom as any}
          startAdornment={
            isUSDInputMode ? (
              <Box
                sx={{
                  marginRight: { xs: '8px', xsm: '12px' },
                  fontSize: { xs: '20px', xsm: '40px' },
                  color: '#4685FF',
                }}
              >
                $
              </Box>
            ) : null
          }
          fullWidth={false}
        />
        <Select
          value={asset.vtokenAddress}
          onChange={handleSelect}
          variant="outlined"
          className="AssetInput__select"
          sx={{
            position: 'absolute',
            right: 0,
            p: 0,
            '&.AssetInput__select .MuiOutlinedInput-input': {
              p: 0,
              backgroundColor: 'transparent',
              pr: '24px !important',
            },
            '&.AssetInput__select .MuiOutlinedInput-notchedOutline': { display: 'none' },
          }}
          renderValue={() => (
            <Box>
              <TokenIcon symbol={asset.tokenName} sx={{ fontSize: { xs: '36px', lg: '48px' } }} />
            </Box>
          )}
        >
          {userAsset?.userTokenList?.map((asset, index) => (
            <MenuItem key={index} value={asset.vtokenAddress} sx={{ padding: { xs: '4px', xsm: '10px' } }}>
              <TokenIcon symbol={asset.tokenName} sx={{ fontSize: { xs: '36px', lg: '36px' }, mr: 1 }} />
              <Typography
                sx={{
                  fontSize: { xs: '12px', lg: '16px' },
                  color: '#323C46',
                  fontWeight: 500,
                }}
              >
                {asset.tokenSymbol}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FormattedNumber
          value={isUSDInputMode ? value : usdValue}
          color="#141416"
          symbolsColor="#141416"
          symbol={isUSDInputMode ? asset.tokenSymbol : 'USD'}
          visibleDecimals={isUSDInputMode ? 4 : 2}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}
          floor
        />
        <ButtonBase onClick={changeEditMode}>
          <Box
            component="img"
            src={imageMap.transfer.transferModalExchangeInputIcon}
            sx={{
              width: '24px',
              height: '24px',
            }}
          />
        </ButtonBase>
      </Box>
    </Box>
  )
}

export default observer(TransferModalInput)
