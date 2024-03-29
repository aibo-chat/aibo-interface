import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Box, Button, Skeleton } from '@mui/material'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useDebounce, useIsomorphicLayoutEffect } from 'ahooks'
import { BigNumber } from 'bignumber.js'
import { useMessageContent } from '../../../hooks/useMessageContent'
import ResultPart from './ResultPart'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import ConvertCardMessageLogo from '../../../../../public/res/svg/transfer/convert_card_message_logo.svg?react'
import { IConvertTokenList, useConvert } from '../../../hooks/aptos/useConvert'

interface IConvertCardMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}

interface ConvertCardMessageContent {
  price: string
  from_amount: string
  from_symbol: string
  from_network?: string
  to_amount: string
  to_symbol: string
  head_title: string
  to_network?: string
  order_type?: string
  original_answer?: { action: string; fromAmount: string; fromNetwork: string; fromToken: string; price: string; toAmount: string; toNetwork: string; toToken: string }
  order_detail?: {
    from_amount: string
    from_symbol: string
    to_amount: string
    to_symbol: string
    transaction_fee: string
    tx_hash: string
  }
}
const ConvertCardMessage: React.FC<IConvertCardMessageProps> = ({ timelineSet, mEventId, mEvent }) => {

  const [messageBody] = useMessageContent<ConvertCardMessageContent>(mEventId, mEvent, timelineSet)
  const [initDone, setInitDone] = useState<boolean>(false)
  const debouncedInitDone = useDebounce(initDone, { wait: 500 })
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const [fromToken, setFromToken] = useState<IConvertTokenList>()
  const [toToken, setToToken] = useState<IConvertTokenList>()
  const [fromAmount, setFromAmount] = useState<string>('0')
  const toAmount = useMemo(() => new BigNumber(fromAmount || 0).times(1.2).toFormat(4), [fromAmount])
  const exchangeRate = useMemo(() => (fromAmount && toAmount && !new BigNumber(fromAmount).isZero() ? new BigNumber(toAmount).div(fromAmount).toFormat(4) : '0'), [fromAmount, toAmount])
  const route = useMemo(() => [fromToken?.symbol, toToken?.symbol], [fromToken?.symbol, toToken?.symbol])
  const fee = useMemo(() => new BigNumber(fromAmount || 0).times(0.01).toFormat(4), [fromAmount])
  const { convertTokenList: fromTokenList } = useConvert()
  const toTokenList = useMemo(() => fromTokenList.filter((token) => token.address !== fromToken?.address), [fromToken?.address, fromTokenList])
  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
  const initData = () => {
    if (messageBody) {
      let fromToken = fromTokenList[0]
      if (messageBody?.from_symbol) {
        const findFromToken = fromTokenList.find((token) => token.symbol?.toUpperCase() === messageBody.from_symbol.toUpperCase())
        if (findFromToken) {
          fromToken = findFromToken
        }
      }
      setFromToken(fromToken)
      let toToken = fromTokenList[1]
      if (messageBody?.to_symbol) {
        const findToToken = toTokenList.find((token) => token.symbol === messageBody.to_symbol)
        if (findToToken) {
          toToken = findToToken
        }
      }
      setToToken(toToken)
      setFromAmount(messageBody.from_amount || '0')
    }
    setInitDone(true)
  }
  useIsomorphicLayoutEffect(() => {
    initData()
  }, [messageBody?.from_symbol])
  const goNext = () => {
    if (!swiperRef.current) return
    swiperRef.current.slideNext()
  }
  const goPrev = () => {
    if (!swiperRef.current) return
    swiperRef.current.slidePrev()
  }
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
        <Box>{messageBody?.head_title}</Box>
      </Box>
      {debouncedInitDone ? (
        messageBody?.order_detail ? (
          <ResultPart />
        ) : (
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#FFF',
              borderRadius: '0px 8px 8px 8px',
              padding: '7px 12px 12px',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ConvertCardMessageLogo
                style={{
                  width: '130px',
                  height: '20px',
                }}
              />
            </Box>
            <Swiper
              pagination={false}
              direction="horizontal"
              slidesPerView={1}
              style={{ overflow: 'hidden' }}
              simulateTouch={false}
              allowTouchMove={false}
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
                  fromToken={fromToken}
                  setFromToken={setFromToken}
                  toToken={toToken}
                  setToToken={setToToken}
                  fromAmount={fromAmount}
                  setFromAmount={setFromAmount}
                  toAmount={toAmount}
                  exchangeRate={exchangeRate}
                  route={route}
                  fromTokenList={fromTokenList}
                  toTokenList={toTokenList}
                />
              </SwiperSlide>
              <SwiperSlide
                style={{
                  height: swiperIndex === 1 ? 'auto' : '0px',
                }}
              >
                <StepTwo fromToken={fromToken} toToken={toToken} fromAmount={fromAmount} toAmount={toAmount} exchangeRate={exchangeRate} fee={fee} />
              </SwiperSlide>
            </Swiper>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '16px',
              }}
            >
              {swiperIndex === 0 ? (
                <Button
                  sx={{
                    bgcolor: '#25B1FF',
                    borderRadius: '8px',
                    height: 34,
                    width: 150,
                    color: '#fff',
                    fontSize: '14px',
                    m: 'auto',
                    fontWeight: 500,
                    ':hover': {
                      bgcolor: '#25B1FF',
                      opacity: '.8',
                    },
                  }}
                  onClick={goNext}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #25B1FF',
                      height: 34,
                      width: 150,
                      color: '#25B1FF',
                      fontSize: '14px',
                      fontWeight: 500,
                      ':hover': {
                        bgcolor: '#fff',
                        opacity: '.8',
                      },
                    }}
                    onClick={goPrev}
                  >
                    Back
                  </Button>
                  <Button
                    sx={{
                      bgcolor: '#25B1FF',
                      borderRadius: '8px',
                      height: 34,
                      width: 150,
                      color: '#fff',
                      fontSize: '14px',
                      m: 'auto',
                      fontWeight: 500,
                      ':hover': {
                        bgcolor: '#25B1FF',
                        opacity: '.8',
                      },
                    }}
                    onClick={goNext}
                  >
                    Confirm
                  </Button>
                </>
              )}
            </Box>
          </Box>
        )
      ) : (
        <Skeleton
          sx={{
            width: '100%',
            height: '298px',
          }}
          animation="wave"
        />
      )}
    </Box>
  )
}
export default observer(ConvertCardMessage)
