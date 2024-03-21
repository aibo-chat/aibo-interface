import { Box, Icon, Icons, Text, as, color, toRem } from 'folds'
import { EventTimelineSet, IContent, MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk'
import { CryptoBackend } from 'matrix-js-sdk/lib/common-crypto/CryptoBackend'
import React, { useEffect, useState } from 'react'
import to from 'await-to-js'
import classNames from 'classnames'
import colorMXID from '../../../util/colorMXID'
import { getMemberDisplayName, trimReplyFromBody } from '../../utils/room'
import { getMxIdLocalPart } from '../../utils/matrix'
import { LinePlaceholder } from './placeholder'
import { randomNumberBetween } from '../../utils/common'
import * as css from './Reply.css'
import { MessageBadEncryptedContent, MessageDeletedContent, MessageFailedContent } from './MessageContentFallback'
import { BotAnswerMessageContent, DefedMsgType } from '../../../types/defed/message'
import { SingleNewsData } from './FeedsNewsMessage'
import { generateDailyDigestTitle, SingleDigestContent } from './DailyDigestMessage'
import { ArticleType } from './FeedsSingleNews'

type ReplyProps = {
  mx: MatrixClient
  room: Room
  timelineSet: EventTimelineSet
  eventId: string
  currentEvent: MatrixEvent
}

export const Reply = as<'div', ReplyProps>(({ className, mx, room, timelineSet, eventId, currentEvent, ...props }, ref) => {
  const [replyEvent, setReplyEvent] = useState<MatrixEvent | null | undefined>(timelineSet.findEventById(eventId))

  const content: IContent = replyEvent?.getContent() ?? {}
  const sender = replyEvent?.getSender()

  const fallbackBody = replyEvent?.isRedacted() ? <MessageDeletedContent /> : <MessageFailedContent />

  useEffect(() => {
    let disposed = false
    const loadEvent = async () => {
      const [err, evt] = await to(mx.fetchRoomEvent(room.roomId, eventId))
      const mEvent = new MatrixEvent(evt)
      if (disposed) return
      if (err) {
        setReplyEvent(null)
        return
      }
      if (mEvent.isEncrypted() && mx.getCrypto()) {
        await to(mEvent.attemptDecryption(mx.getCrypto() as CryptoBackend))
      }
      setReplyEvent(mEvent)
    }
    if (replyEvent === undefined) loadEvent()
    return () => {
      disposed = true
    }
  }, [replyEvent, mx, room, eventId])

  const getMessageBody = () => {
    const badEncryption = content.msgtype === 'm.bad.encrypted'
    let bodyJSX = null
    if (content.body) {
      switch (content.msgtype) {
        case DefedMsgType.Digest:
        case DefedMsgType.News:
          const newsMessageBody = content.body as BotAnswerMessageContent
          const currentMessageContent: {
            ask_id: string
            ask_type: ArticleType
            body: string
            chat_id: string
            msgtype: string
            round: number
          } = currentEvent.getContent()
          if (newsMessageBody?.answer && currentMessageContent?.ask_id) {
            try {
              const newsOriginalData = JSON.parse(newsMessageBody.answer) as Array<SingleNewsData | SingleDigestContent>
              if (newsOriginalData?.length) {
                if (newsOriginalData.length === 1) {
                  bodyJSX =
                    (newsOriginalData[0] as SingleNewsData)?.title ||
                    generateDailyDigestTitle((newsOriginalData[0] as SingleDigestContent).token_name, (newsOriginalData[0] as SingleDigestContent).summary_date)
                } else {
                  const targetNews = (newsOriginalData as Array<SingleNewsData>).find((news) => news._id === currentMessageContent.ask_id)
                  if (targetNews) {
                    bodyJSX = targetNews.title
                  }
                }
              }
            } catch (e) {
              console.error('getMessageBody Error:', content.body)
            }
          }
          break
        default:
          bodyJSX = trimReplyFromBody(content.body)
          break
      }
    } else {
      bodyJSX = fallbackBody
    }
    return (
      <Text className={css.ReplyContentText} size="T300" truncate>
        {badEncryption ? <MessageBadEncryptedContent /> : bodyJSX}
      </Text>
    )
  }

  return (
    <Box className={classNames(css.Reply, className)} alignItems="Center" gap="100" {...props} ref={ref}>
      <Box style={{ color: colorMXID(sender ?? eventId), maxWidth: '50%' }} alignItems="Center" shrink="No">
        <Icon src={Icons.ReplyArrow} size="50" />
        {sender && (
          <Text size="T300" truncate>
            {getMemberDisplayName(room, sender) ?? getMxIdLocalPart(sender)}
          </Text>
        )}
      </Box>
      <Box grow="Yes" className={css.ReplyContent}>
        {replyEvent !== undefined ? (
          getMessageBody()
        ) : (
          <LinePlaceholder
            style={{
              backgroundColor: color.SurfaceVariant.ContainerActive,
              maxWidth: toRem(randomNumberBetween(40, 400)),
              width: '100%',
            }}
          />
        )}
      </Box>
    </Box>
  )
})
