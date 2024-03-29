import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Box, ButtonBase, Tooltip } from '@mui/material'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import TriangleIcon from '../../../../public/res/svg/feeds_news/common_fullfilled_triangle_icon.svg?react'
import { getMessageContent } from '../../hooks/useMessageContent'
import { BotAnswerMessageContent } from '../../../types/defed/message'
import HintIcon from '../../../../public/res/svg/common/common_outlined_hint_icon.svg?react'
import etfMessageImageMap from '../../../images/etfMessageImageMap'

interface IETFMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
interface SingleETFContentTypeTotal {
  from_site: string
  id: string
  last_updated: number
  last_updated_utc: string
  latest_timestamp: number
  latest_timestamp_utc: string
  list: Array<{
    data_date_timestamp: number
    data_date_utc: string
    id: string
    total_net_assets: number
    total_net_inflow: number
    total_volume: number
    total_net_assets_change: number
    total_net_inflow_change: number
    total_volume_change: number
  }>
  name: string
  search_name: string
  total: number
  total_page: number
}
interface SingleETFContentTypeDetail {
  id: string
  last_updated: number
  last_updated_utc: string
  list: Array<{
    data_date_timestamp: number
    data_date_utc: string
    mkt_price: number
    ticker_1d_netInflow: number
    ticker_cum_netInflow: number
    ticker_net_assets: number
    ticker_net_assetsChange: number
    ticker_prem_dsc: number
    ticker_value_traded: number
  }>
  ticker_symbol: string
  name: string
}
const ETFMessage: React.FC<IETFMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const { t } = useTranslation()
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const etfContent = useMemo<Array<SingleETFContentTypeTotal | SingleETFContentTypeDetail>>(() => {
    if (messageBody?.answer) {
      try {
        return JSON.parse(messageBody.answer)
      } catch (e) {
        return []
      }
    } else {
      return []
    }
  }, [messageBody.answer])
  const targetDetailETFData = useMemo(() => {
    if (messageBody?.action === 'data' && messageBody.links.length && etfContent.length) {
      const linkArray = messageBody.links[0].split(',')
      return (etfContent as Array<SingleETFContentTypeDetail>)
        .filter((data) => linkArray.includes(data.ticker_symbol))
        .map((data) => ({
          ...(data?.list?.[0] || {}),
          ticker_symbol: data.ticker_symbol,
        }))
    }
  }, [etfContent, messageBody.action, messageBody.links])
  const targetTotalETFData = useMemo(() => {
    if (!messageBody?.action) {
      const targetData = (etfContent as Array<SingleETFContentTypeTotal>)?.[0]
      if (targetData?.list?.length) {
        const finalData = targetData.list[0]
        if (finalData.id) return finalData
      }
    }
  }, [etfContent, messageBody?.action])
  const totalDisplayTime = useMemo(() => {
    if (targetTotalETFData) {
      return dayjs(targetTotalETFData.data_date_timestamp * 1000).format('YYYY-MM-DD')
    }
  }, [targetTotalETFData])

  const goNext = () => {
    if (!swiperRef.current) return
    swiperRef.current.slideNext()
  }

  const goPrev = () => {
    if (!swiperRef.current) return
    swiperRef.current.slidePrev()
  }

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return
    swiperRef.current.slideTo(index)
  }
  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
  const getComputedNumberWithUnit = (number: number | string | BigNumber, decimal: number) => {
    const bigNumber = new BigNumber(number)
    if (bigNumber.abs().isGreaterThan(10 ** 9)) {
      return {
        number: bigNumber.div(10 ** 9).toFormat(decimal),
        unit: 'B',
      }
    }
    if (bigNumber.abs().isGreaterThan(10 ** 6)) {
      return {
        number: bigNumber.div(10 ** 6).toFormat(decimal),
        unit: 'M',
      }
    }
    if (bigNumber.abs().isGreaterThan(10 ** 3)) {
      return {
        number: bigNumber.div(10 ** 3).toFormat(decimal),
        unit: 'K',
      }
    }
    return {
      number: bigNumber.toFormat(decimal),
      unit: '',
    }
  }
  const renderPremDscPart = (value: string | number) => {
    const bigNumber = new BigNumber(value)
    const isZero = bigNumber.isZero()
    return (
      <Box
        sx={{
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '20px',
          color: isZero ? '#191919' : bigNumber.isGreaterThan(0) ? '#00D0B7' : '#FF4940',
          fill: isZero ? '#191919' : bigNumber.isGreaterThan(0) ? '#00D0B7' : '#FF4940',
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box component="span">{bigNumber.times(10 ** 2).toFormat(2)}</Box>
        <Box component="span">%</Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TriangleIcon
            style={{
              marginLeft: '6px',
              width: '8px',
              height: '8px',
              transform: `rotate(${bigNumber.isGreaterThan(0) ? 90 : 270}deg)`,
            }}
          />
        </Box>
      </Box>
    )
  }
  const renderNetInflowPart = (value: number) => {
    const bigNumber = new BigNumber(value)
    const isZero = bigNumber.isZero()
    const computedNumberWithUnit = getComputedNumberWithUnit(bigNumber.abs(), 1)
    return (
      <Box
        sx={{
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '20px',
          color: isZero ? '#191919' : bigNumber.isGreaterThan(0) ? '#16C784' : '#EA3943',
          fill: isZero ? '#191919' : bigNumber.isGreaterThan(0) ? '#16C784' : '#EA3943',
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box component="span">{bigNumber.isGreaterThan(0) ? '+' : '-'}</Box>
        <Box component="span">$</Box>
        <Box component="span">{computedNumberWithUnit.number}</Box>
        <Box component="span">{computedNumberWithUnit.unit}</Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TriangleIcon
            style={{
              marginLeft: '6px',
              width: '8px',
              height: '8px',
              transform: `rotate(${bigNumber.isGreaterThan(0) ? 90 : 270}deg)`,
            }}
          />
        </Box>
      </Box>
    )
  }
  const renderDetailContentPart = (value: number | string, percent?: number) => {
    const computedNumberWithUnit = getComputedNumberWithUnit(value, 2)
    const percentBigNumber = new BigNumber(percent || 0)
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box className="itemBodyContent">
          <Box component="span" className="itemBodyContentPrefix">
            $
          </Box>
          <Box component="span">{computedNumberWithUnit.number}</Box>
          <Box component="span">{computedNumberWithUnit.unit}</Box>
        </Box>
        {percentBigNumber.isZero() ? null : (
          <Box
            sx={{
              fontSize: '12px',
              color: percentBigNumber.isGreaterThan(0) ? '#16C784' : '#EA3943',
              fontWeigh: 500,
              lineHeight: '15px',
              marginLeft: '8px',
              padding: '2px',
              borderRadius: '2px',
              backgroundColor: percentBigNumber.isGreaterThan(0) ? '#16C7841A' : '#EA39431A',
            }}
          >
            <Box component="span">{percentBigNumber.isGreaterThan(0) ? '+' : '-'}</Box>
            <Box component="span">
              {percentBigNumber
                .times(10 ** 2)
                .abs()
                .toFormat(2)}
            </Box>
            <Box component="span">%</Box>
          </Box>
        )}
      </Box>
    )
  }
  return (
    <Box
      sx={{
        width: { lg: 'auto', xs: '100%' },
      }}
    >
      <Box
        sx={{
          fontSize: '15px',
          fontWeight: 420,
          lineHeight: '22px',
          marginBottom: '8px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {messageBody.chatAnswer}
      </Box>
      {targetTotalETFData ? (
        <Box
          sx={{
            width: { lg: 'auto', xs: '100%' },
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& .itemContainer': {
              border: '1px solid #F0F0F7',
              width: '184px',
              height: '160px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginRight: '16px',
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: '#F8F8FB',
              position: 'relative',
              '& .itemTimePart': {
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '16px',
                color: '#BFC6CD',
              },
              '& .itemImage': {
                position: 'absolute',
              },
              '& .itemBody': {
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '17px',
                color: '#78828C',
                '&Content': {
                  fontSize: '22px',
                  fontWeight: 500,
                  lineHeight: '26px',
                  color: '#191919',
                  display: 'flex',
                  alignItems: 'center',
                  '&Prefix': {
                    fontSize: '16px',
                    color: '#BFC6CD',
                    lineHeight: '20px',
                    marginRight: '4px',
                  },
                },
              },
            },
          }}
        >
          <Box className="itemContainer">
            <Box className="itemTimePart">{totalDisplayTime}</Box>
            <Box
              className="itemImage"
              sx={{
                width: '84px',
                height: '84px',
                top: '11px',
                right: '16px',
              }}
              component="img"
              src={etfMessageImageMap.etfMessageTotalNetInflowIcon}
            />
            <Box className="itemBody">
              {renderDetailContentPart(targetTotalETFData.total_net_inflow, targetTotalETFData.total_net_inflow_change)}
              <Box>{t('Total Net Inflow')}</Box>
            </Box>
          </Box>
          <Box className="itemContainer">
            <Box className="itemTimePart">{totalDisplayTime}</Box>
            <Box
              className="itemImage"
              sx={{
                width: '84px',
                height: '84px',
                top: '11px',
                right: '6px',
              }}
              component="img"
              src={etfMessageImageMap.etfMessageTotalValueTradedIcon}
            />
            <Box className="itemBody">
              {renderDetailContentPart(targetTotalETFData.total_volume, targetTotalETFData.total_volume_change)}
              <Box>{t('Total Value Traded')}</Box>
            </Box>
          </Box>
          <Box className="itemContainer">
            <Box className="itemTimePart">{totalDisplayTime}</Box>
            <Box
              className="itemImage"
              sx={{
                width: '84px',
                height: '84px',
                top: '9px',
                right: '6px',
              }}
              component="img"
              src={etfMessageImageMap.etfMessageTotalNetAssetsIcon}
            />
            <Box className="itemBody">
              {renderDetailContentPart(targetTotalETFData.total_net_assets, targetTotalETFData.total_net_assets_change)}
              <Box>{t('Total Net Assets')}</Box>
            </Box>
          </Box>
        </Box>
      ) : targetDetailETFData?.length ? (
        <Box
          sx={{
            borderRadius: '20px',
            padding: '52px 24px 0',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            width: '243px',
            height: '238px',
            border: '1px solid #F0F0F7',
            position: 'relative',
            backgroundImage: `url(${etfMessageImageMap.etfMessageTotalBackground})`,
            backgroundSize: 'cover',
            '& .itemContainer': {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: { xs: '14px', lg: '16px' },
            },
            '& .itemTitle': {
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '18px',
              color: '#78828C',
            },
            '& .itemContent': {
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '20px',
              color: '#23282D',
            },
          }}
        >
          <Swiper
            pagination={false}
            direction="horizontal"
            slidesPerView={1}
            style={{ overflow: 'hidden', width: '100%' }}
            simulateTouch
            allowTouchMove
            initialSlide={0}
            onSwiper={(swiper: SwiperClass) => {
              swiperRef.current = swiper
            }}
            onSlideChange={handleSlideChange}
          >
            {targetDetailETFData.map((targetDetailETFSingleData, index) => (
              <SwiperSlide key={`${targetDetailETFSingleData.ticker_symbol}-${index}`}>
                <Box>
                  <Box className="itemContainer">
                    <Box className="itemTitle">{t('Ticker')}</Box>
                    <Box className="itemContent">{targetDetailETFSingleData.ticker_symbol}</Box>
                  </Box>
                  <Box className="itemContainer">
                    <Box className="itemTitle">{t('1DInflow')}</Box>
                    {renderNetInflowPart(targetDetailETFSingleData.ticker_1d_netInflow)}
                  </Box>
                  <Box className="itemContainer">
                    <Box className="itemTitle">{t('Prem/Dsc')}</Box>
                    {renderPremDscPart(targetDetailETFSingleData.ticker_prem_dsc)}
                  </Box>
                  <Box className="itemContainer" sx={{ marginBottom: '20px' }}>
                    <Box className="itemTitle">{t('MktPrice')}</Box>
                    <Box className="itemContent">
                      <Box component="span">$</Box>
                      <Box component="span">{targetDetailETFSingleData.mkt_price}</Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '16px',
                        color: '#BFC6CD',
                        marginRight: '4px',
                      }}
                    >
                      {dayjs(targetDetailETFSingleData?.data_date_timestamp).format('YYYY-MM-DD')}
                    </Box>
                    <Tooltip title={t('Only data disclosed and updated by the ETF issuer as of the update time are included.')}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HintIcon
                          style={{
                            width: '16px',
                            height: '16px',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          {targetDetailETFData?.length && targetDetailETFData.length > 1 ? (
            <Box
              sx={{
                marginTop: 'auto',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFeatureSettings: "'clig' off, 'liga' off",
                fontFamily: 'var(--font-secondary)',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '12px',
                padding: '0 0 8px',
              }}
            >
              <ButtonBase onClick={goPrev}>
                <TriangleIcon
                  style={{
                    width: '6px',
                    height: '8px',
                    fill: '#CCCCCC',
                  }}
                />
              </ButtonBase>
              {targetDetailETFData.map((item, index) => (
                <ButtonBase
                  key={index}
                  sx={{
                    color: swiperIndex === index ? '#838383' : '#CCCCCC',
                  }}
                  onClick={() => {
                    goToSlide(index)
                  }}
                >
                  {index + 1}
                </ButtonBase>
              ))}
              <ButtonBase onClick={goNext}>
                <TriangleIcon
                  style={{
                    width: '6px',
                    height: '8px',
                    fill: '#CCCCCC',
                    transform: 'rotate(180deg)',
                  }}
                />
              </ButtonBase>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box
          sx={{
            color: 'red',
          }}
        >
          {t('ERROR ETF DATA')}
        </Box>
      )}
    </Box>
  )
}
export default observer(ETFMessage)
