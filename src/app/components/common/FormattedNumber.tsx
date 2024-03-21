import { SxProps, Theme, Typography } from '@mui/material'
import { TypographyProps } from '@mui/material/Typography'
import React from 'react'
import { computedFloorNumber, normalizeBN, valueToBigNumber } from '../../utils/math-utils-v2'

interface CompactNumberProps {
  value: string | number
  visibleDecimals?: number
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y']

function CompactNumber({ value, visibleDecimals = 2 }: CompactNumberProps) {
  const bnValue = valueToBigNumber(value)

  const integerPlaces = bnValue.toFixed(0).length
  const significantDigitsGroup = Math.min(Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0), POSTFIXES.length - 1)
  const postfix = POSTFIXES[significantDigitsGroup]
  const formattedValue = normalizeBN(bnValue, 3 * significantDigitsGroup).toNumber()

  return (
    <>
      {new Intl.NumberFormat('en-US', {
        maximumFractionDigits: visibleDecimals,
        minimumFractionDigits: visibleDecimals,
      }).format(formattedValue)}
      {postfix}
    </>
  )
}

export interface FormattedNumberProps extends TypographyProps {
  value: string | number
  symbol?: string
  visibleDecimals?: number
  compact?: boolean
  percent?: boolean
  floor?: boolean
  symbolsColor?: string
  symbolsVariant?: any
  symbolSx?: SxProps<Theme>
}

export function FormattedNumber({ value, symbol, visibleDecimals, compact, percent, floor, symbolsVariant, symbolsColor, symbolSx, ...rest }: FormattedNumberProps) {
  const number = percent ? Number(value) * 100 : Number(value)

  let decimals = visibleDecimals
  // if (number === 0) {
  //   decimals = 0;
  // } else
  if (visibleDecimals === undefined) {
    if (number > 1 || percent || symbol === 'USD') {
      decimals = 2
    } else {
      decimals = 7
    }
  }

  const minValue = 10 ** -(decimals as number)
  const isSmallerThanMin = number !== 0 && Math.abs(number) < Math.abs(minValue)
  const formatFloorNumber = computedFloorNumber(number, decimals as number)
  const _formattedNumber = floor ? Number(formatFloorNumber) : number
  const formattedNumber = isSmallerThanMin ? (number >= 0 ? minValue : -minValue) : _formattedNumber

  const forceCompact = compact !== false && (compact || number > 999_999)

  return (
    <Typography
      {...rest}
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        flexShrink: 0,
        ...rest.sx,
      }}
      noWrap
    >
      {isSmallerThanMin && (
        <Typography component="span" sx={{ mr: 0.25 }} variant={symbolsVariant || rest.variant} color={symbolsColor || 'text.secondary'}>
          {'<'}
        </Typography>
      )}
      {symbol?.toLowerCase() === 'usd' && !percent && (
        <Typography component="span" sx={{ mr: 0.25, ...symbolSx }} variant={symbolsVariant || rest.variant} color={symbolsColor || 'text.secondary'}>
          $
        </Typography>
      )}

      {!forceCompact ? (
        new Intl.NumberFormat('en-US', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(formattedNumber)
      ) : (
        <CompactNumber value={formattedNumber} visibleDecimals={decimals} />
      )}

      {percent && (
        <Typography component="span" sx={{ ml: 0.25 }} variant={symbolsVariant || rest.variant} color={symbolsColor || 'text.secondary'}>
          %
        </Typography>
      )}
      {symbol?.toLowerCase() !== 'usd' && typeof symbol !== 'undefined' && (
        <Typography component="span" sx={{ ml: 0.25 }} variant={symbolsVariant || rest.variant} color={symbolsColor || 'text.secondary'}>
          {symbol}
        </Typography>
      )}
    </Typography>
  )
}
