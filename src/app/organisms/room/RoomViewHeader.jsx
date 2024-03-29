import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import './RoomViewHeader.scss'
import { Box } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { twemojify } from '../../../util/twemojify'
import { blurOnBubbling } from '../../atoms/button/script'
import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import navigation from '../../../client/state/navigation'
import colorMXID from '../../../util/colorMXID'
import Header from '../../atoms/header/Header'
import Avatar from '../../atoms/avatar/Avatar'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import CommonConditionDisplay from '../../components/common/CommonConditionDisplay'
import WalletHeader from '../../components/aptos/WalletHeader'
import { useMobxStore } from '../../../stores/StoreProvider'

const RoomViewHeader = ({ roomId }) => {
  const {
    aiStore: { botUserIdToRoomId, botList },
  } = useMobxStore()
  const [, forceUpdate] = useForceUpdate()
  const mx = initMatrix.matrixClient
  const isDM = initMatrix.roomList.directs.has(roomId)
  const room = mx.getRoom(roomId)
  let avatarSrc = room.getAvatarUrl(mx.baseUrl, 36, 36, 'crop')
  avatarSrc = isDM ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 36, 36, 'crop') : avatarSrc
  if (!avatarSrc) {
    const findRoomBotRoom = botUserIdToRoomId.find((item) => item.roomId === roomId)
    if (findRoomBotRoom) {
      const bot = botList.find((item) => item.user_id === findRoomBotRoom.userId)
      avatarSrc = bot.avatar_url
    }
  }
  const roomName = room.name
  const roomConditions = room?.currentState.getStateEvents('m.room.condition')[0]?.getContent().room_conditions

  const roomHeaderBtnRef = useRef(null)
  useEffect(() => {
    const settingsToggle = (isVisible) => {
      const rawIcon = roomHeaderBtnRef.current.lastElementChild
      rawIcon.style.transform = isVisible ? 'rotateX(180deg)' : 'rotateX(0deg)'
    }
    navigation.on(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle)
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle)
    }
  }, [])

  useEffect(() => {
    const { roomList } = initMatrix
    const handleProfileUpdate = (rId) => {
      if (roomId !== rId) return
      forceUpdate()
    }

    roomList.on(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate)
    return () => {
      roomList.removeListener(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate)
    }
  }, [roomId])

  return (
    <Header>
      <Box ref={roomHeaderBtnRef} className="room-header__btn" type="button" onMouseUp={(e) => blurOnBubbling(e, '.room-header__btn')}>
        <Avatar
          imageSrc={avatarSrc}
          text={roomName}
          bgColor={colorMXID(roomId)}
          size="small"
          sx={{
            width: '32px',
            height: '32px',
            borderRadius: 0,
          }}
        />
        <Box
          sx={{
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '20px',
            fontFamily: 'Generic Techno',
            color: '#141414',
            marginLeft: '8px',
          }}
        >
          {twemojify(roomName)}
        </Box>
      </Box>
      {roomConditions ? (
        <CommonConditionDisplay
          roomConditions={roomConditions}
          sx={{
            marginLeft: '8px',
            marginRight: 'auto',
          }}
        />
      ) : (
        <Box
          sx={{
            marginRight: 'auto',
          }}
        />
      )}
      <WalletHeader />
    </Header>
  )
}
RoomViewHeader.propTypes = {
  roomId: PropTypes.string.isRequired,
}

export default observer(RoomViewHeader)
