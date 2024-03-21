import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, ButtonBase, CircularProgress, Fade, Modal, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SelectInputProps } from '@mui/material/Select/SelectInput'
import SwipeableViews from 'react-swipeable-views'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { AxiosResponse } from 'axios'
import { Room } from 'matrix-js-sdk'
import TransferModalStepOne from './components/TransferModalStepOne'
import TransferModalStepTwo from './components/TransferModalStepTwo'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { useMobxStore } from '../../../stores/StoreProvider'
import { UserToken } from '../../../stores/user-asset-store'
import snackbarUtils from '../../../util/SnackbarUtils'
import GenerateId from '../../../util/genid'
import { activeMetamask, getSignature } from '../../utils/common'
import { L2_TOKEN_CONTROLLER_V2_ADDRESS } from '../../../constant'
import getTokenControllerSignData, { getTypeDataV2 } from '../../utils/getTokenControllerSignData'
import { hooks, metaMask } from '../../connectors/metaMask'
import { request } from '../../../api/request'
import { useNetworkFeeV2 } from '../../hooks/useNetworkFee'
import defedApi, { IResponseType } from '../../../api/defed-api'
import { fromTokenAmount, valueToBigNumber } from '../../utils/math-utils-v2'
import { DefedMsgType } from '../../../types/defed/message'
import { TransferMessageContent, TransferStatus } from '../message/TransferMessage'
import imageMap from '../../../images/imageMap'

const { useChainId } = hooks

interface ITransferModalProps {
  room: Room
}
enum TransferProgress {
  InputAmount = 'InputAmount',
  Confirm = 'Confirm',
}
export interface TransferState {
  step: TransferProgress
  amount: string
  transferType: string
}
export interface IExecTransaction {
  chainId: number
  to: string
  value: number
  operation: number
  nonce: number | bigint
  signature: string
}

export interface IPostTransferMsgParams extends IExecTransaction {
  asset: string
  amount: string
  toAddress: string
  interestRateMode?: number
  deadline: number
  realAmount: string
  symbol: string
  decimals: number
}
export interface IPostTransferMsgResponse {
  symbol: string
  decimals: number
  realAmount: number
  amount: number
  asset: string
  bizTxId: number
  chainId: number
  confirmation: number
  createDate: null
  deadline: number
  id: number
  interestRateMode: number
  nonce: number
  operation: number
  signature: string
  to: string
  toAddress: string
  transferType: string
  txHash: string
  updateDate: number
  value: number
  code?: number
  msg?: string
}
export const SymbolDecimals = {
  USDC: 1e6,
  USDT: 1e6,
  WBTC: 1e8,
  ETH: 1e18,
  DEFE: 1e18,
}
export const signTxData = async (unsignedData: any, account: string): Promise<unknown> => {
  if (metaMask?.provider && account) {
    return await metaMask.provider.request({
      method: 'eth_signTypedData_v4',
      params: [account, unsignedData],
    })
  }
  throw new Error('Error initializing permit signature')
}
const TransferModal: React.FC<ITransferModalProps> = ({ room }) => {
  const { breakpoints } = useTheme()
  const isMobile = useMediaQuery(breakpoints.down('lg'))
  const chainId = useChainId()
  const matrixClient = useMatrixClient()
  const {
    appStore: { userAccount, changeSetPasswordModalOpen, changeOnPasswordModalConfirm },
    userAssetStore: { userAsset },
    modalStore: { transferModalVisible, changeTransferModalVisible, transferModalTargetData },
  } = useMobxStore()
  const transferModalTargetProxy = transferModalTargetData?.proxy || ''
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentReserve, setCurrentReserve] = useState<UserToken | null>(null)
  const canUseCredit = useMemo(() => currentReserve?.chainName !== 'Polygon', [currentReserve])
  const [transferState, setTransferState] = useState<TransferState>({
    step: TransferProgress.InputAmount,
    amount: '',
    transferType: 'defed',
  })
  const [errorMsg, setErrorMsg] = useState('')
  const maxAmountToTransfer = useMemo(
    () => (transferState.transferType === 'defed' ? currentReserve?.amountDecimal : currentReserve?.creditBalance) || '0',
    [currentReserve, transferState.transferType],
  )
  const [isUSDInputMode, setIsUSDInputMode] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const isSavingTransfer = transferState.transferType === 'defed'
  const actualAmount = transferState.amount

  const { networkFee } = useNetworkFeeV2({ currentLoginAddress: userAccount?.proxyAddress, reserve: currentReserve, amount: transferState.amount, isSavingTransfer })
  const changeEditMode = () => {
    setIsUSDInputMode((prevState) => !prevState)
  }
  const handleTransferTypeChange: SelectInputProps<string>['onChange'] = (event) => {
    setTransferState((prevState) => ({
      ...prevState,
      amount: '',
      transferType: event.target.value,
    }))
  }
  const initData = () => {
    if (!currentReserve && userAsset?.userTokenList.length) {
      setCurrentReserve(userAsset.userTokenList[0])
    }
  }
  const handleChangeReserve = (token: string) => {
    if (!userAsset?.userTokenList?.length) {
      return
    }
    const findReserve = userAsset.userTokenList.find((reserve) => reserve.vtokenAddress === token)
    if (findReserve) {
      setCurrentReserve(findReserve)
      setTransferState((prevState) => ({ ...prevState, amount: '', transferType: 'defed' }))
    }
  }
  useEffect(() => {
    if (transferModalVisible) {
      initData()
    }
  }, [transferModalVisible])
  const onCloseModal: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void = () => {
    changeTransferModalVisible(false)
    setActiveIndex(0)
    setErrorMsg('')
    setTransferState({
      step: TransferProgress.InputAmount,
      amount: '',
      transferType: 'defed',
    })
    setCurrentReserve(null)
    setIsUSDInputMode(false)
  }
  const handleChange = (_value: string) => {
    const maxSelected = _value === '-1'
    const value = maxSelected ? maxAmountToTransfer : _value
    setTransferState((prevState) => ({
      ...prevState,
      amount: value,
    }))
    setErrorMsg('')
  }

  const createTransferMessage = async (transferData: IPostTransferMsgResponse) => {
    if (!userAccount?.proxyAddress || !currentReserve) {
      return
    }
    try {
      snackbarUtils.success('Transfer success.')
      const newMessageContent: TransferMessageContent = {
        ...transferData,
        createDate: Date.now(),
        status: TransferStatus.WAIT,
      }
      await matrixClient.sendMessage(room.roomId, { body: newMessageContent, msgtype: DefedMsgType.Transfer })
    } catch (error) {
      setErrorMsg(t('Send message error'))
      console.error(error)
    }
    onCloseModal()
  }

  const transferByWallet = async () => {
    if (!chainId) {
      return await activeMetamask()
    }
    if (!currentReserve) return
    const { transferMsg, transferCreditMsg } = getTokenControllerSignData()
    const nonce = new GenerateId({ WorkerId: 1 }).NextId()

    const amountWithFee = valueToBigNumber(transferState.amount).plus(0).toString()
    const _amount = fromTokenAmount(amountWithFee, currentReserve.tokenDecimal).toFixed(0, 1)
    const currentDate = dayjs()
    const deadLine = currentDate.add(1, 'day')
    const deadLineNum = deadLine.valueOf()
    const data = isSavingTransfer
      ? transferMsg(currentReserve.vtokenAddress, _amount, transferModalTargetProxy, deadLineNum)
      : transferCreditMsg(currentReserve.vtokenAddress, _amount, transferModalTargetProxy, deadLineNum)

    const message = {
      to: L2_TOKEN_CONTROLLER_V2_ADDRESS,
      value: 0,
      data,
      operation: 1,
      nonce,
    }
    const signData = getTypeDataV2(message, chainId.toString())
    const account = userAccount?.currentLoginAddress
    if (!account) return snackbarUtils.error(t('没有查找到MetaMask账户'))

    try {
      const _signature = await signTxData(signData, account)
      const signature = (_signature as string).toString()
      const params: IPostTransferMsgParams = {
        decimals: Number(currentReserve.tokenDecimal),
        realAmount: fromTokenAmount(transferState.amount, currentReserve.tokenDecimal).toFixed(0, 1),
        symbol: currentReserve.tokenSymbol,
        asset: currentReserve.vtokenAddress,
        amount: _amount,
        toAddress: transferModalTargetProxy,
        signature,
        chainId,
        deadline: deadLineNum,
        to: message.to,
        value: message.value,
        operation: message.operation,
        nonce: message.nonce,
      }
      if (!isSavingTransfer) {
        // credit 转账
        params.interestRateMode = 2
      }

      const result: AxiosResponse<IResponseType<IPostTransferMsgResponse>> = await request.post(isSavingTransfer ? defedApi.postTransferMsg : defedApi.postTransferCreditMsg, params)
      if (result?.data?.data?.id) {
        await createTransferMessage(result.data.data)
      } else {
        setErrorMsg(result?.data?.msg || '')
      }
    } catch (error) {
      setErrorMsg((error as Error).message)
    }
  }

  const transferByPrivateKey = async (privateKey: string) => {
    if (!currentReserve) return
    const { transferMsg, transferCreditMsg } = getTokenControllerSignData()
    const nonce = new GenerateId({ WorkerId: 1 }).NextId()

    const amountWithFee = valueToBigNumber(transferState.amount).plus(0).toString()
    const _amount = fromTokenAmount(amountWithFee, currentReserve.tokenDecimal).toFixed(0, 1)
    const currentDate = dayjs()
    const deadLine = currentDate.add(1, 'day')
    const deadLineNum = deadLine.valueOf()

    const data = isSavingTransfer
      ? transferMsg(currentReserve.vtokenAddress, _amount, transferModalTargetProxy, deadLineNum)
      : transferCreditMsg(currentReserve.vtokenAddress, _amount, transferModalTargetProxy, deadLineNum)

    const message = {
      to: L2_TOKEN_CONTROLLER_V2_ADDRESS,
      value: 0,
      data,
      operation: 1,
      nonce,
    }
    const signData = getTypeDataV2(message, '1')

    try {
      const signature = getSignature(privateKey, signData)
      const params: IPostTransferMsgParams = {
        decimals: Number(currentReserve.tokenDecimal),
        realAmount: fromTokenAmount(transferState.amount, currentReserve.tokenDecimal).toFixed(0, 1),
        symbol: currentReserve.tokenSymbol,
        asset: currentReserve.vtokenAddress,
        amount: _amount,
        toAddress: transferModalTargetProxy,
        signature,
        chainId: 1,
        deadline: deadLineNum,
        to: message.to,
        value: message.value,
        operation: message.operation,
        nonce: message.nonce,
      }
      if (!isSavingTransfer) {
        // credit 转账
        params.interestRateMode = 2
      }
      const result: AxiosResponse<IResponseType<IPostTransferMsgResponse>> = await request.post(isSavingTransfer ? defedApi.postTransferMsg : defedApi.postTransferCreditMsg, params)
      if (result?.data?.data?.id) {
        await createTransferMessage(result.data.data)
      } else {
        setErrorMsg(result?.data?.msg || '')
      }
    } catch (error) {
      setErrorMsg((error as Error).message)
    }
  }
  const onActionButtonClick = async () => {
    if (!userAccount) return
    setButtonLoading(true)
    if (activeIndex === 0) {
      if (new BigNumber(actualAmount).plus(new BigNumber(0)).isGreaterThan(new BigNumber(maxAmountToTransfer))) {
        setErrorMsg(t('Insufficient balance after deducting the transfer fee.'))
        return
      }
      if (new BigNumber(actualAmount).isLessThan(new BigNumber(0.0001))) {
        setErrorMsg(t('The minimum amount should be more than 0.0001.'))
        return
      }
      setActiveIndex(1)
    } else if (activeIndex === 1) {
      if (userAccount.addressType === 1) {
        await transferByWallet()
      } else {
        changeSetPasswordModalOpen(true)
        changeOnPasswordModalConfirm(async (password) => {
          setButtonLoading(true)
          changeSetPasswordModalOpen(false)
          await transferByPrivateKey(password)
          return setButtonLoading(false)
        })
      }
    }
    setButtonLoading(false)
  }

  if (!currentReserve) return null
  return (
    <Modal
      open={transferModalVisible}
      BackdropProps={{
        timeout: 500,
      }}
      onClose={onCloseModal}
      closeAfterTransition
    >
      <Fade in={transferModalVisible}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '343px', xsm: '600px' },
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            {activeIndex === 0 ? (
              <Box
                sx={{
                  color: '#141414',
                  fontSize: { xs: '20px', xsm: '24px' },
                  fontWeight: 500,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    marginRight: '6px',
                  }}
                >
                  {t('Transfer')}
                </Box>
                <Box component="span">{currentReserve.tokenSymbol}</Box>
              </Box>
            ) : (
              <Button
                sx={{
                  color: '#141414',
                  fontSize: { xs: '20px', xsm: '24px' },
                  fontWeight: 500,
                  padding: 0,
                }}
                onClick={() => {
                  setActiveIndex(0)
                }}
              >
                {t('<  Confirm transfer')}
              </Button>
            )}
            <ButtonBase onClick={onCloseModal}>
              <Box
                sx={{
                  width: { xs: '28px', xsm: '36px' },
                  height: { xs: '28px', xsm: '36px' },
                }}
                component="img"
                src={imageMap.transfer.transferModalCloseIcon}
              />
            </ButtonBase>
          </Box>
          <Box
            sx={{
              width: '100%',
              marginBottom: '24px',
            }}
          >
            {/* @ts-ignore */}
            <SwipeableViews index={activeIndex} onChangeIndex={(index: number) => setActiveIndex(index)}>
              <Box
                sx={{
                  width: '100%',
                }}
              >
                {activeIndex === 0 ? (
                  <TransferModalStepOne
                    currentReserve={currentReserve}
                    transferState={transferState}
                    handleChange={handleChange}
                    maxAmountToTransfer={maxAmountToTransfer}
                    handleChangeReserve={handleChangeReserve}
                    handleTransferTypeChange={handleTransferTypeChange}
                    canUseCredit={canUseCredit}
                    isUSDInputMode={isUSDInputMode}
                    changeEditMode={changeEditMode}
                    isMobile={isMobile}
                    targetProxy={transferModalTargetProxy}
                  />
                ) : null}
              </Box>
              <Box
                sx={{
                  width: '100%',
                }}
              >
                {activeIndex === 1 ? (
                  <TransferModalStepTwo targetProxy={transferModalTargetProxy} currentReserve={currentReserve} transferState={transferState} actualAmount={actualAmount} networkFee={networkFee} />
                ) : null}
              </Box>
            </SwipeableViews>
          </Box>
          {errorMsg ? (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {errorMsg}
            </Alert>
          ) : null}
          <Button
            variant="surface"
            sx={{
              width: '100%',
              height: '48px',
            }}
            disabled={buttonLoading || !Number(transferState.amount)}
            onClick={onActionButtonClick}
          >
            {buttonLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t('Updating...')}
                <CircularProgress
                  size="20px"
                  thickness={4}
                  sx={{
                    marginLeft: '16px',
                    '& .MuiCircularProgress-svg': {
                      color: '#fff',
                    },
                  }}
                />
              </Box>
            ) : (
              <>
                {activeIndex === 0 ? t('Next') : t('Send')}
                {activeIndex === 1 && !isMobile ? (
                  <Tooltip
                    PopperProps={{
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: '#FAFAFA',
                          color: '#323C46',
                          fontSize: '12px',
                          borderRadius: '12px',
                          boxShadow: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
                          padding: '12px',
                          lineHeight: '16px',
                        },
                      },
                    }}
                    title={t('The payment will be deducted from your DEFED account after payee accepts this transfer.')}
                    placement="top"
                  >
                    <Box
                      component="img"
                      sx={{
                        width: '16px',
                        height: '16px',
                        marginLeft: '12px',
                      }}
                      src={imageMap.transfer.transferModalSendHintIcon}
                    />
                  </Tooltip>
                ) : null}
              </>
            )}
          </Button>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(TransferModal)
