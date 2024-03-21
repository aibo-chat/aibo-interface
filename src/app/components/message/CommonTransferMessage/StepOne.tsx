import { observer } from 'mobx-react-lite'
import React, { Dispatch, MutableRefObject, ReactNode, SetStateAction, useMemo, useState } from 'react'
import { Box, Button, ButtonBase, ClickAwayListener, InputBase, inputBaseClasses, MenuItem, SelectChangeEvent, Tooltip, Typography } from '@mui/material'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import { AxiosResponse } from 'axios'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { UserToken } from '../../../../stores/user-asset-store'
import PolygonSvg from '../../../../../public/res/svg/chains/Polygon.svg?react'
import EthereumSvg from '../../../../../public/res/svg/chains/Ethereum.svg?react'
import { TokenIcon } from '../../common/TokenIcon'
import { NumberFormatCustom } from '../../TransferModal/components/TransferModalInput'
import { FormattedNumber } from '../../common/FormattedNumber'
import { amountToUSD, valueToBigNumber } from '../../../utils/math-utils-v2'
import { request } from '../../../../api/request'
import DefedApi, { IResponseType } from '../../../../api/defed-api'
import AddressMapSvg from '../../../../../public/res/svg/transfer/AddressMap.svg?react'
import { TransferListItem, TransferListLoading, TransferNoData, TransferPrettoSlider, TransferStyledSelect } from './components'
import { CommonScrollBarCSS } from '../../../../constant'
import { RecentTransferRecordList } from '../../../../stores/user-relationship-store'
import { isAddress } from '../../../utils/common'
import snackbarUtils from '../../../../util/SnackbarUtils'

interface IStepOneProps {
  defaultNetwork?: string
  swiperRef: MutableRefObject<SwiperClass>
  reserve?: UserToken
  setReserve: Dispatch<SetStateAction<UserToken | undefined>>
  maxValue: string
  amount: string | number
  setAmount: Dispatch<SetStateAction<string | number>>
  receiver: string
  setReceiver: Dispatch<SetStateAction<string>>
}
const FixedPercent = [
  { key: '0', value: 0, labelX: 0 },
  { key: '25%', value: 25 },
  { key: '50%', value: 50 },
  { key: '75%', value: 75 },
  { key: 'Max', value: 100, labelX: -100 },
]
const marks = [
  {
    value: 0,
  },
  {
    value: 25,
  },
  {
    value: 50,
  },
  {
    value: 75,
  },
  {
    value: 100,
  },
]
const Item: React.FC<{ left: string; right: ReactNode }> = ({ left, right }) => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
    }}
  >
    <Box
      sx={{
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        color: '#323C46',
        flexShrink: 0,
        marginRight: '24px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {left}
    </Box>
    <Box
      sx={{
        width: '381px',
      }}
    >
      {right}
    </Box>
  </Box>
)

const NetworkData = ['Ethereum', 'Polygon']
const StepOne: React.FC<IStepOneProps> = ({ defaultNetwork, reserve, swiperRef, setReserve, maxValue, amount, setAmount, receiver, setReceiver }) => {
  const { t } = useTranslation()
  const {
    appStore: { userAccount },
    userAssetStore: { userAsset },
    userRelationshipStore: { oldRelationship, recentTransferRecord },
  } = useMobxStore()
  const getDefaultNetwork = (network?: string) => {
    if (!network) return NetworkData[1]
    return NetworkData.find((item) => item.toLowerCase() === network.toLowerCase()) || NetworkData[1]
  }
  const [network, setNetwork] = useState(reserve?.chainName || getDefaultNetwork(defaultNetwork))
  const [token, setToken] = useState<string>(reserve?.vtokenAddress || '')
  const [searchList, setSearchList] = useState<RecentTransferRecordList[]>()
  const [openContact, setOpenContact] = useState(false)
  const [isInputFocus, setIsInputFocus] = useState(false)
  const [type, setType] = useState<'recent' | 'contact'>('contact')
  const percentage = useMemo(
    () =>
      maxValue && amount && !new BigNumber(maxValue).isZero() && !new BigNumber(amount).isZero()
        ? new BigNumber(amount).dividedBy(new BigNumber(maxValue).decimalPlaces(4, BigNumber.ROUND_FLOOR)).decimalPlaces(2).times(100).toNumber()
        : 0,
    [amount, maxValue],
  )
  const usdValue = useMemo(() => (amount && reserve ? amountToUSD(amount, reserve.price) : '0'), [amount, reserve])
  const tokenData = useMemo(() => userAsset?.userTokenList?.filter((item) => item.chainName === network) || [], [network, userAsset?.userTokenList])
  const contactList = useMemo(
    () =>
      oldRelationship.map((item: any) => ({
        address: item.toProxy,
        avatar: item.avatarLink,
        handleName: item.handleName,
        proxyAddress: item.toProxy,
      })),
    [oldRelationship],
  )
  const goNext = () => {
    if (!network || !token || !amount || new BigNumber(amount).isZero() || !receiver) return
    if (!isAddress(receiver)) return snackbarUtils.error('Invalid address')
    if (new BigNumber(amount).plus(new BigNumber(0)).isGreaterThan(new BigNumber(maxValue))) {
      return snackbarUtils.error(t('Insufficient balance after deducting the transfer fee.'))
    }
    if (new BigNumber(amount).isLessThan(new BigNumber(0.0001))) {
      return snackbarUtils.error(t('The minimum amount should be more than 0.0001.'))
    }
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
  }

  const handleAmountChange = (value: string | number) => {
    setAmount(value)
  }
  const handleNetworkSelect: (event: SelectChangeEvent<unknown>, child: React.ReactNode) => void = (event) => {
    const { value } = event.target
    if (value !== network) {
      setNetwork(value as string)
      setToken('')
      setReserve(undefined)
      handleAmountChange('0')
    }
  }
  const handleTokenSelect: (event: SelectChangeEvent<unknown>, child: React.ReactNode) => void = (event) => {
    const { value } = event.target
    const targetReverse = tokenData.find((item) => item.vtokenAddress === value)
    if (targetReverse) {
      setReserve(targetReverse)
      setToken(value as string)
      handleAmountChange('0')
    }
  }

  const changeAmountByBar = (value: number) => {
    const computedAmount = valueToBigNumber(maxValue).times(value).shiftedBy(-2).toFixed(4, 1)
    setAmount(computedAmount)
  }

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyWord = event.target.value
    setReceiver(keyWord)
    if (keyWord) {
      const res: AxiosResponse<IResponseType<Array<RecentTransferRecordList>>> = await request.get(DefedApi.transferSearch, {
        params: {
          keyWord,
        },
      })
      if (res?.data?.data?.length) {
        setSearchList(res.data.data)
      }
    } else {
      setSearchList(undefined)
    }
  }
  const handleFocus = async () => {
    setIsInputFocus(true)
    setOpenContact(false)
    if (receiver) {
      const res: AxiosResponse<IResponseType<Array<RecentTransferRecordList>>> = await request.get(DefedApi.transferSearch, {
        params: {
          keyWord: receiver,
        },
      })
      if (res?.data?.data?.length) {
        setSearchList(res.data.data)
      }
    }
  }
  const handleBlur = () => {
    setIsInputFocus(false)
  }
  const selectRecent = (address: string) => {
    setReceiver(address)
    searchList && setSearchList(undefined)
    openContact && setOpenContact(false)
  }
  const selectBySearch = (item: RecentTransferRecordList) => {
    // 不能给自己地址或者自己的proxy转账
    if (userAccount?.proxyAddress.toLowerCase() === item.proxyAddress.toLowerCase()) {
      return snackbarUtils.error(t('You cannot transfer into your own DEFED account.'))
    }
    selectRecent(item.proxyAddress)
  }

  return (
    <Box
      sx={{
        width: '100%',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      <Item
        left={t('Network')}
        right={
          <TransferStyledSelect
            variant="outlined"
            className="TxInput__select"
            value={network}
            onChange={handleNetworkSelect}
            displayEmpty
            renderValue={() =>
              network ? (
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#78828C', fontSize: '14px' }}>
                  {network === 'Polygon' ? (
                    <PolygonSvg
                      style={{
                        width: '24px',
                        height: '24px',
                      }}
                    />
                  ) : (
                    <EthereumSvg
                      style={{
                        width: '24px',
                        height: '24px',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      marginLeft: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      color: '#323C46',
                    }}
                  >
                    {network} Network
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: '#ddd',
                  }}
                >
                  {t('Please select network')}
                </Box>
              )
            }
          >
            {NetworkData.map((item) => (
              <MenuItem
                value={item}
                key={item}
                sx={{
                  padding: '8px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#78828C', fontSize: '14px' }}>
                  {item === 'Polygon' ? (
                    <PolygonSvg
                      style={{
                        width: '24px',
                        height: '24px',
                      }}
                    />
                  ) : (
                    <EthereumSvg
                      style={{
                        width: '24px',
                        height: '24px',
                      }}
                    />
                  )}
                  <Box ml={2}>{item} Network</Box>
                </Box>
              </MenuItem>
            ))}
          </TransferStyledSelect>
        }
      />
      <Item
        left={t('Token')}
        right={
          <TransferStyledSelect
            variant="outlined"
            className="TxInput__select"
            value={token}
            onChange={handleTokenSelect}
            displayEmpty
            renderValue={() => {
              const targetReverse = tokenData.find((item) => item.vtokenAddress === token)
              return targetReverse ? (
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#78828C', fontSize: '14px' }}>
                  <TokenIcon symbol={targetReverse.tokenName} sx={{ fontSize: { xs: '24px', lg: '24px' } }} />
                  <Box
                    sx={{
                      marginLeft: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      color: '#323C46',
                    }}
                  >
                    {targetReverse.tokenSymbol}
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: '#ddd',
                  }}
                >
                  {t('Please select token')}
                </Box>
              )
            }}
          >
            {tokenData.map((item) => (
              <MenuItem
                value={item.vtokenAddress}
                key={item.vtokenAddress}
                sx={{
                  padding: '8px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#78828C', fontSize: '14px' }}>
                  <TokenIcon symbol={item.tokenName} sx={{ fontSize: { xs: '24px', lg: '24px' } }} />
                  <Box
                    sx={{
                      marginLeft: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      color: '#323C46',
                    }}
                  >
                    {item.tokenSymbol}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </TransferStyledSelect>
        }
      />
      <Item
        left={t('Amount')}
        right={
          <Box
            sx={{
              width: '100%',
            }}
          >
            <Box
              sx={{
                boxSizing: 'border-box',
                width: '100%',
                border: '1px solid #E6EBF0',
                backgroundColor: '#FFF',
                borderRadius: '12px',
                padding: '8px',
              }}
            >
              <InputBase
                sx={{ '.MuiInputBase-input': { p: 0 }, fontSize: '14px', fontWeight: 500, color: '#323C46', lineHeight: '24px' }}
                fullWidth
                placeholder="0.00"
                disabled={false}
                value={amount}
                autoFocus={false}
                onChange={(e) => {
                  if (Number(e.target.value) > Number(maxValue)) {
                    handleAmountChange(maxValue)
                  } else {
                    handleAmountChange(e.target.value)
                  }
                }}
                inputProps={{
                  decimalScale: 4,
                  'aria-label': 'amount input',
                  isAllowed: (values: { floatValue: number }) => {
                    const { floatValue } = values
                    if (floatValue === undefined) {
                      return true
                    }
                    if (floatValue >= 0) {
                      if (new BigNumber(floatValue).isLessThanOrEqualTo(new BigNumber(maxValue))) {
                        return true
                      }
                      const flooredMaxValue = Math.floor(Number(maxValue) * 10000) / 10000
                      handleAmountChange(flooredMaxValue)
                    }
                    return false
                  },
                }}
                inputComponent={NumberFormatCustom as any}
                renderSuffix={() => (
                  <FormattedNumber
                    value={usdValue}
                    variant="secondary14"
                    color="text.muted"
                    symbolsColor="text.muted"
                    symbol="USD"
                    symbolSx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#BFC6CD',
                      lineHeight: '24px',
                    }}
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#BFC6CD',
                      lineHeight: '24px',
                    }}
                  />
                )}
              />
            </Box>
            <Box
              sx={{
                width: '100%',
              }}
            >
              <TransferPrettoSlider
                valueLabelDisplay="auto"
                aria-label="pretto slider"
                value={percentage}
                onChange={(event: Event, value: number | number[]) => {
                  changeAmountByBar(value as number)
                }}
                size="small"
                marks={marks}
                valueLabelFormat={(x) => `${x}%`}
              />

              <Box
                sx={{
                  display: 'flex',
                  color: 'rgba(65, 40, 209, 0.50)',
                  fontSize: '14px',
                  position: 'relative',
                  mt: '-7px',
                }}
              >
                {FixedPercent.map((item, index) => (
                  <Box
                    sx={{
                      position: 'absolute',
                      transform: `translateX(${item.labelX ?? -50}%)`,
                      ml: `${item.value}%`,
                      cursor: 'pointer',
                    }}
                    key={index}
                    onClick={() => {
                      changeAmountByBar(item.value)
                    }}
                  >
                    {item.key}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        }
      />
      <Item
        left={t('Address')}
        right={
          <Tooltip
            open={isInputFocus && Boolean(searchList)}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -4],
                    },
                  },
                ],
              },
            }}
            PopperProps={{
              sx: {
                '& .MuiTooltip-tooltip': {
                  backgroundColor: '#FAFAFA',
                  color: '#323C46',
                  fontSize: '12px',
                  borderRadius: '12px',
                  padding: '0px',
                  lineHeight: '16px',
                  maxWidth: '1000px',
                },
              },
            }}
            placement="bottom"
            title={
              searchList ? (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    bgcolor: '#fff',
                    width: '381px',
                    boxShadow: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
                    borderRadius: '12px',
                    maxHeight: 360,
                    overflow: 'auto',
                    ...CommonScrollBarCSS,
                  }}
                >
                  {searchList.length === 0 ? (
                    <TransferNoData size={60} />
                  ) : (
                    searchList.map((item) => (
                      <Box
                        sx={{
                          padding: '0 8px',
                          ':hover': { bgcolor: 'rgba(70, 133, 255, 0.1)' },
                          cursor: 'pointer',
                        }}
                        key={item.proxyAddress}
                      >
                        <TransferListItem
                          item={item}
                          onClick={() => {
                            selectBySearch(item)
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              ) : null
            }
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E6EBF0',
                backgroundColor: '#FFF',
                padding: '8px',
              }}
            >
              <InputBase
                fullWidth
                placeholder={t('Enter the defed address here…')}
                value={receiver}
                sx={{
                  mr: 2,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#323C46',
                  lineHeight: '24px',
                  [`& .${inputBaseClasses.input}`]: {
                    padding: 0,
                  },
                }}
                onChange={handleSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
              />
              <ClickAwayListener
                onClickAway={() => {
                  setOpenContact(false)
                }}
              >
                <Box>
                  <Tooltip
                    PopperProps={{
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: '#FAFAFA',
                          color: '#323C46',
                          fontSize: '12px',
                          borderRadius: '12px',
                          padding: '0px',
                          lineHeight: '16px',
                          maxWidth: '1000px',
                        },
                      },
                    }}
                    title={
                      <Box
                        sx={{
                          width: '373px',
                          bgcolor: '#fff',
                          p: { xs: 2, lg: 4 },
                          borderRadius: '20px',
                          mt: { xs: 4, lg: -2 },
                          boxShadow: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <Box sx={{ display: 'flex', userSelect: 'none', cursor: 'pointer' }}>
                          <Typography
                            sx={{
                              color: type === 'contact' ? '#4685FF' : '#323C46',
                              pb: 2,
                              boxShadow: type === 'contact' ? 'inset 0px -2px 0px #3C95FF' : 'unset',
                            }}
                            onClick={() => setType('contact')}
                          >
                            {t('My Contacts')}
                          </Typography>
                          <Typography
                            onClick={() => setType('recent')}
                            sx={{
                              ml: 6,
                              color: type === 'recent' ? '#4685FF' : '#323C46',
                              boxShadow: type === 'recent' ? 'inset 0px -2px 0px #3C95FF' : 'unset',
                            }}
                          >
                            {t('Recent Transfers')}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 380,
                            overflow: 'auto',
                            ...CommonScrollBarCSS,
                          }}
                        >
                          {type === 'contact' ? (
                            !contactList ? (
                              <TransferListLoading />
                            ) : !contactList.length ? (
                              <TransferNoData />
                            ) : (
                              contactList.map((item, index) => (
                                <TransferListItem
                                  key={`contact${index}`}
                                  item={item}
                                  onClick={() => {
                                    selectRecent(item.proxyAddress)
                                  }}
                                />
                              ))
                            )
                          ) : !recentTransferRecord.length ? (
                            <TransferNoData />
                          ) : (
                            recentTransferRecord.map((item, index) => (
                              <TransferListItem
                                key={index}
                                item={item}
                                onClick={() => {
                                  selectRecent(item.proxyAddress)
                                }}
                              />
                            ))
                          )}
                        </Box>
                      </Box>
                    }
                    placement="bottom"
                    open={openContact}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    onClose={() => {
                      setOpenContact(false)
                    }}
                  >
                    <ButtonBase
                      onClick={() => {
                        setOpenContact(true)
                      }}
                    >
                      <AddressMapSvg
                        style={{
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    </ButtonBase>
                  </Tooltip>
                </Box>
              </ClickAwayListener>
            </Box>
          </Tooltip>
        }
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="surface"
          sx={{
            width: '223px',
            height: '48px',
            backgroundColor: '#4128D1',
            fontSize: '14px',
          }}
          onClick={goNext}
        >
          {t('Next')}
        </Button>
      </Box>
    </Box>
  )
}
export default observer(StepOne)
