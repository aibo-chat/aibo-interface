import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './RoomView.scss'
import { Text, config } from 'folds'
import { EventType } from 'matrix-js-sdk'

import { Box } from '@mui/material'
import cons from '../../../client/state/cons'
import navigation from '../../../client/state/navigation'

import RoomViewHeader from './RoomViewHeader'
import RoomInput from './RoomInput'
import { useStateEvent } from '../../hooks/useStateEvent'
import { StateEvent } from '../../../types/matrix/room'
import { RoomTombstone } from './RoomTombstone'
import { usePowerLevelsAPI } from '../../hooks/usePowerLevels'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { RoomInputPlaceholder } from './RoomInputPlaceholder'
import RoomTimeline from './RoomTimeline'
import { RoomViewTyping } from './RoomViewTyping'
import { RoomViewFollowing } from './RoomViewFollowing'
import { useEditor } from '../../components/editor'
import settings from '../../../client/state/settings'
import SystemImageMap from '../../../images/systemImageMap'

function RoomView({ room, eventId }) {
  const roomInputRef = useRef(null)
  const roomViewRef = useRef(null)

  // eslint-disable-next-line react/prop-types
  const { roomId } = room
  const editor = useEditor()

  const mx = useMatrixClient()
  const tombstoneEvent = useStateEvent(room, StateEvent.RoomTombstone)
  const { getPowerLevel, canSendEvent } = usePowerLevelsAPI()
  const myUserId = mx.getUserId()
  const canMessage = myUserId ? canSendEvent(EventType.RoomMessage, getPowerLevel(myUserId)) : false

  const getBackgroundImageUrl = (targetThemeIndex) => {
    // let themeIndex
    // if (targetThemeIndex !== undefined) {
    //   themeIndex = targetThemeIndex
    // } else {
    //   const autoThemeIndex = settings.darkModeQueryList.matches ? 2 : 0
    //   themeIndex = settings.useSystemTheme ? autoThemeIndex : settings.themeIndex
    // }
    // 目前只支持浅色模式
    const themeIndex = 0
    return [2, 3].includes(themeIndex) ? SystemImageMap.waterMarkDark : SystemImageMap.waterMark
  }
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(getBackgroundImageUrl())

  useEffect(() => {
    const settingsToggle = (isVisible) => {
      const roomView = roomViewRef.current
      roomView.classList.toggle('room-view--dropped')

      const roomViewContent = roomView.children[1]
      if (isVisible) {
        setTimeout(() => {
          if (!navigation.isRoomSettings) return
          roomViewContent.style.visibility = 'hidden'
        }, 200)
      } else roomViewContent.style.visibility = 'visible'
    }
    const themeIndexChange = (themeIndex) => {
      setBackgroundImageUrl(getBackgroundImageUrl(themeIndex))
    }
    settings.on(cons.events.settings.THEME_INDEX_CHANGED, themeIndexChange)
    navigation.on(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle)
    return () => {
      settings.removeListener(cons.events.settings.THEME_INDEX_CHANGED, themeIndexChange)
      navigation.removeListener(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle)
    }
  }, [])
  return (
    <div className="room-view" ref={roomViewRef}>
      <RoomViewHeader roomId={roomId} />
      <div
        className="room-view__content-wrapper"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      >
        <div className="room-view__scrollable">
          <RoomTimeline key={roomId} room={room} eventId={eventId} roomInputRef={roomInputRef} editor={editor} />
          <RoomViewTyping room={room} />
        </div>
        <div className="room-view__sticky">
          <div className="room-view__editor">
            {tombstoneEvent ? (
              <RoomTombstone roomId={roomId} body={tombstoneEvent.getContent().body} replacementRoomId={tombstoneEvent.getContent().replacement_room} />
            ) : (
              <>
                {canMessage && <RoomInput room={room} editor={editor} roomId={roomId} roomViewRef={roomViewRef} ref={roomInputRef} />}
                {!canMessage && (
                  <RoomInputPlaceholder style={{ padding: config.space.S200 }} alignItems="Center" justifyContent="Center">
                    <Text align="Center">You do not have permission to post in this room</Text>
                  </RoomInputPlaceholder>
                )}
              </>
            )}
          </div>
          <Box
            sx={{
              width: '100%',
              height: '39px',
            }}
          />
          {/* <RoomViewFollowing room={room} /> */}
        </div>
      </div>
    </div>
  )
}

RoomView.defaultProps = {
  eventId: null,
}
RoomView.propTypes = {
  room: PropTypes.shape({}).isRequired,
  eventId: PropTypes.string,
}

export default RoomView
