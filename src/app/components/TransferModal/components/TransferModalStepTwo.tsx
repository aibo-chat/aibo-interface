import React, { ReactElement } from 'react'
import { Box, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import TransferModalNamePart from './TransferModalNamePart'
import { TransferState } from '../index'
import { UserToken } from '../../../../stores/user-asset-store'
import { nativeToUSDWithoutDecimal } from '../../../utils/math-utils-v2'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { FormattedNumber } from '../../common/FormattedNumber'
import imageMap from '../../../../images/imageMap'

interface ITransferModalStepTwoProps {
  currentReserve: UserToken
  transferState: TransferState
  actualAmount: number | string
  networkFee: string
  targetProxy: string
}

interface IDetailItemPartProps {
  leftPart: ReactElement
  rightPart: ReactElement
  isBottom?: boolean
}
const DetailItemPart: React.FC<IDetailItemPartProps> = ({ leftPart, rightPart, isBottom = false }) => (
  <Box
    sx={[
      {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      isBottom ? {} : { marginBottom: '16px' },
    ]}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: '#78828C',
        fontSize: '14px',
        fontWeight: 400,
        marginRight: '10px',
      }}
    >
      {leftPart}
    </Box>
    <Box
      sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        color: '#141414',
        fontSize: '14px',
        fontWeight: 500,
        workBreak: 'break-all',
      }}
    >
      {rightPart}
    </Box>
  </Box>
)
const TransferModalStepTwo: React.FC<ITransferModalStepTwoProps> = (props) => {
  const { currentReserve, transferState, actualAmount, networkFee, targetProxy } = props
  const { t } = useTranslation()
  const {
    appStore: { userAccount },
  } = useMobxStore()
  const usdValue = transferState.amount ? nativeToUSDWithoutDecimal(transferState.amount, currentReserve.price) : '0'
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <TransferModalNamePart proxy={userAccount?.proxyAddress || ''} />
      <Box
        sx={{
          width: '100%',
          padding: `${'4px'} ${'20px'}`,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src={imageMap.transfer.transferModalArrowDown}
          sx={{
            width: { xs: '24px', xsm: '32px' },
            height: { xs: '24px', xsm: '32px' },
            marginRight: '20px',
          }}
        />
        <Box
          sx={{
            color: '#141414',
            fontSize: { xs: '24px', xsm: '32px' },
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <FormattedNumber
              value={transferState.amount}
              visibleDecimals={4}
              sx={{
                mr: '4px',
                color: '#141414',
                fontSize: {
                  xs: '24px',
                  xsm: '32px',
                },
              }}
              floor
            />
            <Box
              component="span"
              sx={{
                marginRight: '4px',
              }}
            >
              {currentReserve.tokenSymbol}
            </Box>
          </Box>
          <Box>
            <Box
              component="span"
              sx={{
                fontSize: { xs: '12px', xsm: '16px' },
                color: '#78828C',
              }}
            >
              (
              <FormattedNumber
                value={usdValue}
                variant="secondary14"
                color="text.muted"
                symbolsColor="text.muted"
                symbol="USD"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              )
            </Box>
          </Box>
        </Box>
      </Box>
      <TransferModalNamePart proxy={targetProxy} />
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#F5F6F9',
          borderRadius: '12px',
          padding: { xs: '13px', xsm: '16px' },
        }}
      >
        <DetailItemPart
          leftPart={
            <>
              <Box
                component="img"
                src={imageMap.transfer.transferModalReward}
                sx={{
                  width: '20px',
                  height: '20px',
                  marginRight: { xs: '5px', xsm: '8px' },
                }}
              />
              <Box>{t('Reward')}</Box>
            </>
          }
          rightPart={
            <>
              <Box
                component="img"
                src={imageMap.transfer.transferModalComingSoon}
                sx={{
                  width: '20px',
                  height: '20px',
                  marginRight: '8px',
                }}
              />
              <Box>{t('Coming soon')}</Box>
            </>
          }
        />
        <DetailItemPart
          leftPart={<Box>{t('Network fee')}</Box>}
          rightPart={
            <Tooltip
              title={
                <Box component="span">
                  <Box
                    component="span"
                    sx={{
                      marginRight: '4px',
                    }}
                  >
                    {networkFee}
                  </Box>
                  <Box component="span">{currentReserve.tokenSymbol}</Box>
                </Box>
              }
              placement="top"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'line-through',
                }}
              >
                <FormattedNumber value={networkFee} visibleDecimals={4} sx={{ color: '#141414', fontSize: '14px' }} floor />
                <Box
                  component="span"
                  sx={{
                    marginRight: '8px',
                  }}
                >
                  {'\u00A0'}
                  {currentReserve.tokenSymbol}
                </Box>
                <Box
                  component="img"
                  src={imageMap.transfer.transferTokenFeeFreeIcon}
                  sx={{
                    width: '48px',
                    height: '22px',
                  }}
                />
              </Box>
            </Tooltip>
          }
        />
        <DetailItemPart
          leftPart={<Box>{t('Total cost')}</Box>}
          rightPart={
            <Tooltip
              title={
                <Box component="span">
                  <Box
                    component="span"
                    sx={{
                      marginRight: '4px',
                    }}
                  >
                    {new BigNumber(actualAmount).plus(new BigNumber(0)).toString()}
                  </Box>
                  <Box component="span">{currentReserve.tokenSymbol}</Box>
                </Box>
              }
              placement="top"
            >
              <Box>
                <FormattedNumber
                  value={new BigNumber(actualAmount).plus(new BigNumber(0)).toString()}
                  visibleDecimals={4}
                  sx={{ mr: '4px', color: '#141414', fontSize: '14px', fontWeight: 600 }}
                  floor
                />
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {currentReserve.tokenSymbol}
                </Box>
              </Box>
            </Tooltip>
          }
          isBottom
        />
      </Box>
    </Box>
  )
}
export default observer(TransferModalStepTwo)
