import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Box, Button, ButtonBase, buttonClasses, Popover } from '@mui/material'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useSetAtom } from 'jotai'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import GPTIcon from '../../../../public/res/svg/feeds_news/common_outlined_gpt_icon.svg?react'
import AskIcon from '../../../../public/res/svg/feeds_news/common_outlined_ask_icon.svg?react'
import TriangleIcon from '../../../../public/res/svg/feeds_news/common_fullfilled_triangle_icon.svg?react'
import { BotAnswerMessageContent } from '../../../types/defed/message'
import { getMessageContent } from '../../hooks/useMessageContent'
import FeedsSingleNews, { ArticleType, FeedsSingleNewsNecessaryData, ISingleNewsHandle } from './FeedsSingleNews'
import { OperationData, TranslateMenu } from './FeedsNewsMessage'
import { IAskFeedsNewsDraft } from '../../../stores/room-store'
import { useMobxStore } from '../../../stores/StoreProvider'
import { roomIdToReplyDraftAtomFamily } from '../../state/roomInputDrafts'

dayjs.extend(advancedFormat)
interface IDailyDigestMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
export interface SingleDigestContent {
  keywords: Array<string>
  summary: string
  summary_date: string
  symbol: string
  token_name: string
  _id: {
    $oid: string
  }
}
const DefaultPostUrl = 'https://defed.mypinata.cloud/ipfs/QmX6gzsbkVJ1jaFrCCFf2uNdnpqRD1TvL4SNdBuKUkHUK2'

export const generateDailyDigestTitle = (tokenName: string, summaryDate: string) => `Daily digest of ${tokenName} on ${dayjs(summaryDate).format('MMMM Do')}`
const DailyDigestMessage: React.FC<IDailyDigestMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const { t } = useTranslation()
  const {
    roomStore: { setAskFeedsNewsDraft, updateFeedNewsOperationDataByArticleId, updateFeedNewsOperationDataByArticleIds, updateTokenInfoWithTokenName, tokenInfoWithTokenName },
  } = useMobxStore()
  const setReplyDraft = useSetAtom(roomIdToReplyDraftAtomFamily(mEvent.getRoomId() || ''))
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const digestContent = useMemo<Array<SingleDigestContent>>(() => {
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
  const newsContent = useMemo<Array<FeedsSingleNewsNecessaryData>>(
    () =>
      digestContent.map((data) => {
        const date = dayjs(data.summary_date)
        return {
          tags: Array.isArray(data.keywords) ? data.keywords : [],
          _id: data?._id?.$oid || 'test_no_id',
          timestamp: date.valueOf(),
          title: generateDailyDigestTitle(data.token_name, data.summary_date),
          summary: data.summary,
          article_type: ArticleType.Digest,
        }
      }),
    [digestContent],
  )
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const newsRef = useRef<Array<ISingleNewsHandle>>([])

  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
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
  const initOperateData = async () => {
    if (newsContent?.length) {
      const articleIds = newsContent.map((item) => item._id)
      await updateFeedNewsOperationDataByArticleIds(articleIds)
      const tokenNames = digestContent.map((item) => item.token_name)
      await updateTokenInfoWithTokenName(tokenNames)
    }
  }
  useLayoutEffect(() => {
    initOperateData()
  }, [newsContent?.length])
  const [translateMenuAnchorElement, setTranslateMenuAnchorElement] = useState<HTMLButtonElement | null>(null)
  const updateFeeds = (data: OperationData) => {
    updateFeedNewsOperationDataByArticleId(data.articleId, data)
  }
  const onPopoverClick = () => {
    setTranslateMenuAnchorElement(null)
  }
  const setTranslationLanguage = (value: React.SetStateAction<string>) => {
    newsRef.current[swiperIndex]?.setCollapseIn(true)
    newsRef.current[swiperIndex]?.setTranslationLanguage(value)
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
  const renderImagePart = (originData: SingleDigestContent) => {
    if (!originData) return null
    const currentTokenInfo = originData?.token_name ? tokenInfoWithTokenName.get(originData.token_name) : undefined
    return (
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={DefaultPostUrl}
          sx={{
            width: '100%',
            height: '206px',
            flexShrink: 0,
            borderRadius: '6px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '17px',
            left: '14px',
            color: '#FFF',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {currentTokenInfo ? (
            <Box
              sx={{
                width: '20px',
                height: '20px',
                marginRight: '4px',
                borderRadius: '10px',
              }}
              component="img"
              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${currentTokenInfo.id}.png`}
            />
          ) : (
            <Box
              sx={{
                marginRight: '4px',
              }}
            >
              {originData?.symbol?.toUpperCase()}
            </Box>
          )}
          <Box>{dayjs(originData?.summary_date).format('YYYY/MM/DD')}</Box>
        </Box>
      </Box>
    )
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
        backgroundColor: '#FBFBFB',
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
              key={item._id}
              style={{
                height: index === swiperIndex ? 'auto' : '0px',
              }}
            >
              <FeedsSingleNews news={item} ref={addNewsRef} updateFeeds={updateFeeds} articleType={ArticleType.Digest} renderImagePart={renderImagePart} originData={digestContent[index]} />
            </SwiperSlide>
          ))}
        </Swiper>
        {newsContent?.length && newsContent.length > 1 ? (
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
        ) : null}
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
            flex: 1,
            '& > svg': {
              stroke: '#838383',
            },
            [`&.${buttonClasses.disabled}`]: {
              backgroundColor: '#F8F8F8',
              color: '#E8E8E8',
              opacity: 1,
              '& > svg': {
                stroke: '#E8E8E8',
              },
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
          sx={{
            marginRight: '8px',
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
export default observer(DailyDigestMessage)
