import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { Box, Button, ButtonBase, buttonClasses, Popover } from '@mui/material'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useSetAtom } from 'jotai'
import TriangleIcon from '../../../../public/res/svg/feeds_news/common_fullfilled_triangle_icon.svg?react'
import FeedsNewsMessageLog from '../../../../public/res/svg/feeds_news/feeds_news_message_logo.svg?react'
import FeedsSingleNews, { ArticleType, ISingleNewsHandle } from './FeedsSingleNews'
import { useMobxStore } from '../../../stores/StoreProvider'
import { IAskFeedsNewsDraft } from '../../../stores/room-store'
import { roomIdToReplyDraftAtomFamily } from '../../state/roomInputDrafts'
import { getMessageContent } from '../../hooks/useMessageContent'
import { BotAnswerMessageContent } from '../../../types/defed/message'
import feedsNewsImageMap from '../../../images/feedsNewsImageMap'

export interface SingleNewsData {
  content: string
  content_len: number
  from_site: string
  image_url: string
  isLoad: boolean
  source_id: string
  source_url: string
  summary: string
  tags: Array<string>
  timestamp: number
  title: string
  token_type: string
  url: string
  _id: string
  article_type: ArticleType
}

interface IFeedsNewsProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
export const TranslateMenu: Array<{ title: string; value: string }> = [
  { title: 'English', value: 'en' },
  { title: 'Japanese', value: 'ja' },
  { title: 'Portuguese', value: 'pt' },
  { title: 'Thai', value: 'th' },
]
export interface OperationData {
  articleId: string
  likeFlag: 0 | 1
  longFlag: 0 | 1
  shortFlag: 0 | 1
}

const FeedsNewsMessage: React.FC<IFeedsNewsProps> = ({ timelineSet, mEvent, mEventId }) => {
  const { t } = useTranslation()
  const {
    roomStore: { setAskFeedsNewsDraft },
  } = useMobxStore()
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const newsContent = useMemo<Array<SingleNewsData>>(() => {
    if (messageBody?.answer) {
      try {
        return JSON.parse(messageBody.answer).map((item: SingleNewsData) => ({
          ...item,
          article_type: ArticleType.Article,
        }))
      } catch (e) {
        return []
      }
    } else {
      return []
    }
  }, [messageBody.answer])
  const setReplyDraft = useSetAtom(roomIdToReplyDraftAtomFamily(mEvent.getRoomId() || ''))
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const newsRef = useRef<Array<ISingleNewsHandle>>([])
  const [translateMenuAnchorElement, setTranslateMenuAnchorElement] = useState<HTMLButtonElement | null>(null)

  const addNewsRef = (ref: ISingleNewsHandle) => {
    if (!ref) return
    if (!newsRef.current.find((item) => item.id === ref.id)) {
      newsRef.current.push(ref)
    }
  }

  const goNext = () => {
    if (!swiperRef.current) return
    newsRef.current[swiperIndex]?.setCollapseIn(false)
    swiperRef.current.slideNext()
  }

  const goPrev = () => {
    if (!swiperRef.current) return
    newsRef.current[swiperIndex]?.setCollapseIn(false)
    swiperRef.current.slidePrev()
  }

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return
    newsRef.current[swiperIndex]?.setCollapseIn(false)
    swiperRef.current.slideTo(index)
  }

  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
  const onDetailButtonClick = () => {
    newsRef.current[swiperIndex]?.goDetail()
  }

  const onAskQuestion = () => {
    const roomId = mEvent.getRoomId()
    const senderId = mEvent.getSender()
    const { chatId, round } = messageBody
    if (!roomId || !senderId || !chatId) return
    const newDraft: IAskFeedsNewsDraft = {
      userId: senderId,
      eventId: mEventId,
      newsData: newsContent[swiperIndex],
      chatId,
      round,
    }
    setAskFeedsNewsDraft(roomId, newDraft)
    setReplyDraft(undefined)
  }
  const setTranslationLanguage = (value: React.SetStateAction<string>) => {
    newsRef.current[swiperIndex]?.setCollapseIn(true)
    newsRef.current[swiperIndex]?.setTranslationLanguage(value)
  }
  const onPopoverClick = () => {
    setTranslateMenuAnchorElement(null)
  }
  return (
    <Box
      sx={{
        width: { xs: '100%', lg: '398px' },
        borderRadius: '0px 8px 8px 8px',
        border: '1px solid #F2F2F2',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#FFF',
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '7px 12px 0',
        }}
      >
        <FeedsNewsMessageLog
          style={{
            width: '168px',
            height: '21px',
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Swiper
          pagination={false}
          direction="horizontal"
          slidesPerView={1}
          style={{ overflow: 'visible', transition: 'height 1s ease-in-out' }}
          simulateTouch={false}
          initialSlide={0}
          onSwiper={(swiper: SwiperClass) => {
            swiperRef.current = swiper
          }}
          onSlideChange={handleSlideChange}
        >
          {newsContent.map((item, index) => (
            <SwiperSlide
              key={item.source_id}
              style={{
                height: index === swiperIndex ? 'auto' : '0px',
              }}
            >
              <FeedsSingleNews news={item} ref={addNewsRef} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Box
          sx={{
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
            padding: '14px 0',
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
          {newsContent.map((item, index) => (
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
      </Box>
      <Box
        sx={{
          width: '100%',
          padding: '0 12px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '1px',
            backgroundColor: '#F5F5F5',
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          [`& .${buttonClasses.root}`]: {
            color: '#25B1FF',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '12px',
            borderRadius: { xs: '4px', lg: '8px' },
            height: { xs: '32px', lg: '40px' },
            width: { xs: '96px', lg: '116px' },
            border: '1px solid #25B1FF',
          },
        }}
      >
        <Popover
          onClose={onPopoverClick}
          open={Boolean(translateMenuAnchorElement)}
          anchorEl={translateMenuAnchorElement}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 0,
                boxShadow: 'none',
                backgroundColor: 'transparent',
                overflow: 'visible',
                paddingBottom: '8px',
                paddingRight: { xs: 0, xsm: '84px' },
              },
            },
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box
            sx={{
              width: '176px',
              padding: '8px 4px',
              borderRadius: '12px',
              backgroundColor: '#FFF',
              boxShadow: '0px 0px 1px 0px rgba(0, 0, 0, 0.40), 0px 8px 24px -6px rgba(0, 0, 0, 0.16)',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            {TranslateMenu.map((menu) => (
              <Box
                key={menu.title}
                sx={{
                  padding: '12px 4px',
                  borderRadius: '4px',
                  '&:hover': {
                    color: '#4685FF',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => {
                  setTranslationLanguage(menu.value)
                  setTranslateMenuAnchorElement(null)
                }}
              >
                {t(menu.title)}
              </Box>
            ))}
          </Box>
        </Popover>
        <Button
          onClick={(e) => {
            setTranslateMenuAnchorElement(e.target as HTMLButtonElement)
          }}
        >
          <Box
            component="img"
            src={feedsNewsImageMap.gptIcon}
            sx={{
              width: '12px',
              height: '12px',
              marginRight: '4px',
            }}
          />
          {t('Translate')}
        </Button>
        <Button onClick={onDetailButtonClick}>
          <Box
            component="img"
            src={feedsNewsImageMap.detailIcon}
            sx={{
              width: '12px',
              height: '12px',
              marginRight: '4px',
            }}
          />
          {t('Detail')}
        </Button>
        <Button onClick={onAskQuestion}>
          <Box
            component="img"
            src={feedsNewsImageMap.askIcon}
            sx={{
              width: '12px',
              height: '12px',
              marginRight: '4px',
            }}
          />
          {t('Ask')}
        </Button>
      </Box>
    </Box>
  )
}
export default observer(FeedsNewsMessage)
