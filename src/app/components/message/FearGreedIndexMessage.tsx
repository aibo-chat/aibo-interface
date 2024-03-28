import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { Box, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { gsap } from 'gsap'
import { useIsomorphicLayoutEffect } from 'ahooks'
import { getMessageContent } from '../../hooks/useMessageContent'
import { BotAnswerMessageContent } from '../../../types/defed/message'
import HintIcon from '../../../../public/res/svg/common/common_outlined_hint_icon.svg?react'
import BackgroundSVG from '../../../../public/res/svg/fear_greed_index/background.svg?react'
import PointerSVG from '../../../../public/res/svg/fear_greed_index/pointer.svg?react'
import FearGreedIndexLogo from '../../../../public/res/svg/fear_greed_index/fear_greed_index_logo.svg?react'

interface IFearGreedIndexMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
interface SingleIndexData {
  from_site: string
  lastWeek: {
    timestamp: string
    value: string
    value_classification: string
  }
  last_updated: number
  last_updated_utc: string
  name: string
  now: {
    time_until_update: string
    timestamp: string
    value: string
    value_classification: string
  }
  yesterday: {
    timestamp: string
    value: string
    value_classification: string
  }
}
const FearGreedIndexMessage: React.FC<IFearGreedIndexMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const { t } = useTranslation()
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const indexContent = useMemo<Array<SingleIndexData>>(() => {
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
  const pointerRef = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (indexContent?.[0]?.now?.value === undefined) return
      const deg = Math.floor((Number(indexContent[0].now.value) / 100) * 180)
      gsap.to(pointerRef.current, {
        rotate: deg,
        duration: 1.3,
        ease: 'back.out',
      })
    }, pointerRef)
    return () => ctx.revert()
  }, [indexContent?.[0]?.now?.value])
  return indexContent?.[0] ? (
    <Box
      sx={{
        width: { xs: '100%', lg: '398px' },
        padding: '7px 12px 12px',
        borderRadius: '0px 8px 8px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '19px',
        }}
      >
        <FearGreedIndexLogo
          style={{
            width: '255px',
            height: '21px',
          }}
        />
      </Box>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '15px' }}>
        <BackgroundSVG />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
          }}
        >
          <Box
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#0D1421',
            }}
          >
            {indexContent[0]?.now?.value}
          </Box>
          <Box
            sx={{
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
              color: '#78828C',
            }}
          >
            {indexContent[0]?.now?.value_classification}
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
          ref={pointerRef}
        >
          <PointerSVG />
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '14px',
          color: '#78828C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {dayjs(Number(indexContent[0]?.now?.timestamp) * 1000).format('YYYY-MM-DD HH:mm')}
      </Box>
    </Box>
  ) : null
}
export default observer(FearGreedIndexMessage)
