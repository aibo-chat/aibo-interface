import React, { KeyboardEventHandler, RefObject, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { isKeyHotkey } from 'is-hotkey'
import { EventType, IContent, MsgType, Room } from 'matrix-js-sdk'
import { ReactEditor } from 'slate-react'
import { Transforms, Editor } from 'slate'
import { Box, Dialog, Icon, IconButton, Icons, Line, Overlay, OverlayBackdrop, OverlayCenter, Scroll, Text, config, toRem } from 'folds'

import { observer } from 'mobx-react-lite'
import { ButtonBase } from '@mui/material'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import {
  CustomEditor,
  Toolbar,
  toMatrixCustomHTML,
  toPlainText,
  AUTOCOMPLETE_PREFIXES,
  AutocompletePrefix,
  AutocompleteQuery,
  getAutocompleteQuery,
  getPrevWorldRange,
  resetEditor,
  RoomMentionAutocomplete,
  UserMentionAutocomplete,
  EmoticonAutocomplete,
  createEmoticonElement,
  moveCursor,
  resetEditorHistory,
  customHtmlEqualsPlainText,
  trimCustomHtml,
  isEmptyEditor,
  getBeginCommand,
  trimCommand,
} from '../../components/editor'
import initMatrix from '../../../client/initMatrix'
import { TUploadContent, encryptFile, getImageInfo } from '../../utils/matrix'
import { useTypingStatusUpdater } from '../../hooks/useTypingStatusUpdater'
import { useFilePicker } from '../../hooks/useFilePicker'
import { useFilePasteHandler } from '../../hooks/useFilePasteHandler'
import { useFileDropZone } from '../../hooks/useFileDrop'
import { TUploadItem, roomIdToMsgDraftAtomFamily, roomIdToReplyDraftAtomFamily, roomIdToUploadItemsAtomFamily, roomUploadAtomFamily } from '../../state/roomInputDrafts'
import { UploadCardRenderer } from '../../components/upload-card'
import { UploadBoard, UploadBoardContent, UploadBoardHeader, UploadBoardImperativeHandlers } from '../../components/upload-board'
import { Upload, UploadStatus, UploadSuccess, createUploadFamilyObserverAtom } from '../../state/upload'
import { getImageUrlBlob, loadImageElement } from '../../utils/dom'
import { safeFile } from '../../utils/mimeTypes'
import { fulfilledPromiseSettledResult } from '../../utils/common'
import { useSetting } from '../../state/hooks/settings'
import { settingsAtom } from '../../state/settings'
import { getAudioMsgContent, getFileMsgContent, getImageMsgContent, getVideoMsgContent } from './msgContent'
import { MessageReply } from '../../molecules/message/Message'
import colorMXID from '../../../util/colorMXID'
import { parseReplyBody, parseReplyFormattedBody, trimReplyFromBody, trimReplyFromFormattedBody } from '../../utils/room'
import { sanitizeText } from '../../utils/sanitize'
import { useScreenSize } from '../../hooks/useScreenSize'
import { CommandAutocomplete } from './CommandAutocomplete'
import { Command, SHRUG, useCommands } from '../../hooks/useCommands'
import { mobileOrTablet } from '../../utils/user-agent'
import SendIcon from '../../../../public/res/svg/common/common_fullfilled_send_icon.svg?react'
import { useMobxStore } from '../../../stores/StoreProvider'
import RawIcon from '../../atoms/system-icons/RawIcon'
import ReplyArrowIC from '../../../../public/res/ic/outlined/reply-arrow.svg'
import { twemojify } from '../../../util/twemojify'

interface RoomInputProps {
  editor: Editor
  roomViewRef: RefObject<HTMLElement>
  roomId: string
  room: Room
}
const RoomInput = forwardRef<HTMLDivElement, RoomInputProps>(({ editor, roomViewRef, roomId, room }, ref) => {
  const mx = useMatrixClient()
  const {
    roomStore,
    aiStore: { botUserIdToRoomId, botList },
  } = useMobxStore()
  const [enterForNewline] = useSetting(settingsAtom, 'enterForNewline')
  const [isMarkdown] = useSetting(settingsAtom, 'isMarkdown')
  const commands = useCommands(mx, room)

  const [msgDraft, setMsgDraft] = useAtom(roomIdToMsgDraftAtomFamily(roomId))
  const [replyDraft, setReplyDraft] = useAtom(roomIdToReplyDraftAtomFamily(roomId))
  const { setAskFeedsNewsDraft } = roomStore
  const askFeedsNewsDraft = roomStore.askFeedsNewsDrafts.get(roomId)
  const [uploadBoard, setUploadBoard] = useState(true)
  const [selectedFiles, setSelectedFiles] = useAtom(roomIdToUploadItemsAtomFamily(roomId))
  const uploadFamilyObserverAtom = createUploadFamilyObserverAtom(
    roomUploadAtomFamily,
    selectedFiles.map((f) => f.file),
  )
  const uploadBoardHandlers = useRef<UploadBoardImperativeHandlers>()

  const imagePackRooms: Room[] = useMemo(() => {
    const allParentSpaces = [roomId, ...(initMatrix.roomList?.getAllParentSpaces(roomId) ?? [])]
    return allParentSpaces.reduce<Room[]>((list, rId) => {
      const r = mx.getRoom(rId)
      if (r) list.push(r)
      return list
    }, [])
  }, [mx, roomId])

  const [toolbar, setToolbar] = useSetting(settingsAtom, 'editorToolbar')
  const [autocompleteQuery, setAutocompleteQuery] = useState<AutocompleteQuery<AutocompletePrefix>>()

  const sendTypingStatus = useTypingStatusUpdater(mx, roomId)

  const handleFiles = useCallback(
    async (files: File[]) => {
      setUploadBoard(true)
      const safeFiles = files.map(safeFile)
      const fileItems: TUploadItem[] = []

      if (mx.isRoomEncrypted(roomId)) {
        const encryptFiles = fulfilledPromiseSettledResult(await Promise.allSettled(safeFiles.map((f) => encryptFile(f))))
        encryptFiles.forEach((ef) => fileItems.push(ef))
      } else {
        safeFiles.forEach((f) => fileItems.push({ file: f, originalFile: f, encInfo: undefined }))
      }
      setSelectedFiles({
        type: 'PUT',
        item: fileItems,
      })
    },
    [setSelectedFiles, roomId, mx],
  )
  const pickFile = useFilePicker(handleFiles, true)
  const handlePaste = useFilePasteHandler(handleFiles)
  const dropZoneVisible = useFileDropZone(roomViewRef, handleFiles)

  const [, screenWidth] = useScreenSize()
  const hideStickerBtn = true || screenWidth < 500 // 隐藏掉

  useEffect(() => {
    Transforms.insertFragment(editor, msgDraft)
  }, [editor, msgDraft])

  useEffect(() => {
    if (!mobileOrTablet()) ReactEditor.focus(editor)
    return () => {
      if (!isEmptyEditor(editor)) {
        const parsedDraft = JSON.parse(JSON.stringify(editor.children))
        setMsgDraft(parsedDraft)
      } else {
        setMsgDraft([])
      }
      resetEditor(editor)
      resetEditorHistory(editor)
    }
  }, [roomId, editor, setMsgDraft])

  const handleRemoveUpload = useCallback(
    (upload: TUploadContent | TUploadContent[]) => {
      const uploads = Array.isArray(upload) ? upload : [upload]
      setSelectedFiles({
        type: 'DELETE',
        item: selectedFiles.filter((f) => uploads.find((u) => u === f.file)),
      })
      uploads.forEach((u) => roomUploadAtomFamily.remove(u))
    },
    [setSelectedFiles, selectedFiles],
  )

  const handleCancelUpload = (uploads: Upload[]) => {
    uploads.forEach((upload) => {
      if (upload.status === UploadStatus.Loading) {
        mx.cancelUpload(upload.promise)
      }
    })
    handleRemoveUpload(uploads.map((upload) => upload.file))
  }

  const handleSendUpload = async (uploads: UploadSuccess[]) => {
    const contentsPromises = uploads.map(async (upload) => {
      const fileItem = selectedFiles.find((f) => f.file === upload.file)
      if (!fileItem) throw new Error('Broken upload')

      if (fileItem.file.type.startsWith('image')) {
        return getImageMsgContent(mx, fileItem, upload.mxc)
      }
      if (fileItem.file.type.startsWith('video')) {
        return getVideoMsgContent(mx, fileItem, upload.mxc)
      }
      if (fileItem.file.type.startsWith('audio')) {
        return getAudioMsgContent(fileItem, upload.mxc)
      }
      return getFileMsgContent(fileItem, upload.mxc)
    })
    handleCancelUpload(uploads)
    const contents = fulfilledPromiseSettledResult(await Promise.allSettled(contentsPromises))
    contents.forEach((content) => mx.sendMessage(roomId, content))
  }

  const submit = useCallback(() => {
    uploadBoardHandlers.current?.handleSend()

    const commandName = getBeginCommand(editor)

    let plainText = toPlainText(editor.children).trim()
    let customHtml = trimCustomHtml(
      toMatrixCustomHTML(editor.children, {
        allowTextFormatting: true,
        allowBlockMarkdown: isMarkdown,
        allowInlineMarkdown: isMarkdown,
      }),
    )
    let msgType = MsgType.Text

    if (commandName) {
      plainText = trimCommand(commandName, plainText)
      customHtml = trimCommand(commandName, customHtml)
    }
    if (commandName === Command.Me) {
      msgType = MsgType.Emote
    } else if (commandName === Command.Notice) {
      msgType = MsgType.Notice
    } else if (commandName === Command.Shrug) {
      plainText = `${SHRUG} ${plainText}`
      customHtml = `${SHRUG} ${customHtml}`
    } else if (commandName) {
      const commandContent = commands[commandName as Command]
      if (commandContent) {
        commandContent.exe(plainText)
      }
      resetEditor(editor)
      resetEditorHistory(editor)
      sendTypingStatus(false)
      return
    }

    if (plainText === '') return

    let body = plainText
    let formattedBody = customHtml
    if (replyDraft) {
      body = parseReplyBody(replyDraft.userId, trimReplyFromBody(replyDraft.body)) + body
      formattedBody =
        parseReplyFormattedBody(roomId, replyDraft.userId, replyDraft.eventId, replyDraft.formattedBody ? trimReplyFromFormattedBody(replyDraft.formattedBody) : sanitizeText(replyDraft.body)) +
        formattedBody
    }

    const content: IContent = {
      msgtype: msgType,
      body,
    }
    if (replyDraft || !customHtmlEqualsPlainText(formattedBody, body)) {
      content.format = 'org.matrix.custom.html'
      content.formatted_body = formattedBody
    }
    if (replyDraft) {
      content['m.relates_to'] = {
        'm.in_reply_to': {
          event_id: replyDraft.eventId,
        },
      }
    }
    if (askFeedsNewsDraft) {
      const { chatId, newsData, round } = askFeedsNewsDraft
      if (chatId && newsData?._id) {
        content.ask_id = newsData._id
        content.ask_type = newsData.article_type
        content.round = round
        content.chat_id = chatId
        content['m.relates_to'] = {
          'm.in_reply_to': {
            event_id: askFeedsNewsDraft.eventId,
          },
        }
      }
    }
    mx.sendMessage(roomId, content)
    resetEditor(editor)
    resetEditorHistory(editor)
    setReplyDraft()
    setAskFeedsNewsDraft(roomId, undefined)
    sendTypingStatus(false)
  }, [editor, isMarkdown, replyDraft, askFeedsNewsDraft, mx, roomId, setReplyDraft, setAskFeedsNewsDraft, sendTypingStatus, commands, botUserIdToRoomId, botList])

  const handleKeyDown: KeyboardEventHandler = useCallback(
    (evt) => {
      if (isKeyHotkey('mod+enter', evt) || (!enterForNewline && isKeyHotkey('enter', evt))) {
        evt.preventDefault()
        submit()
      }
      if (isKeyHotkey('escape', evt)) {
        evt.preventDefault()
        setReplyDraft()
      }
    },
    [submit, setReplyDraft, enterForNewline],
  )

  const handleKeyUp: KeyboardEventHandler = useCallback(
    (evt) => {
      if (isKeyHotkey('escape', evt)) {
        evt.preventDefault()
        return
      }

      sendTypingStatus(!isEmptyEditor(editor))

      const prevWordRange = getPrevWorldRange(editor)
      const query = prevWordRange ? getAutocompleteQuery<AutocompletePrefix>(editor, prevWordRange, AUTOCOMPLETE_PREFIXES) : undefined
      setAutocompleteQuery(query)
    },
    [editor, sendTypingStatus],
  )

  const handleCloseAutocomplete = useCallback(() => {
    setAutocompleteQuery(undefined)
    ReactEditor.focus(editor)
  }, [editor])

  const handleEmoticonSelect = (key: string, shortcode: string) => {
    editor.insertNode(createEmoticonElement(key, shortcode))
    moveCursor(editor)
  }

  const handleStickerSelect = async (mxc: string, shortcode: string, label: string) => {
    const stickerUrl = mx.mxcUrlToHttp(mxc)
    if (!stickerUrl) return

    const info = await getImageInfo(await loadImageElement(stickerUrl), await getImageUrlBlob(stickerUrl))

    mx.sendEvent(roomId, EventType.Sticker, {
      body: label,
      url: mxc,
      info,
    })
  }

  return (
    <div ref={ref}>
      {selectedFiles.length > 0 && (
        <UploadBoard
          header={
            <UploadBoardHeader
              open={uploadBoard}
              onToggle={() => setUploadBoard(!uploadBoard)}
              uploadFamilyObserverAtom={uploadFamilyObserverAtom}
              onSend={handleSendUpload}
              imperativeHandlerRef={uploadBoardHandlers}
              onCancel={handleCancelUpload}
            />
          }
        >
          {uploadBoard && (
            <Scroll size="300" hideTrack visibility="Hover">
              <UploadBoardContent>
                {Array.from(selectedFiles)
                  .reverse()
                  .map((fileItem, index) => (
                    <UploadCardRenderer
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      file={fileItem.file}
                      isEncrypted={!!fileItem.encInfo}
                      uploadAtom={roomUploadAtomFamily(fileItem.file)}
                      onRemove={handleRemoveUpload}
                    />
                  ))}
              </UploadBoardContent>
            </Scroll>
          )}
        </UploadBoard>
      )}
      <Overlay open={dropZoneVisible} backdrop={<OverlayBackdrop />} style={{ pointerEvents: 'none' }}>
        <OverlayCenter>
          <Dialog variant="Primary">
            <Box direction="Column" justifyContent="Center" alignItems="Center" gap="500" style={{ padding: toRem(60) }}>
              <Icon size="600" src={Icons.File} />
              <Text size="H4" align="Center">
                {`Drop Files in "${room?.name || 'Room'}"`}
              </Text>
              <Text align="Center">Drag and drop files here or click for selection dialog</Text>
            </Box>
          </Dialog>
        </OverlayCenter>
      </Overlay>
      {autocompleteQuery?.prefix === AutocompletePrefix.RoomMention && <RoomMentionAutocomplete roomId={roomId} editor={editor} query={autocompleteQuery} requestClose={handleCloseAutocomplete} />}
      {autocompleteQuery?.prefix === AutocompletePrefix.UserMention && <UserMentionAutocomplete room={room} editor={editor} query={autocompleteQuery} requestClose={handleCloseAutocomplete} />}
      {autocompleteQuery?.prefix === AutocompletePrefix.Emoticon && (
        <EmoticonAutocomplete imagePackRooms={imagePackRooms} editor={editor} query={autocompleteQuery} requestClose={handleCloseAutocomplete} />
      )}
      {autocompleteQuery?.prefix === AutocompletePrefix.Command && <CommandAutocomplete room={room} editor={editor} query={autocompleteQuery} requestClose={handleCloseAutocomplete} />}
      <CustomEditor
        editableName="RoomInput"
        editor={editor}
        placeholder="Ask me anything..."
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        top={
          <>
            {replyDraft ? (
              <div>
                <Box alignItems="Center" gap="300" style={{ padding: `${config.space.S200} ${config.space.S300} 0` }}>
                  <IconButton onClick={() => setReplyDraft()} variant="SurfaceVariant" size="300" radii="300">
                    <Icon src={Icons.Cross} size="50" />
                  </IconButton>
                  <MessageReply color={colorMXID(replyDraft.userId)} name={room?.getMember(replyDraft.userId)?.name ?? replyDraft.userId} body={replyDraft.body} />
                </Box>
              </div>
            ) : null}
            {askFeedsNewsDraft ? (
              <div>
                <Box alignItems="Center" gap="300" style={{ padding: `${config.space.S200} ${config.space.S300} 0` }}>
                  <IconButton onClick={() => setAskFeedsNewsDraft(roomId, undefined)} variant="SurfaceVariant" size="300" radii="300">
                    <Icon src={Icons.Cross} size="50" />
                  </IconButton>
                  <div className="message__reply">
                    <Text variant="b2">
                      <RawIcon color={colorMXID(askFeedsNewsDraft.userId)} size="extra-small" src={ReplyArrowIC} />
                      <span style={{ color: colorMXID(askFeedsNewsDraft.userId) }}>{twemojify(room?.getMember(askFeedsNewsDraft.userId)?.name ?? askFeedsNewsDraft.userId)}</span>
                      <span
                        style={{
                          margin: '0 4px',
                        }}
                      >
                        [
                      </span>
                      {twemojify(askFeedsNewsDraft.newsData.title)}
                      <span
                        style={{
                          marginLeft: '4px',
                        }}
                      >
                        ]
                      </span>
                    </Text>
                  </div>
                </Box>
              </div>
            ) : null}
          </>
        }
        before={null}
        after={
          <ButtonBase onClick={submit}>
            <SendIcon
              style={{
                width: '24px',
                height: '24px',
                fill: '#25B1FF',
              }}
            />
          </ButtonBase>
        }
        bottom={
          toolbar && (
            <div>
              <Line variant="SurfaceVariant" size="300" />
              <Toolbar />
            </div>
          )
        }
      />
    </div>
  )
})

export default observer(RoomInput)
