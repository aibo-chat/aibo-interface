import { observer } from 'mobx-react-lite'
import React, { MouseEventHandler, useLayoutEffect, useMemo } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { Box } from '@mui/material'
import { AxiosResponse } from 'axios'
import { getMessageContent } from '../../hooks/useMessageContent'
import UpIcon from '../../../../public/res/svg/token_data/up.svg?react'
import DownIcon from '../../../../public/res/svg/token_data/down.svg?react'
import { FormattedNumber } from '../common/FormattedNumber'
import { useMobxStore } from '../../../stores/StoreProvider'
import TokenDataImageMap from '../../../images/tokenDataImageMap'
import DefedApi, { IResponseType } from '../../../api/defed-api'
import { request } from '../../../api/request'
import { DefedFinanceUrl } from '../../../constant'
import { BotAnswerMessageContent } from '../../../types/defed/message'

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
  const {
    appStore: { userAccount },
    roomStore: { tokenDataWithUserAndFeeds, updateTokenDataWithUserAndFeedsByTokenIds, updateTokenDataWithUserAndFeedsByTokenId },
  } = useMobxStore()
  const tokenDataForUser = data?.token_id ? tokenDataWithUserAndFeeds.get(data.token_id) : undefined
  const initTokenUserData = async () => {
    if (data?.token_id) {
      await updateTokenDataWithUserAndFeedsByTokenIds(data.token_id)
    }
  }
  useLayoutEffect(() => {
    initTokenUserData()
  }, [data?.token_id])
  const onStarClick: MouseEventHandler<HTMLDivElement> = async (event) => {
    event.stopPropagation()
    if (!userAccount?.proxyAddress || !tokenDataForUser || !data) {
      return
    }
    if (tokenDataForUser.isCollect !== undefined) {
      const bool = tokenDataForUser.isCollect === 'true'
      const res: AxiosResponse<IResponseType<boolean>> = await request.post(DefedApi.collectToken, {
        tokenId: data.token_id,
        collect: !bool,
      })
      if (res?.data?.data) {
        updateTokenDataWithUserAndFeedsByTokenId(data.token_id, {
          ...tokenDataForUser,
          isCollect: !bool ? 'true' : 'false',
        })
      }
    }
  }
  const onCardClick: MouseEventHandler<HTMLDivElement> = () => {
    if (!data) {
      return
    }
    window.open(`${DefedFinanceUrl}/token/?tokenId=${data.token_id}&action=Info`)
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
            height: 200,
            width: '398px',
            border: '1px solid #E6E8EC',
            borderRadius: '20px',
            p: 5,
            cursor: 'pointer',
            position: 'relative',
            ':hover': {
              borderColor: 'rgba(65, 40, 209, 0.50)',
            },
            backgroundColor: '#FFF',
          }}
          onClick={onCardClick}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              loading="lazy"
              decoding="async"
              src={data.token_logo}
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
              }}
            />
            <Box sx={{ ml: 2 }}>
              <Box sx={{ fontSize: '18px' }}>{data.token_name}</Box>
              <Box sx={{ color: '#78828C' }}>{data.token_symbol}</Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 3,
              }}
            >
              {Number(data.price[0].price_change_percentage_24h) > 0 ? <UpIcon /> : <DownIcon />}
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  fontSize: '14px',
                  color: Number(data.price[0].price_change_percentage_24h) > 0 ? '#00D0B7' : '#FF4940',
                }}
              >
                {Number(data.price[0].price_change_percentage_24h) > 0 && '+'}
                {(100 * Number(data.price[0].price_change_percentage_24h)).toFixed(2)}%
              </Box>
            </Box>
          </Box>

          <Box sx={{ my: 2 }}>
            <Box sx={{ color: '#BFC6CD', mr: 2, fontSize: '30px' }} component="span">
              $
            </Box>
            {data.price[0] ? <FormattedNumber value={data.price[0].price_latest} visibleDecimals={2} sx={{ fontSize: '30px' }} symbolsVariant="secondary24" /> : null}
          </Box>

          <Box
            component="img"
            loading="lazy"
            src={`https://s3.coinmarketcap.com/generated/sparklines/web/1d/2781/${data.id}.svg`}
            sx={{
              height: 45,
              filter: Number(data.price[0].price_change_percentage_24h) > 0 ? 'hue-rotate(85deg) saturate(80%) brightness(0.85)' : 'hue-rotate(300deg) saturate(210%) brightness(0.7) contrast(170%)',
            }}
          />
          {tokenDataForUser ? (
            <Box
              onClick={onStarClick}
              sx={{
                position: 'absolute',
                right: 20,
                top: 20,
              }}
              component="img"
              src={tokenDataForUser.isCollect === 'true' ? TokenDataImageMap.star : TokenDataImageMap.noStar}
            />
          ) : null}

          {tokenDataForUser ? (
            <Box
              sx={{
                fontSize: '14px',
                color: '#BFC6CD',
                position: 'absolute',
                bottom: 20,
                right: 20,
              }}
            >
              +{tokenDataForUser.feedsNumPast24h} feeds in 24h
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}
export default observer(TokenDataMessage)
