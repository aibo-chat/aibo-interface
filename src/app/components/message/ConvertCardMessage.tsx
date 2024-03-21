import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Box, Button } from '@mui/material'
import BigNumber from 'bignumber.js'
import { getMessageContent } from '../../hooks/useMessageContent'
import { useMobxStore } from '../../../stores/StoreProvider'
import transferImageMap from '../../../images/transferImageMap'
import { DefedFinanceUrl } from '../../../constant'
import ExchangeIcon from '../../../../public/res/svg/common/common_outlined_exchange_icon.svg?react'

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
  to_network?: string
  order_type?: string
  original_answer?: { action: string; fromAmount: string; fromNetwork: string; fromToken: string; price: string; toAmount: string; toNetwork: string; toToken: string }
}
const ConvertCardMessage: React.FC<IConvertCardMessageProps> = ({ timelineSet, mEventId, mEvent }) => {
  const { t } = useTranslation()
  const {
    modalStore: { changeIframeAppData },
  } = useMobxStore()
  const messageBody = getMessageContent<ConvertCardMessageContent>(timelineSet, mEventId, mEvent)
  const totalAnswerString = useMemo(() => {
    try {
      console.log('尝试转化TotalAnswerString,此时的messageBody:', messageBody)
      return JSON.stringify(messageBody || '')
    } catch (e) {
      console.error('转化TotalAnswerString失败了:', e)
      return ''
    }
  }, [messageBody])
  const originalAnswerString = useMemo(() => {
    try {
      console.log('尝试转化OriginalAnswerString,此时的messageBody?.original_answer:', messageBody?.original_answer)
      return JSON.stringify(messageBody?.original_answer || '')
    } catch (e) {
      console.error('转化OriginalAnswerString失败了:', e)
      return ''
    }
  }, [messageBody?.original_answer])
  const finalUrl = useMemo(() => {
    const targetData = JSON.stringify({
      fromSymbol: messageBody?.from_symbol?.toUpperCase(),
      fromChain: messageBody?.from_network,
      fromAmount: messageBody?.from_amount,
      toSymbol: messageBody?.to_symbol?.toUpperCase(),
      toChain: messageBody?.to_network,
      toAmount: messageBody?.to_amount,
      price: messageBody?.price,
      orderType: messageBody?.order_type,
    })
    return `${DefedFinanceUrl}/convert/?userWay=iframe&data=${encodeURIComponent(targetData)}`
  }, [
    messageBody?.from_amount,
    messageBody?.from_network,
    messageBody?.from_symbol,
    messageBody?.order_type,
    messageBody?.price,
    messageBody?.to_amount,
    messageBody?.to_network,
    messageBody?.to_symbol,
  ])
  const orderType = useMemo(() => {
    if (messageBody?.from_amount && messageBody?.to_amount) {
      return 'limit'
    }
    if ((messageBody?.from_amount || messageBody?.to_amount) && messageBody?.price) {
      return 'limit'
    }
    return 'market'
  }, [messageBody?.from_amount, messageBody?.price, messageBody?.to_amount])
  return (
    <Box>
      <Box
        sx={{
          fontSize: '15px',
          fontWeight: 420,
          lineHeight: '22px',
          marginBottom: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <Box
          sx={{
            marginBottom: '8px',
          }}
        >
          {t('DEFED DEX allows you to convert between different assets. The specific assets that can be converted depend on the available liquidity pools and trading pairs on the platform.')}
        </Box>
        <Box
          sx={{
            marginBottom: '8px',
          }}
        >
          MessageBody:
          <Box
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {totalAnswerString}
          </Box>
        </Box>
        <Box
          sx={{
            marginBottom: '8px',
          }}
        >
          OriginalAnswer:
          <Box
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {originalAnswerString}
          </Box>
        </Box>
        <Box
          sx={{
            marginBottom: '8px',
          }}
        >{`FinalUrl: ${finalUrl}`}</Box>
        <Box
          sx={{
            marginBottom: '8px',
          }}
        >{`FrontOrderType vs OriginOrderType: ${orderType} vs ${messageBody?.order_type}`}</Box>
      </Box>
      <Box
        sx={{
          width: '503px',
          height: '301px',
          backgroundImage: `url(${transferImageMap.convertCardBackground})`,
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 24px',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '24px',
            color: '#4128D1',
            marginTop: '12px',
            paddingLeft: '140px',
            height: '24px',
          }}
        >
          {messageBody?.order_type === 'limit' || messageBody?.order_type === 'market' ? `(${messageBody?.order_type === 'limit' ? 'Limit' : 'Market'} Order)` : ''}
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: '24px',
            color: '#4128D1',
            marginTop: '64px',
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >{`${messageBody.from_amount ? new BigNumber(messageBody.from_amount).toFormat(4) : ''} ${messageBody.from_symbol || '???'}`}</Box>
          <Box
            sx={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFF',
              boxShadow: '0px 4px 10px 0px #4128D11A',
              borderRadius: '12px',
              margin: '0 8px',
              flexShrink: 0,
            }}
          >
            <ExchangeIcon
              style={{
                width: '14px',
                height: '14px',
                fill: '#4128D1',
              }}
            />
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >{`${messageBody.to_amount ? new BigNumber(messageBody.to_amount).toFormat(4) : ''} ${messageBody.to_symbol || '???'}`}</Box>
        </Box>
        <Button
          variant="surface"
          sx={{
            marginTop: 'auto',
            width: '233px',
            height: '48px',
            backgroundColor: '#4128D1',
          }}
          onClick={() => {
            changeIframeAppData({
              key: 'transfer_card',
              url: finalUrl,
              icon: transferImageMap.convertAppSideBarIcon,
            })
          }}
        >
          {t('Enter')}
        </Button>
      </Box>
    </Box>
  )
}
export default observer(ConvertCardMessage)
