import { EventTimelineSet, MatrixEvent, MatrixEventEvent } from 'matrix-js-sdk'
import { useEffect, useState } from 'react'
import { getEventEdits } from '../utils/room'
import { DefedMsgType } from '../../types/defed/message'

export const getMessageContent = <T>(timelineSet: EventTimelineSet, mEventId: string, mEvent: MatrixEvent) => {
  const edits = getEventEdits(timelineSet, mEventId, mEvent.getType())
  const unsortedEditEvents = edits?.getRelations()
  const editedEvent = unsortedEditEvents?.sort((m1, m2) => m2.getTs() - m1.getTs())?.[0]
  const { body } = editedEvent?.getContent<{ 'm.new_content': { body: T } }>()['m.new_content'] ?? mEvent.getContent<{ body: T }>()
  return body
}
export function useMessageContent<T = any>(mEventId: string, mEvent: MatrixEvent, timelineSet: EventTimelineSet) {
  const [messageContent, setMessageContent] = useState(() => getMessageContent<T>(timelineSet, mEventId, mEvent))
  useEffect(() => {
    const relationsCreatedListener = () => {
      const newTransferContent = getMessageContent<T>(timelineSet, mEventId, mEvent)
      setMessageContent(newTransferContent)
    }
    const replacedListener = (event: MatrixEvent) => {
      if (event?.getContent) {
        const newMessageContent = event.getContent<{ body: T; msgtype: DefedMsgType }>()?.body
        if (newMessageContent) {
          setMessageContent(newMessageContent)
        }
      }
    }
    mEvent.on(MatrixEventEvent.Replaced, replacedListener)
    mEvent.on(MatrixEventEvent.RelationsCreated, relationsCreatedListener)
    return () => {
      mEvent.removeListener(MatrixEventEvent.Replaced, replacedListener)
      mEvent.removeListener(MatrixEventEvent.RelationsCreated, relationsCreatedListener)
    }
  }, [mEvent, mEventId, timelineSet])
  return [messageContent]
}
