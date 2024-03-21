import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useImperativeHandle, useState } from 'react'
import { AxiosResponse } from 'axios'
import { Box, ButtonBase, buttonBaseClasses, Collapse, Skeleton } from '@mui/material'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMobxStore } from '../../../stores/StoreProvider'
import { request } from '../../../api/request'
import DefedApi, { IResponseType } from '../../../api/defed-api'
import snackbarUtils from '../../../util/SnackbarUtils'
import FeedsNewsTranslationPart from './FeedsNewsTranslationPart'
import FeedsNewsImageMap from '../../../images/feedsNewsImageMap'
import CommonLottieAnimationContainer from '../common/CommonLottieAnimationContainer'
import LongJson from '../../../../public/res/json/long.json'
import ShortJson from '../../../../public/res/json/short.json'
import LongIcon from '../../../../public/res/svg/feeds_news/feeds_modal_long_icon.svg?react'
import LongActiveIcon from '../../../../public/res/svg/feeds_news/feeds_modal_long_active_icon.svg?react'
import ShortIcon from '../../../../public/res/svg/feeds_news/feeds_modal_short_icon.svg?react'
import ShortActiveIcon from '../../../../public/res/svg/feeds_news/feeds_modal_short_active_icon.svg?react'
import ShareIcon from '../../../../public/res/svg/feeds_news/common_outlined_share_icon.svg?react'

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
  updateFeeds: (params: { articleId: string; likeFlag: 0 | 1; longFlag: 0 | 1; shortFlag: 0 | 1 }) => void
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
const FeedsSingleNews = React.forwardRef<ISingleNewsHandle, ISingleNewsProps>(({ news, updateFeeds, articleType, renderImagePart, originData }, ref) => {
  const { _id: articleId, tags } = news
  const { t } = useTranslation()
  const {
    appStore: { userAccount },
    modalStore: { changeFeedToShare },
    roomStore: { feedNewsOperationData },
  } = useMobxStore()
  const [translationLanguage, setTranslationLanguage] = useState<string>('')
  const [collapseIn, setCollapseIn] = useState<boolean>(false)
  const currentOperationData = feedNewsOperationData.get(articleId)
  const [buttonLoading, setButtonLoading] = useState(false)
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
  const operateArticle: (params: { likeFlag: 1 | 0; longFlag: 1 | 0; articleId: string; shortFlag: 0 | 1 }) => Promise<boolean> = async (params) => {
    setButtonLoading(true)
    let finalResult: boolean
    try {
      const finalParams: { likeFlag: 1 | 0; longFlag: 1 | 0; articleId: string; shortFlag: 0 | 1; proxy?: string } = { ...params }
      if (userAccount?.proxyAddress) {
        finalParams.proxy = userAccount.proxyAddress
      }
      const result: AxiosResponse<IResponseType<boolean>> = await request.post(DefedApi.postOperateArticle, finalParams)
      if (result?.data?.msg) {
        snackbarUtils.error(result.data.msg)
        finalResult = false
      } else {
        finalResult = result.data.data
      }
    } catch (e) {
      console.error(e)
      finalResult = false
    }
    if (finalResult) {
      const newItems = {
        articleId,
        likeFlag: params.likeFlag,
        longFlag: params.longFlag,
        shortFlag: params.shortFlag,
      }
      updateFeeds(newItems)
    }
    setButtonLoading(false)
    return finalResult
  }
  const onLongButtonClick = async () => {
    if (!currentOperationData) {
      return
    }
    const { longFlag, shortFlag, likeFlag } = currentOperationData
    if (!longFlag) {
      await operateArticle({
        articleId,
        longFlag: 1,
        shortFlag: 0,
        likeFlag,
      })
    } else {
      await operateArticle({
        articleId,
        longFlag: 0,
        shortFlag,
        likeFlag,
      })
    }
  }
  const onShortButtonClick = async () => {
    if (!currentOperationData) {
      return
    }
    const { longFlag, shortFlag, likeFlag } = currentOperationData
    if (!shortFlag) {
      await operateArticle({
        articleId,
        longFlag: 0,
        shortFlag: 1,
        likeFlag,
      })
    } else {
      await operateArticle({
        articleId,
        longFlag,
        shortFlag: 0,
        likeFlag,
      })
    }
  }
  const onShareButtonClick = () => {
    changeFeedToShare(news)
  }
  return (
    <Box
      sx={{
        width: '100%',
        padding: '12px 12px 0',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '24px',
          color: '#191919',
          marginBottom: '4px',
          flexShrink: 0,
        }}
      >
        {news.title}
      </Box>

      <Box
        sx={{
          display: 'flex',
          fontSize: '12px',
          marginBottom: '14px',
          color: '#4685FF',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {tags.map((item, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: '90px',
              bgcolor: '#EBF0F5',
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
            height: '206px',
            flexShrink: 0,
            borderRadius: '6px',
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
          color: '#78828C',
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
          fontWeight: 400,
          lineHeight: '16px',
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
      {currentOperationData ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '16px',
            color: '#838383',
            flexShrink: 0,
            '& > div': {
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 0 14px',
            },
            [`& .${buttonBaseClasses.root}`]: {
              fontFamily: 'var(--font-secondary)',
              '& > div:first-of-type': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#F4F6F9',
                marginRight: '8px',
                position: 'relative',
              },
            },
          }}
        >
          <Box>
            <ButtonBase onClick={onLongButtonClick} disabled={buttonLoading}>
              <Box>
                <CommonLottieAnimationContainer animationJson={LongJson} flag={currentOperationData.longFlag} />
                {currentOperationData.longFlag ? (
                  <LongActiveIcon
                    style={{
                      position: 'absolute',
                      zIndex: 0,
                    }}
                  />
                ) : (
                  <LongIcon
                    style={{
                      position: 'absolute',
                      zIndex: 0,
                    }}
                  />
                )}
              </Box>
              <Box>{t('Long')}</Box>
            </ButtonBase>
          </Box>
          <Box>
            <ButtonBase onClick={onShortButtonClick} disabled={buttonLoading}>
              <Box>
                <CommonLottieAnimationContainer animationJson={ShortJson} flag={currentOperationData.shortFlag} />
                {currentOperationData.shortFlag ? (
                  <ShortActiveIcon
                    style={{
                      position: 'absolute',
                      zIndex: 0,
                    }}
                  />
                ) : (
                  <ShortIcon
                    style={{
                      position: 'absolute',
                      zIndex: 0,
                    }}
                  />
                )}
              </Box>
              <Box>{t('Short')}</Box>
            </ButtonBase>
          </Box>
          <Box>
            <ButtonBase onClick={onShareButtonClick}>
              <Box>
                <ShareIcon
                  style={{
                    width: '18px',
                    height: '18px',
                    fill: '#6F767E',
                  }}
                />
              </Box>
              <Box>{t('Share')}</Box>
            </ButtonBase>
          </Box>
        </Box>
      ) : (
        <Skeleton
          sx={{
            width: '100%',
            height: '24px',
            margin: '12px 0 14px',
          }}
          animation="wave"
        />
      )}
    </Box>
  )
})

export default observer(FeedsSingleNews)
