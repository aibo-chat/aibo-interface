import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { Box, ButtonBase } from '@mui/material'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import { Editor, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { getMessageContent } from '../../hooks/useMessageContent'
import ArrowIcon from '../../../../public/res/svg/common/common_outlined_arrow_icon.svg?react'
import QuestionTemplateImageMap from '../../../images/questionTemplateImageMap'
import { createTemplateElement } from '../editor'
import snackbarUtils from '../../../util/SnackbarUtils'
import { useIsMobile } from '../../hooks/useIsMobile'
import ArrowOnlyIcon from '../../../../public/res/svg/common/common_outlined_arrow_only_icon.svg?react'
import RefreshIcon from '../../../../public/res/svg/common/common_outlined_refresh_icon_v2.svg?react'

interface IQuestionTemplateProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
  editor: Editor
}
export interface QuestionTemplateMessageContent {
  kinds: Array<{
    id: string
    questions: Array<{ name: string; question: string; disable?: boolean }>
  }>
}
const TemplateData = [
  {
    id: 'prize_pool',
    name: 'Prize Pool',
    icon: QuestionTemplateImageMap.questionTemplatePrizePoolIcon,
  },
  {
    id: 'sbt',
    name: 'SBT',
    icon: QuestionTemplateImageMap.questionTemplateSBTIcon,
  },
  {
    id: 'deposit_transfer',
    name: 'Deposit&Transfer',
    icon: QuestionTemplateImageMap.questionTemplateDepositTransferIcon,
  },
  {
    id: 'token_feeds',
    name: 'Token Feeds',
    icon: QuestionTemplateImageMap.questionTemplateTokenFeedsIcon,
  },
  {
    id: 'token_data',
    name: 'Token Data',
    icon: QuestionTemplateImageMap.questionTemplateTokenDataIcon,
  },
  {
    id: 'concept_analysis',
    name: 'Trends Topic',
    icon: QuestionTemplateImageMap.questionTemplateConceptAnalysisIcon,
  },
]
const MaxQuestionDisplay = 3
const KindPart: React.FC<{
  kind: QuestionTemplateMessageContent['kinds'][0]
  isLastOne: boolean
  targetInfo: any
  askQuestion: Function
}> = ({ kind, isLastOne, targetInfo, askQuestion }) => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const totalLength = useMemo(() => kind?.questions?.length || 0, [kind?.questions?.length])
  const filteredArray = useMemo(() => {
    if (totalLength === 0) {
      return []
    }
    if (totalLength <= MaxQuestionDisplay) {
      return kind.questions
    }
    if (totalLength >= currentIndex + MaxQuestionDisplay) {
      return kind.questions.slice(currentIndex, currentIndex + MaxQuestionDisplay)
    }
    // 当剩余的问题不足MaxQuestionDisplay时，从头开始取
    return [...kind.questions.slice(currentIndex, totalLength), ...kind.questions.slice(0, MaxQuestionDisplay - (totalLength - currentIndex))]
  }, [currentIndex, kind.questions, totalLength])
  const changeNextCurrentIndex = () => {
    const targetIndex = currentIndex + MaxQuestionDisplay
    setCurrentIndex(targetIndex > totalLength ? targetIndex - totalLength : targetIndex)
  }
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        width: { xs: '182px', lg: '212px' },
        borderRadius: '0px 8px 8px 8px',
        backgroundColor: '#FFFFFF',
        marginRight: { xs: 0, lg: isLastOne ? 0 : '16px' },
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'column' },
        alignItems: { xs: 'center', lg: 'center' },
        padding: { xs: '8px 12px 12px', lg: '16px 27px' },
        flexShrink: 0,
        height: '188px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {totalLength > MaxQuestionDisplay ? (
        <ButtonBase
          sx={{
            marginLeft: '4px',
            position: 'absolute',
            top: '8px',
            right: '8px',
          }}
          onClick={changeNextCurrentIndex}
        >
          <RefreshIcon
            style={{
              width: '14px',
              height: '14px',
              stroke: '#BFC6CD',
            }}
          />
        </ButtonBase>
      ) : null}
      <Box
        sx={{
          width: '40px',
          height: '40px',
          marginBottom: { xs: '7px', lg: '12px' },
          marginRight: { xs: 0, lg: 0 },
          flexShrink: 0,
        }}
        component="img"
        src={targetInfo?.icon}
      />
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Box
          sx={{
            color: '#23282D',
            fontSize: '12px',
            fontWeight: 400,
            fontFamily: 'Generic Techno',
            lineHeight: 'normal',
            marginBottom: { xs: '16px', lg: '16px' },
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {t(targetInfo?.name)}
        </Box>
        <Box
          sx={{
            color: '#78828C',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: { xs: '14px', lg: 'normal' },
            width: '100%',
          }}
        >
          {filteredArray.map((question, index) => (
            <Box
              key={`${kind.id}-${question.name}`}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ButtonBase
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '& > svg': {
                    display: { xs: 'none', lg: 'block' },
                  },
                }}
                onClick={() => {
                  if (question.disable) return snackbarUtils.warning(t('Coming soon!'))
                  askQuestion(question.question)
                }}
              >
                {question.name}
                <Box>
                  <ArrowIcon
                    style={{
                      width: '12px',
                      height: '8px',
                    }}
                  />
                </Box>
              </ButtonBase>
              {index !== filteredArray.length - 1 ? (
                <Box
                  sx={{
                    margin: { xs: '12px 0', lg: '8px 0' },
                    width: '100%',
                    borderBottom: '1px dashed #E8E8EC',
                  }}
                />
              ) : null}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
const QuestionTemplate: React.FC<IQuestionTemplateProps> = ({ timelineSet, mEvent, mEventId, editor }) => {
  const messageBody = getMessageContent<QuestionTemplateMessageContent>(timelineSet, mEventId, mEvent)
  const isMobile = useIsMobile()
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const mobileStyles = useMemo(() => {
    if (isMobile) {
      if (messageBody?.kinds?.length) {
        if (swiperIndex === messageBody.kinds.length - 1) {
          return {
            maskStyle: {
              maskImage: 'none',
              maskSize: 'auto',
              maskPosition: '0%',
            },
            iconStyle: {
              opacity: 0,
            },
          }
        }
        return {
          maskStyle: {
            maskImage: 'linear-gradient(90deg,#000 90%,transparent 100%)',
            maskSize: '100%',
            maskPosition: '0px',
          },
          iconStyle: {
            opacity: 1,
          },
        }
      }
    }
    return {
      maskStyle: {},
      iconStyle: {},
    }
  }, [isMobile, messageBody?.kinds?.length, swiperIndex])
  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }
  const askQuestion = (question: string) => {
    if (!editor || !question) return
    // 使用正则表达式匹配${xxx}格式的内容
    const regex = /\$\{(.*?)\}/g
    // 使用split函数将字符串按照匹配到的内容进行分割，并将匹配到的内容也加入到结果数组中
    const result = []
    let match
    let lastIndex = 0
    do {
      match = regex.exec(question)
      if (match !== null) {
        if (match.index !== lastIndex) {
          result.push(question.slice(lastIndex, match.index))
        }
        result.push(match[0])
        lastIndex = regex.lastIndex
      }
    } while (match !== null)
    if (lastIndex !== question.length) {
      result.push(question.slice(lastIndex))
    }
    ReactEditor.focus(editor)
    const range = Editor.range(editor, [])
    Transforms.delete(editor, { at: range })
    for (const item of result) {
      if (item.startsWith('${') && item.endsWith('}')) {
        const text = item.slice(2, item.length - 1)
        const newNode = createTemplateElement(text)
        Transforms.insertNodes(editor, newNode)
      } else {
        const end = Editor.end(editor, [])
        Transforms.select(editor, end)
        Transforms.insertText(editor, item)
      }
    }
  }
  const renderKind = (kind: QuestionTemplateMessageContent['kinds'][0], index: number) => {
    const targetInfo = TemplateData.find((item) => item.id === kind.id)
    return <KindPart key={kind.id} kind={kind} isLastOne={index === messageBody.kinds.length - 1} targetInfo={targetInfo} askQuestion={askQuestion} />
  }
  const renderKindInSwiper = (kind: QuestionTemplateMessageContent['kinds'][0], index: number) => <SwiperSlide key={kind.id}>{renderKind(kind, index)}</SwiperSlide>
  return messageBody ? (
    isMobile ? (
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ArrowOnlyIcon
          style={{
            fill: '#626262',
            width: '14px',
            height: '14px',
            position: 'absolute',
            right: 0,
            zIndex: 2,
            ...mobileStyles.iconStyle,
          }}
        />
        <Box
          sx={{
            width: '100%',
            ...mobileStyles.maskStyle,
          }}
        >
          <Swiper
            pagination={false}
            direction="horizontal"
            slidesPerView={1.8}
            style={{ overflow: 'visible' }}
            simulateTouch={false}
            initialSlide={0}
            onSwiper={(swiper: SwiperClass) => {
              swiperRef.current = swiper
            }}
            onSlideChange={handleSlideChange}
          >
            {messageBody?.kinds?.map(renderKindInSwiper)}
          </Swiper>
        </Box>
      </Box>
    ) : (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {messageBody?.kinds?.map(renderKind)}
      </Box>
    )
  ) : null
}
export default observer(QuestionTemplate)
