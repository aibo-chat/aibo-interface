import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { EventTimelineSet, IContent, MatrixClient, MatrixEvent, RelationType } from 'matrix-js-sdk'
import { Box, Skeleton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useDebounce, useIsomorphicLayoutEffect } from 'ahooks'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { useMessageContent } from '../../../hooks/useMessageContent'
import { DefedMsgType } from '../../../../types/defed/message'
import { UserToken } from '../../../../stores/user-asset-store'
import TransferImageMap from '../../../../images/transferImageMap'
import StepOne from './StepOne'
import { FormattedNumber } from '../../common/FormattedNumber'
import StepTwo from './StepTwo'
import { useMatrixClient } from '../../../hooks/useMatrixClient'
import OrderPart from './OrderPart'
import { TxStatus } from '../../../../stores/ai-store'
import { isAddress } from '../../../utils/common'

interface IAiTransferMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
export interface CommonTransferMessageContent {
  amount: string
  target: string
  head_title: string
  network?: string
  symbol: string
  sender_id?: number
  receiver_id?: number
  token_symbol?: string
  token_name?: string
  transfer_amount?: string
  from?: string
  to?: string
  chain_id?: string | number
  tx_status?: TxStatus
  token_decimals?: string
}
const CommonTransferMessage: React.FC<IAiTransferMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const { t } = useTranslation()
  const mx = useMatrixClient() as MatrixClient
  const {
    appStore: { userAccount },
    userAssetStore: { userAsset },
  } = useMobxStore()
  const [messageBody] = useMessageContent<CommonTransferMessageContent>(mEventId, mEvent, timelineSet)
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const [reserve, setReserve] = useState<UserToken>()
  const [amount, setAmount] = useState<string | number>('')
  const [receiver, setReceiver] = useState<string>('')
  const [initDone, setInitDone] = useState<boolean>(false)
  const debouncedInitDone = useDebounce(initDone, { wait: 500 })
  const maxAmountToTransfer = reserve?.amountDecimal || '0'
  const orderId = useMemo(() => {
    if (messageBody?.sender_id !== undefined && messageBody.from && messageBody.from === userAccount?.proxyAddress) {
      return messageBody.sender_id
    }
    if (messageBody?.receiver_id !== undefined && messageBody.to && messageBody.to === userAccount?.proxyAddress) {
      return messageBody.receiver_id
    }
  }, [messageBody?.from, messageBody?.receiver_id, messageBody?.sender_id, messageBody?.to, userAccount?.proxyAddress])
  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
  const updateMessage = async (newContent: { [p in keyof CommonTransferMessageContent]?: CommonTransferMessageContent[p] }) => {
    const finalNewContent = {
      ...messageBody,
      ...newContent,
    }
    const content: IContent = {
      msgtype: DefedMsgType.CommonTransfer,
      body: finalNewContent,
      'm.new_content': {
        msgtype: DefedMsgType.CommonTransfer,
        body: finalNewContent,
      },
      'm.relates_to': {
        event_id: mEvent.getId(),
        rel_type: RelationType.Replace,
      },
    }
    const roomId = mEvent.getRoomId()
    if (!roomId) return
    try {
      await mx.sendMessage(roomId, content)
    } catch (e) {
      console.error(e)
    }
  }
  const initTransferData = async () => {
    if (orderId) {
      setInitDone(true)
    } else {
      if (!userAsset?.userTokenList?.length) return
      const defaultReverse = userAsset?.userTokenList?.find((r) => {
        if (messageBody?.network) {
          return r.chainName.toLowerCase() === messageBody.network.toLowerCase() && r.tokenSymbol.toLowerCase() === messageBody?.symbol?.toLowerCase()
        }
        return r.tokenSymbol.toLowerCase() === messageBody?.symbol?.toLowerCase()
      })
      if (defaultReverse) {
        setReserve(defaultReverse)
      }
      if (messageBody?.amount) {
        const maxAmount = defaultReverse?.amountDecimal || '0'
        const flooredMaxValue = Math.floor(Number(maxAmount) * 10000) / 10000
        setAmount(Math.min(Number(flooredMaxValue), Number(messageBody.amount)))
      }
      if (messageBody?.target && isAddress(messageBody.target)) {
        setReceiver(messageBody.target)
      }
      setInitDone(true)
    }
  }
  useIsomorphicLayoutEffect(() => {
    initTransferData()
  }, [orderId])
  return (
    <Box>
      <Box
        sx={{
          fontSize: '15px',
          fontWeight: 420,
          lineHeight: '22px',
          marginBottom: '8px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {messageBody?.head_title}
      </Box>
      {debouncedInitDone ? (
        <Box
          sx={{
            width: '503px',
            backgroundColor: '#FBFBFE',
            borderRadius: '20px',
            border: '1px solid #4128D10D',
            position: 'relative',
            padding: '16px 0',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '6px',
              left: '12px',
              width: '128px',
              height: '37px',
            }}
            component="img"
            src={TransferImageMap.commonTransferMessageLogo}
          />
          {!orderId ? (
            <Box
              sx={{
                width: '100%',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '20px',
                color: '#35DBC0',
                padding: '0 16px',
              }}
            >
              {swiperIndex === 0 ? (
                <>
                  <Box component="span">{t('Balance')}</Box>
                  <Box
                    component="span"
                    sx={{
                      marginRight: '4px',
                    }}
                  >
                    :
                  </Box>
                  <Box component="span">
                    <FormattedNumber value={maxAmountToTransfer} variant="secondary14" color="text.primary" symbolsColor="text.primary" visibleDecimals={4} floor />
                  </Box>
                </>
              ) : null}
            </Box>
          ) : null}
          {orderId ? (
            <OrderPart orderId={orderId} defaultData={messageBody} />
          ) : (
            <Swiper
              pagination={false}
              direction="horizontal"
              slidesPerView={1}
              style={{ overflow: 'hidden' }}
              simulateTouch={false}
              initialSlide={0}
              onSwiper={(swiper: SwiperClass) => {
                swiperRef.current = swiper
              }}
              onSlideChange={handleSlideChange}
            >
              <SwiperSlide
                style={{
                  height: swiperIndex === 0 ? 'auto' : '0px',
                }}
              >
                <StepOne
                  swiperRef={swiperRef}
                  reserve={reserve as UserToken}
                  setReserve={setReserve}
                  maxValue={maxAmountToTransfer}
                  amount={amount}
                  setAmount={setAmount}
                  receiver={receiver}
                  setReceiver={setReceiver}
                  defaultNetwork={messageBody?.network}
                />
              </SwiperSlide>
              <SwiperSlide
                style={{
                  height: swiperIndex === 1 ? 'auto' : '0px',
                }}
              >
                <StepTwo swiperRef={swiperRef} reserve={reserve} receiver={receiver} amount={amount} updateMessage={updateMessage} />
              </SwiperSlide>
            </Swiper>
          )}
        </Box>
      ) : (
        <Skeleton
          sx={{
            width: '503px',
            height: '324px',
            borderRadius: '20px',
          }}
          animation="wave"
        />
      )}
    </Box>
  )
}
export default observer(CommonTransferMessage)
