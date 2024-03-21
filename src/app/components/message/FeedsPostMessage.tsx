import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { Box, ButtonBase } from '@mui/material'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import TriangleIcon from '../../../../public/res/svg/feeds_news/common_fullfilled_triangle_icon.svg?react'
import { formatTime } from '../../utils/common'
import { BotAnswerMessageContent, TContentData } from '../../../types/defed/message'
import { getMessageContent } from '../../hooks/useMessageContent'
import { useMobxStore } from '../../../stores/StoreProvider'

export interface SinglePostData {
  bullish: boolean
  comment_count: number
  content: string
  content_len: number
  currencies: Array<{ id: number; slug: string; symbol: string }>
  feed_type: string
  from_site: string
  image_url: string
  images: Array<{
    type: number
    url: string
  }>
  impression_count: number
  is_announcement: boolean
  is_load: boolean
  language_code: string
  last_score: string
  last_type: string
  like_count: number
  original_content: string
  owner: {
    announceType: number
    authType: number
    avatar: { url: string; status: number }
    avatarId: string
    banner: {
      url: string
      status: number
      originalBannerUrl: string
    }
    biography: string
    canPostLongPoll: boolean
    createdTime: string
    frames: []
    guid: string
    handle: string
    lastUpdateAvatarId: number
    nickname: string
    originalBiography: string
    status: number
    type: number
    vip: boolean
    websiteAuditStatus: number
    websiteLink: string
  }
  repost_content: Array<string>
  repost_count: number
  source_id: string
  source_url: string
  summary: string
  tags: Array<string>
  timestamp: number
  title: string
  token_type: string
  topics: Array<string>
  trending_score: string
  url: string
  _id: string
}
interface IFeedsPostMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
export interface ISinglePostHandle {
  id: string
  setShowAll: Dispatch<SetStateAction<boolean>>
}

interface ISinglePostProps {
  post: SinglePostData
}

function getPostElement(data: TContentData) {
  let divContent = ''
  data.forEach((element) => {
    let pContent = ''
    element.forEach((ele) => {
      switch (ele.type) {
        case 'hashtag': {
          pContent += `#${ele.content.tag}`
          break
        }
        case 'link': {
          const { display, url } = ele.content
          if (display) {
            pContent += `<a href=${url} target="_blank"> @${display} </a>`
          } else {
            pContent += `<a href=${url} target="_blank" style="display: block;text-wrap: nowrap;overflow: hidden;text-overflow: ellipsis;color:#4128D1"> ${url} </a>`
          }
          break
        }
        case 'text': {
          pContent += ele.content
          break
        }
        case 'mention': {
          pContent += `@${ele.content.handle}`
          break
        }
        case 'token': {
          pContent += `$${ele.content.symbol}`
          break
        }
        default: {
          pContent += ''
          break
        }
      }
    })
    divContent += pContent ? `<p style="margin:0;line-height: 150%;">${pContent}</p>` : ''
  })
  return divContent
}
const FeedsSinglePost = observer(
  React.forwardRef<ISinglePostHandle, ISinglePostProps>(({ post }, ref) => {
    const {
      modalStore: { changeImagePreviewSrc },
    } = useMobxStore()
    const contentRef = useRef<HTMLDivElement>(null)
    const [showALl, setShowAll] = useState(false)

    useEffect(() => {
      const boxHeight = contentRef.current?.clientHeight
      if (boxHeight && boxHeight > 84) {
        // 展示 read all
        contentRef.current.style.maxHeight = '84px'
        setShowAll(true)
      }
    }, [])

    const clickReadAll = () => {
      contentRef.current!.style.maxHeight = ''
      setShowAll(false)
    }
    useImperativeHandle(ref, () => ({
      id: post._id,
      setShowAll,
    }))
    return (
      <Box
        sx={{
          display: 'flex',
          borderTop: '1px solid #EBF0F5',
          padding: '16px',
          flexDirection: 'column',
        }}
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
            src={post.owner.avatar.url}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
            }}
          />
          <Box sx={{ fontSize: '14px', ml: 2, fontWeight: 600, color: '#0D1421' }}>{post.owner.nickname}</Box>

          <Box
            sx={{
              fontSize: '12px',
              color: '#78828C',
              ml: 'auto',
            }}
          >
            {formatTime(Number(post.timestamp))}
          </Box>
        </Box>

        <Box sx={{ my: 3, position: 'relative' }}>
          {showALl && (
            <Box
              component="span"
              sx={{
                pl: 4,
                position: 'absolute',
                cursor: 'pointer',
                right: 0,
                bottom: 0,
                fontSize: '14px',
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.01) 0%, #ffffff, 1em, #ffffff)',
              }}
              onClick={clickReadAll}
            >
              <Box component="span">...</Box>
              <Box component="span" sx={{ color: '#4128D1', ml: 1 }}>
                Read all
              </Box>
            </Box>
          )}

          <Box
            ref={contentRef}
            sx={{
              color: '#323C46',
              fontSize: '14px',
              wordBreak: 'break-word',
              overflow: 'hidden',
              a: {
                textDecoration: 'none',
              },
            }}
            dangerouslySetInnerHTML={{ __html: getPostElement(JSON.parse(post.original_content)) }}
          />
        </Box>
        {post?.image_url ? (
          <Box
            component="img"
            loading="lazy"
            decoding="async"
            src={post.image_url}
            sx={{
              borderRadius: '8px',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => {
              changeImagePreviewSrc(post.image_url)
            }}
          />
        ) : null}
      </Box>
    )
  }),
)
const FeedsPostMessage: React.FC<IFeedsPostMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const messageBody = getMessageContent<BotAnswerMessageContent>(timelineSet, mEventId, mEvent)
  const postContent = useMemo<Array<SinglePostData>>(() => {
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
  const postsRef = useRef<Array<ISinglePostHandle>>([])
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)

  const addPostRef = (ref: ISinglePostHandle) => {
    if (!ref) return
    if (!postsRef.current.find((item) => item.id === ref.id)) {
      postsRef.current.push(ref)
    }
  }

  const goNext = () => {
    if (!swiperRef.current) return
    postsRef.current[swiperIndex]?.setShowAll(false)
    swiperRef.current.slideNext()
  }

  const goPrev = () => {
    if (!swiperRef.current) return
    postsRef.current[swiperIndex]?.setShowAll(false)
    swiperRef.current.slidePrev()
  }

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return
    postsRef.current[swiperIndex]?.setShowAll(false)
    swiperRef.current.slideTo(index)
  }

  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
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
          {postContent.map((item, index) => (
            <SwiperSlide
              key={item.source_id}
              style={{
                height: index === swiperIndex ? 'auto' : '0px',
              }}
            >
              <FeedsSinglePost post={item} ref={addPostRef} />
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
            padding: '0 0 14px',
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
          {postContent.map((_item, index) => (
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
    </Box>
  )
}
export default observer(FeedsPostMessage)
