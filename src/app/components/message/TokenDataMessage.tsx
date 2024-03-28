import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { Box } from '@mui/material'
import BigNumber from 'bignumber.js'
import { getMessageContent } from '../../hooks/useMessageContent'
import UpIcon from '../../../../public/res/svg/token_data/up.svg?react'
import DownIcon from '../../../../public/res/svg/token_data/down.svg?react'
import { FormattedNumber } from '../common/FormattedNumber'
import { BotAnswerMessageContent } from '../../../types/defed/message'
import TokenDataLogo from '../../../../public/res/svg/token_data/token_data_logo.svg?react'

interface ITokenDataMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
interface price {
  ath: number
  atl: number
  currency: string
  fully_diluted_valuation: number
  high_24h: number
  low_24h: number
  market_cap: number
  price_change_percentage_1h: number
  price_change_percentage_7d: number
  price_change_percentage_24h: number
  price_change_percentage_30d: number
  price_change_percentage_60d: number
  price_change_percentage_90d: number
  price_latest: number
  vol_spot_24h: number
  vol_spot_change_24h: number
}
interface token_urls {
  announcement: Array<string>
  chat: Array<string>
  explorer: Array<string>
  facebook: Array<string>
  message_board: Array<string>
  reddit: Array<string>
  source_code: Array<string>
  technical_doc: Array<string>
  twitter: Array<string>
  website: Array<string>
}
interface SingleTokenData {
  circulating_supply: number
  cmc_rank: number
  from_site: string
  id: number
  is_coinmart: boolean
  is_trending: boolean
  last_updated: number
  last_updated_utc: string
  max_supply: number
  name: string
  num_market_pairs: number
  price: Array<price>
  slug: string
  token_category: string
  token_contract_address: Array<string>
  token_description: string
  token_id: string
  token_logo: string
  token_name: string
  token_notice: string
  token_slug: string
  token_symbol: string
  token_tag_groups: Array<string>
  token_tag_names: Array<string>
  token_tags: Array<string>
  token_twitter_username: string
  token_urls: token_urls
  total_supply: number
  trending_rank: number
}

const TokenDataMessage: React.FC<ITokenDataMessageProps> = ({ timelineSet, mEventId, mEvent }) => {
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const newsContent = useMemo<Array<SingleTokenData>>(() => {
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

  const data = useMemo(() => (Array.isArray(newsContent) ? newsContent[0] : null), [newsContent])

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
  const renderMoreData = (title: string, price: number) => {
    const { number, unit } = getComputedNumberWithUnit(price, 2)
    return (
      <Box>
        <Box>{title}</Box>
        <Box>
          ${number}
          {unit}
        </Box>
      </Box>
    )
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
        {messageBody.chatAnswer}
      </Box>
      {data?.price?.[0] ? (
        <Box
          sx={{
            width: '100%',
            borderRadius: '0px 8px 8px 8px',
            p: '7px 12px 12px',
            backgroundColor: '#FFF',
          }}
        >
          <Box
            sx={{
              width: '100%',
            }}
          >
            <TokenDataLogo
              style={{
                width: '170px',
                height: '21px',
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '74px',
            }}
          >
            <Box
              component="img"
              loading="lazy"
              decoding="async"
              src={data.token_logo}
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
            <Box sx={{ ml: '12px', flexShrink: 0 }}>
              <Box sx={{ fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#23282D' }}>{data.token_name}</Box>
              <Box sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '16px', color: '#78828C' }}>{data.token_symbol}</Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                loading="lazy"
                src={`https://s3.coinmarketcap.com/generated/sparklines/web/1d/2781/${data.id}.svg`}
                sx={{
                  width: '70px',
                  height: '35px',
                  filter:
                    Number(data.price[0].price_change_percentage_24h) > 0 ? 'hue-rotate(85deg) saturate(80%) brightness(0.85)' : 'hue-rotate(300deg) saturate(210%) brightness(0.7) contrast(170%)',
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <Box sx={{ fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#23282D' }}>
                $
                {data.price[0] ? (
                  <FormattedNumber
                    value={data.price[0].price_latest}
                    visibleDecimals={2}
                    symbolsVariant="secondary24"
                    sx={{ fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#23282D' }}
                  />
                ) : null}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {Number(data.price[0].price_change_percentage_24h) > 0 ? <UpIcon /> : <DownIcon />}
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    fontSize: '12px',
                    color: Number(data.price[0].price_change_percentage_24h) > 0 ? '#00D0B7' : '#FF4940',
                  }}
                >
                  {Number(data.price[0].price_change_percentage_24h) > 0 && '+'}
                  {(100 * Number(data.price[0].price_change_percentage_24h)).toFixed(2)}%
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: '1px',
              backgroundColor: '#F5F5F5',
              marginBottom: '16px',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '40px',
              '& > div:nth-child(odd)': {
                flex: 1,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 500,
                color: '#78828C',
                '& > div:nth-child(2)': {
                  color: '#23282D',
                },
              },
              '& > div:nth-child(even)': {
                width: '1px',
                height: '100%',
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            {renderMoreData('Market cap', data.price[0].market_cap)}
            <Box />
            {renderMoreData('24H High', data.price[0].high_24h)}
            <Box />
            {renderMoreData('24H Low', data.price[0].low_24h)}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
export default observer(TokenDataMessage)
