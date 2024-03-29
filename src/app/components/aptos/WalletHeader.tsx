import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Box, ButtonBase, ClickAwayListener, Tooltip } from '@mui/material'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { textCenterEllipsis } from '../message/CommonTransferMessage/components'
import authImageMap from '../../../images/authImageMap'
import { useConnectPetra } from '../../hooks/aptos/useConnectPetra'

const WalletHeader: React.FC = () => {
  const { connected, account, disconnect } = useWallet()
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const { connectPetraWallet } = useConnectPetra()

  return connected && account ? (
    <Tooltip
      open={tooltipOpen}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -20],
              },
            },
          ],
        },
      }}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            backgroundColor: '#FAFAFA',
            boxShadow: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
            color: '#323C46',
            fontSize: '12px',
            borderRadius: '8px',
            padding: '0px',
            lineHeight: '16px',
            maxWidth: '1000px',
          },
        },
      }}
      title={
        <ClickAwayListener
          onClickAway={() => {
            setTooltipOpen(false)
          }}
        >
          <ButtonBase
            onClick={() => {
              setTooltipOpen(false)
              disconnect()
            }}
            sx={{
              width: '140px',
              height: '33px',
              borderRadius: '4px',
            }}
          >
            Disconnect
          </ButtonBase>
        </ClickAwayListener>
      }
    >
      <ButtonBase
        sx={{
          width: '138px',
          height: '30px',
          border: '1px solid #F0F5FA',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => {
          setTooltipOpen(true)
        }}
      >
        <Box
          sx={{
            fontSize: '14px',
            color: '#323C46',
            fontWeight: 500,
            lineHeight: '14px',
            overflow: 'hidden',
          }}
        >
          {textCenterEllipsis(account.address, 5, 5)}
        </Box>
        <Box
          component="img"
          src="/public/aptos/petra.png"
          sx={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
      </ButtonBase>
    </Tooltip>
  ) : (
    <ButtonBase
      sx={{
        backgroundImage: `url(${authImageMap.connectWalletBackground})`,
        width: '116px',
        height: '30px',
        backgroundSize: 'covert',
        color: '#25B1FF',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '14px',
      }}
      onClick={connectPetraWallet}
    >
      Connect Wallet
    </ButtonBase>
  )
}
export default observer(WalletHeader)
