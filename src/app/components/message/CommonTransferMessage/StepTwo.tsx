import { observer } from 'mobx-react-lite'
import React, { MutableRefObject, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, CircularProgress, circularProgressClasses } from '@mui/material'
import type { Swiper as SwiperClass } from 'swiper/types'
import { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { textCenterEllipsis } from './components'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { activeMetamask, getSignature, isAddress } from '../../../utils/common'
import { UserToken } from '../../../../stores/user-asset-store'
import imageMap from '../../../../images/imageMap'
import snackbarUtils from '../../../../util/SnackbarUtils'
import getTokenControllerSignData, { getTypeDataV2 } from '../../../utils/getTokenControllerSignData'
import { fromTokenAmount } from '../../../utils/math-utils-v2'
import { L2_TOKEN_CONTROLLER_V2_ADDRESS } from '../../../../constant'
import { hooks } from '../../../connectors/metaMask'
import { signTxData } from '../../TransferModal'
import { request } from '../../../../api/request'
import DefedApi, { IResponseType } from '../../../../api/defed-api'
import { CommonTransferMessageContent } from './CommonTransferMessage'
import { TxStatus } from '../../../../stores/ai-store'

const { useChainId } = hooks

interface IStepTwoProps {
  swiperRef: MutableRefObject<SwiperClass>
  amount: string | number
  receiver: string
  reserve?: UserToken
  updateMessage: (newContent: { [p in keyof CommonTransferMessageContent]?: CommonTransferMessageContent[p] }) => Promise<void>
}
const FlexBox = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      justifyContent: { xs: 'normal', lg: 'space-between' },
      alignItems: { xs: 'normal', lg: 'center' },
      '& > div:first-of-type': { fontSize: '14px', color: '#78828C', fontWeight: 400 },
    }}
  >
    {children}
  </Box>
)

const LineBox = () => (
  <Box
    sx={{
      height: '1px',
      bgcolor: { xs: '#E6E9EC', lg: 'transparent' },
      my: 2,
    }}
  />
)
const DefaultChainId = '1'
const StepTwo: React.FC<IStepTwoProps> = ({ amount, reserve, receiver, swiperRef, updateMessage }) => {
  const { t } = useTranslation()
  const [transferLoading, setTransferLoading] = useState(false)
  const chainId = useChainId()
  const {
    appStore: { userAccount, changeSetPasswordModalOpen, changeOnPasswordModalConfirm },
  } = useMobxStore()

  const transferByWallet = async (privateKey?: string) => {
    if (!reserve) return
    if (Number(amount) <= 0) {
      return snackbarUtils.error('The receipt will be less than 0.')
    }
    if (userAccount?.addressType === 1 && !chainId) {
      return await activeMetamask()
    }
    setTransferLoading(true)
    const { tranferInner, tranferInnerCredit } = getTokenControllerSignData()
    const nonce = Date.now()

    const _amount = fromTokenAmount(amount, reserve.tokenDecimal).toFixed(0, 1)

    const isSavingTransfer = true

    const data = isSavingTransfer ? tranferInner(reserve.vtokenAddress, _amount, receiver) : tranferInnerCredit(reserve.vtokenAddress, _amount, receiver)

    const message = {
      to: L2_TOKEN_CONTROLLER_V2_ADDRESS,
      value: 0,
      data,
      operation: 1,
      nonce,
    }
    const signData = getTypeDataV2(message, chainId !== undefined ? chainId.toString() : DefaultChainId)
    const account = userAccount?.currentLoginAddress
    if (!account) return snackbarUtils.error(t('没有查找到MetaMask账户'))

    try {
      let signature: string
      if (privateKey) {
        signature = getSignature(privateKey, signData)
      } else {
        const _signature = (await signTxData(JSON.stringify(signData), account)) as any
        signature = _signature.toString()
      }

      const params = {
        asset: reserve.vtokenAddress,
        amount: _amount,
        toAddress: receiver,
        signature,
        chainId: chainId || DefaultChainId,
        ...message,
      } as any
      if (!isSavingTransfer) {
        // credit 转账
        params.interestRateMode = 2
      }
      delete params.data
      const fetchData: AxiosResponse<IResponseType<{ receiver_id: number; sender_id: number }>> = await request.post(
        isSavingTransfer ? DefedApi.postInnerTransfer : DefedApi.postInnerTransferCredit,
        params,
      )
      if (fetchData?.data?.data?.sender_id !== undefined) {
        await updateMessage({
          ...fetchData.data.data,
          token_symbol: reserve.tokenSymbol,
          token_name: reserve.tokenName,
          transfer_amount: new BigNumber(_amount).div(10 ** Number(reserve.tokenDecimal)).toString(),
          from: userAccount?.proxyAddress,
          to: receiver,
          chain_id: chainId || DefaultChainId,
          tx_status: TxStatus.PENDING,
          token_decimals: reserve.tokenDecimal,
        })
      } else {
        if (fetchData?.data?.code && fetchData.data.code !== 200 && fetchData.data.msg) {
          snackbarUtils.error(fetchData.data.msg)
        }
      }
      setTransferLoading(false)
    } catch (error) {
      setTransferLoading(false)
      snackbarUtils.error((error as Error)?.message || t('Create transfer failed'))
    }
  }
  const onConfirm = async () => {
    if (!userAccount) return
    // 不能给自己地址或者自己的proxy转账
    if ([userAccount.proxyAddress.toLowerCase()].includes(receiver.toLowerCase())) {
      return snackbarUtils.error(t('You cannot transfer into your own DEFED account.'))
    }
    if (userAccount.addressType === 1) {
      await transferByWallet()
    } else {
      changeSetPasswordModalOpen(true)
      changeOnPasswordModalConfirm(async (password) => {
        setTransferLoading(true)
        changeSetPasswordModalOpen(false)
        await transferByWallet(password)
        return setTransferLoading(false)
      })
    }
  }
  const goBack = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
  }
  return (
    <Box
      sx={{
        width: '100%',
        padding: '30px 16px 16px',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          border: '1.5px solid #E6EBF0',
          bgcolor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#141414',
          fontWeight: 500,
        }}
      >
        <FlexBox>
          <Box>From</Box>
          <Box>{textCenterEllipsis(userAccount?.proxyAddress || '', 5, 5)}</Box>
        </FlexBox>

        <LineBox />

        <FlexBox>
          <Box>To</Box>
          <Box>{isAddress(receiver) ? textCenterEllipsis(receiver, 5, 5) : '--'}</Box>
        </FlexBox>

        <LineBox />

        <FlexBox>
          <Box>Total Cost(Amount+Fee)</Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {amount ? (
              <>
                <Box sx={{ mr: 1 }}>
                  {amount} {reserve?.tokenSymbol} +
                </Box>
                <Box
                  component="img"
                  src={imageMap.transfer.transferTokenFeeFreeIcon}
                  sx={{
                    width: '48px',
                    height: '22px',
                  }}
                />
              </>
            ) : (
              '--'
            )}
          </Box>
        </FlexBox>

        <LineBox />

        <FlexBox>
          <Box>Expected Arrival</Box>
          <Box>2 blocks confirmation</Box>
        </FlexBox>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          disabled={transferLoading}
          sx={{
            width: '223px',
            height: '48px',
            backgroundColor: '#FFF',
            fontSize: '14px',
            border: '1px solid #4128D1',
            color: '#4128D1',
          }}
          onClick={goBack}
        >
          {t('Back')}
        </Button>
        <Button
          variant="surface"
          sx={{
            width: '223px',
            height: '48px',
            backgroundColor: '#4128D1',
            fontSize: '14px',
          }}
          onClick={onConfirm}
          disabled={transferLoading}
        >
          {transferLoading ? (
            <CircularProgress
              size="20px"
              thickness={6}
              sx={{
                [`& .${circularProgressClasses.circle}`]: {
                  stroke: '#DDD',
                },
              }}
            />
          ) : (
            t('Confirm')
          )}
        </Button>
      </Box>
    </Box>
  )
}
export default observer(StepTwo)
