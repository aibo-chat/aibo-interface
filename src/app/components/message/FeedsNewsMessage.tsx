import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, ButtonBase, buttonClasses, Popover } from '@mui/material'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useSetAtom } from 'jotai'
import GPTIcon from '../../../../public/res/svg/feeds_news/common_outlined_gpt_icon.svg?react'
import AskIcon from '../../../../public/res/svg/feeds_news/common_outlined_ask_icon.svg?react'
import DetailIcon from '../../../../public/res/svg/feeds_news/common_outlined_detail_icon.svg?react'
import TriangleIcon from '../../../../public/res/svg/feeds_news/common_fullfilled_triangle_icon.svg?react'
import FeedsSingleNews, { ArticleType, ISingleNewsHandle } from './FeedsSingleNews'
import { useMobxStore } from '../../../stores/StoreProvider'
import { IAskFeedsNewsDraft } from '../../../stores/room-store'
import { roomIdToReplyDraftAtomFamily } from '../../state/roomInputDrafts'
import { getMessageContent } from '../../hooks/useMessageContent'
import { BotAnswerMessageContent } from '../../../types/defed/message'

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
    roomStore: { setAskFeedsNewsDraft, updateFeedNewsOperationDataByArticleIds, updateFeedNewsOperationDataByArticleId },
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
  const initOperateData = async () => {
    if (newsContent.length) {
      const articleIds = newsContent.map((item) => item._id)
      await updateFeedNewsOperationDataByArticleIds(articleIds)
    }
  }
  useLayoutEffect(() => {
    initOperateData()
  }, [newsContent?.length])
  const onPopoverClick = () => {
    setTranslateMenuAnchorElement(null)
  }
  const updateFeeds = (data: OperationData) => {
    updateFeedNewsOperationDataByArticleId(data.articleId, data)
  }
  return (
    <Box
      sx={{
        width: '398px',
        borderRadius: '20px',
        border: '1px solid #F2F2F2',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#FFF',
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
              <FeedsSingleNews news={item} ref={addNewsRef} updateFeeds={updateFeeds} />
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
          height: '64px',
          backgroundColor: '#FBFBFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderTop: '1px solid #F2F2F2',
          [`& .${buttonClasses.root}`]: {
            backgroundColor: '#F2F2F2',
            color: '#838383',
            borderRadius: '8px',
            height: '40px',
            width: '116px',
            '& > svg': {
              stroke: '#838383',
            },
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
          <GPTIcon
            style={{
              width: '20px',
              height: '20px',
              fill: '#10A37F',
              marginRight: '8px',
              stroke: 'none',
            }}
          />
          {t('Translate')}
        </Button>
        <Button onClick={onDetailButtonClick}>
          <DetailIcon
            style={{
              width: '20px',
              height: '20px',
              marginRight: '8px',
            }}
          />
          {t('Detail')}
        </Button>
        <Button onClick={onAskQuestion}>
          <AskIcon
            style={{
              width: '20px',
              height: '20px',
              marginRight: '8px',
            }}
          />
          {t('Ask')}
        </Button>
      </Box>
    </Box>
  )
}
export default observer(FeedsNewsMessage)
