import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useImperativeHandle, useState } from 'react'
import { Box, ButtonBase, Collapse } from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import FeedsNewsTranslationPart from './FeedsNewsTranslationPart'
import FeedsNewsImageMap from '../../../images/feedsNewsImageMap'

dayjs.extend(relativeTime, {
  rounding: Math.floor,
})

export enum ArticleType {
  Article = 'article',
  Digest = 'digest',
}
export interface FeedsSingleNewsNecessaryData {
  image_url?: string
  source_url?: string
  tags: Array<string>
  _id: string
  timestamp: number
  title: string
  summary: string
  article_type: ArticleType
}
interface ISingleNewsProps {
  news: FeedsSingleNewsNecessaryData
  articleType?: ArticleType
  renderImagePart?: (originData: any) => React.ReactNode
  originData?: any
}
export interface ISingleNewsHandle {
  id: string
  setTranslationLanguage: Dispatch<SetStateAction<string>>
  goDetail: () => void
  setCollapseIn: Dispatch<SetStateAction<boolean>>
}
const FeedsSingleNews = React.forwardRef<ISingleNewsHandle, ISingleNewsProps>(({ news, articleType, renderImagePart, originData }, ref) => {
  const { _id: articleId, tags } = news
  const [translationLanguage, setTranslationLanguage] = useState<string>('')
  const [collapseIn, setCollapseIn] = useState<boolean>(false)
  const goDetail = () => {
    if (news.source_url) {
      window.open(news.source_url)
    }
  }
  useImperativeHandle(ref, () => ({
    id: articleId,
    setTranslationLanguage,
    goDetail,
    setCollapseIn,
  }))
  return (
    <Box
      sx={{
        width: '100%',
        padding: '8px 12px 0',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '24px',
          color: '#23282D',
          marginBottom: { xs: '8px', lg: '4px' },
          flexShrink: 0,
        }}
      >
        {news.title}
      </Box>

      <Box
        sx={{
          display: 'flex',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '16px',
          marginBottom: { xs: '12px', lg: '14px' },
          color: '#23282D',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {tags.map((item, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: '4px',
              bgcolor: '#F4F6F9',
              p: '4px 8px',
              mr: 2,
              mt: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {item}
          </Box>
        ))}
      </Box>
      {news.image_url ? (
        <Box
          component="img"
          src={news.image_url}
          sx={{
            width: '100%',
            height: { xs: '152px', lg: '206px' },
            flexShrink: 0,
            borderRadius: { xs: '4px', lg: '6px' },
            marginBottom: { xs: '12px', lg: '0px' },
          }}
        />
      ) : renderImagePart ? (
        renderImagePart(originData)
      ) : null}
      <Collapse
        sx={{
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: '#23282D',
          maskImage: collapseIn ? 'unset' : 'linear-gradient(180deg,#FFF 0%,#FFF 75%, transparent 100%)',
          maskSize: '100%',
          maskPosition: 'top left',
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, mask-image 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          marginBottom: '8px',
          position: 'relative',
        }}
        in={collapseIn}
        collapsedSize={80}
      >
        {news.summary}
        {translationLanguage ? <FeedsNewsTranslationPart translationLanguage={translationLanguage} articleId={articleId} isMobile articleType={articleType} /> : null}
      </Collapse>
      <Box
        sx={{
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '14px',
          color: '#78828C',
          position: 'relative',
        }}
      >
        <ButtonBase
          sx={{
            position: 'absolute',
            bottom: '18px',
            zIndex: 1,
            left: '50%',
            transform: `translateX(-50%) rotate(${collapseIn ? 180 : 0}deg)`,
          }}
          onClick={() => {
            setCollapseIn((prevState) => !prevState)
          }}
        >
          <Box
            component="img"
            src={FeedsNewsImageMap.feedsShareModalMoreSummaryIcon}
            sx={{
              width: '16px',
              height: '16px',
            }}
          />
        </ButtonBase>
        {dayjs(news.timestamp).fromNow()}
      </Box>
    </Box>
  )
})

export default observer(FeedsSingleNews)
