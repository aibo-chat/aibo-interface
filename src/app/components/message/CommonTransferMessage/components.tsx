import { Box, CircularProgress, outlinedInputClasses, Select, selectClasses, SelectProps, Slider, styled, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import multiAvatar from '@multiavatar/multiavatar/esm'
import { DEFAULT_AVATAR_URL } from '../../../../stores/user-info-store'
import { RecentTransferRecordList } from '../../../../stores/user-relationship-store'
import transferImageMap from '../../../../images/transferImageMap'

export function TransferListLoading() {
  return (
    <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export function TransferNoData({ size }: { size?: number }) {
  const hegiht = size || 120
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <img src={transferImageMap.historyNoData} alt="nodata" height={hegiht} />
      <Typography color="text.muted" variant="secondary16" mt={2}>
        {t('No Data')}
      </Typography>
    </Box>
  )
}

export const TransferPrettoSlider = styled(Slider)({
  height: 4,
  padding: '12px 0!important',
  '& .MuiSlider-track': {
    border: 'none',
    background: 'linear-gradient(270deg, #4128D1 23.33%, rgba(192, 181, 255, 0.90) 98.44%)',
  },
  '& .MuiSlider-rail': {
    backgroundColor: '#EBF0F5',
  },
  '& .MuiSlider-mark': {
    width: 2,
    height: 10,
    backgroundColor: '#EBF0F5',
  },
  '& .MuiSlider-thumb': {
    height: 10,
    width: 2,
    backgroundColor: '#4128D1',
    borderRadius: '4px',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 10,
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    background: 'linear-gradient(270deg, #4128D1 23.33%, rgba(192, 181, 255, 0.90) 98.44%)',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&::before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
})
export const TransferStyledSelect = styled(({ children, ...props }: SelectProps) => <Select {...props}>{children}</Select>)(({}) => ({
  width: '100%',
  [`&.TxInput__select .${outlinedInputClasses.input}`]: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '8px',
  },
  [`&.TxInput__select .${outlinedInputClasses.notchedOutline}`]: {
    border: '1.5px solid #E6EBF0',
  },
  [`&.TxInput__select .${selectClasses.icon}`]: {
    color: '#777E91',
  },
}))

export const textCenterEllipsis = (str: string, from: number, to: number) => `${str.substring(0, from)}...${str.substring(str.length - to, str.length)}`
export function TransferListItem({ item, onClick }: { item: RecentTransferRecordList; onClick: () => void }) {
  const [nftUrl, setNftUrl] = useState(DEFAULT_AVATAR_URL)

  const onLoadImg = () => {
    const oImg = document.createElement('img')
    oImg.src = item.avatar as string
    // 图片加载好之后，重新赋值
    oImg.onload = () => {
      setNftUrl(oImg.src)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        cursor: 'pointer',
        borderBottom: '1px solid #E6EBF0',
      }}
      onMouseDown={onClick}
    >
      {item.avatar ? (
        <img
          src={nftUrl}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
          }}
          alt=""
          onLoad={onLoadImg}
          loading="lazy"
        />
      ) : (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
          }}
          dangerouslySetInnerHTML={{ __html: multiAvatar(item.proxyAddress.toLowerCase()) }}
        />
      )}

      <Box ml={3}>
        {item.handleName ? (
          <>
            <Typography sx={{ fontSize: '16px' }}>{item.handleName}</Typography>
            <Typography sx={{ color: '#78828C', fontSize: '12px' }}>{textCenterEllipsis(item.proxyAddress, 5, 5)}</Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: '16px' }}>{textCenterEllipsis(item.proxyAddress, 5, 5)}</Typography>
        )}
      </Box>
    </Box>
  )
}
