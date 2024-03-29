import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { Box, ButtonBase, ClickAwayListener, Tooltip } from '@mui/material'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { textCenterEllipsis } from '../message/CommonTransferMessage/components'
import authImageMap from '../../../images/authImageMap'
import { useConnectPetra } from '../../hooks/aptos/useConnectPetra'
import LinkLogo from '../../../../public/res/svg/auth/link_logo.svg?react'

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
                offset: [0, -16],
              },
            },
          ],
        },
      }}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: '#323C46',
            fontSize: '12px',
            borderRadius: '0',
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
              backgroundColor: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '17px',
              color: '#25B1FF',
              border: '1px solid #F0F5FA',
            }}
          >
            <LinkLogo
              style={{
                width: '16px',
                height: '16px',
                marginRight: '8px',
              }}
            />
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
          src=""
          sx={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: 'red',
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
