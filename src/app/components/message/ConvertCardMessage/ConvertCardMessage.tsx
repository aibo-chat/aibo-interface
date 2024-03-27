import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import { useMessageContent } from '../../../hooks/useMessageContent'

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
  order_detail?: {
    from_amount: string
    from_symbol: string
    to_amount: string
    to_symbol: string
    transaction_fee: string
    tx_hash: string
  }
}
interface TokenData {
  address: string
  chainId: number
  decimals: number
  logoURI: string
  name: string
  symbol: string
}
const ConvertCardMessage: React.FC<IConvertCardMessageProps> = ({ timelineSet, mEventId, mEvent }) => {
  const { t } = useTranslation()
  const messageBody = useMessageContent<ConvertCardMessageContent>(mEventId, mEvent, timelineSet)
  const TokenList = useMemo<Array<TokenData>>(() => [], [])
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
      </Box>
      <Box
        sx={{
          width: '503px',
          height: '301px',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 24px',
          position: 'relative',
        }}
      />
    </Box>
  )
}
export default observer(ConvertCardMessage)
