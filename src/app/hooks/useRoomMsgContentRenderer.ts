import { ReactNode } from 'react'
import { MatrixEvent, MsgType } from 'matrix-js-sdk'
import { DefedMsgType } from '../../types/defed/message'

export type MsgContentRenderer<T extends unknown[]> = (eventId: string, mEvent: MatrixEvent, ...args: T) => ReactNode

export type RoomMsgContentRendererOpts<T extends unknown[]> = {
  renderText?: MsgContentRenderer<T>
  renderEmote?: MsgContentRenderer<T>
  renderNotice?: MsgContentRenderer<T>
  renderImage?: MsgContentRenderer<T>
  renderVideo?: MsgContentRenderer<T>
  renderAudio?: MsgContentRenderer<T>
  renderFile?: MsgContentRenderer<T>
  renderLocation?: MsgContentRenderer<T>
  renderBadEncrypted?: MsgContentRenderer<T>
  renderUnsupported?: MsgContentRenderer<T>
  renderBrokenFallback?: MsgContentRenderer<T>
  renderTransferMessage?: MsgContentRenderer<T>
  renderCryptoBoxMessage?: MsgContentRenderer<T>
  renderQuestionTemplate?: MsgContentRenderer<T>
  renderFeedsNewsMessage?: MsgContentRenderer<T>
  renderTokenDataMessage?: MsgContentRenderer<T>
  renderFeedsPostMessage?: MsgContentRenderer<T>
  renderFearGreedIndexMessage?: MsgContentRenderer<T>
  renderDailyDigestMessage?: MsgContentRenderer<T>
  renderETFMessage?: MsgContentRenderer<T>
  renderCommonTransferMessage?: MsgContentRenderer<T>
  renderConvertCardMessage?: MsgContentRenderer<T>
}

export type RenderRoomMsgContent<T extends unknown[]> = (eventId: string, mEvent: MatrixEvent, ...args: T) => ReactNode

export const useRoomMsgContentRenderer =
  <T extends unknown[]>({
    renderText,
    renderEmote,
    renderNotice,
    renderImage,
    renderVideo,
    renderAudio,
    renderFile,
    renderLocation,
    renderBadEncrypted,
    renderUnsupported,
    renderBrokenFallback,
    renderTransferMessage,
    renderCryptoBoxMessage,
    renderQuestionTemplate,
    renderFeedsNewsMessage,
    renderTokenDataMessage,
    renderFeedsPostMessage,
    renderFearGreedIndexMessage,
    renderDailyDigestMessage,
    renderETFMessage,
    renderCommonTransferMessage,
    renderConvertCardMessage,
  }: RoomMsgContentRendererOpts<T>): RenderRoomMsgContent<T> =>
  (eventId, mEvent, ...args) => {
    const msgType = mEvent.getContent().msgtype

    let node: ReactNode = null

    if (msgType === MsgType.Text && renderText) node = renderText(eventId, mEvent, ...args)
    else if (msgType === MsgType.Emote && renderEmote) node = renderEmote(eventId, mEvent, ...args)
    else if (msgType === MsgType.Notice && renderNotice) node = renderNotice(eventId, mEvent, ...args)
    else if (msgType === MsgType.Image && renderImage) node = renderImage(eventId, mEvent, ...args)
    else if (msgType === MsgType.Video && renderVideo) node = renderVideo(eventId, mEvent, ...args)
    else if (msgType === MsgType.Audio && renderAudio) node = renderAudio(eventId, mEvent, ...args)
    else if (msgType === MsgType.File && renderFile) node = renderFile(eventId, mEvent, ...args)
    else if (msgType === MsgType.Location && renderLocation) node = renderLocation(eventId, mEvent, ...args)
    else if (msgType === 'm.bad.encrypted' && renderBadEncrypted) node = renderBadEncrypted(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.Transfer && renderTransferMessage) node = renderTransferMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.CryptoBox && renderCryptoBoxMessage) node = renderCryptoBoxMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.QuestionTemplate && renderQuestionTemplate) node = renderQuestionTemplate(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.News && renderFeedsNewsMessage) node = renderFeedsNewsMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.TokenData && renderTokenDataMessage) node = renderTokenDataMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.Posts && renderFeedsPostMessage) node = renderFeedsPostMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.FearGreedIndex && renderFearGreedIndexMessage) node = renderFearGreedIndexMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.Digest && renderDailyDigestMessage) node = renderDailyDigestMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.ETF && renderETFMessage) node = renderETFMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.CommonTransfer && renderCommonTransferMessage) node = renderCommonTransferMessage(eventId, mEvent, ...args)
    else if (msgType === DefedMsgType.ConvertCard && renderConvertCardMessage) node = renderConvertCardMessage(eventId, mEvent, ...args)
    else if (renderUnsupported) {
      node = renderUnsupported(eventId, mEvent, ...args)
    }

    if (!node && renderBrokenFallback) node = renderBrokenFallback(eventId, mEvent, ...args)

    return node
  }
