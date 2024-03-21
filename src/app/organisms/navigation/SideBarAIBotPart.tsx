import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, circularProgressClasses, SxProps, Theme } from '@mui/material'
import { useMobxStore } from '../../../stores/StoreProvider'
import SidebarAvatar from '../../molecules/sidebar-avatar/SidebarAvatar'
import { selectRoom } from '../../../client/action/navigation'
import Avatar from '../../atoms/avatar/Avatar'
import { hasDevices, hasDMWith } from '../../../util/matrixUtil'
import * as roomActions from '../../../client/action/room'
import { IGetBotListSingleBotType } from '../../../api/matrix-api'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import snackbarUtils from '../../../util/SnackbarUtils'
import { useSelectedRoom } from '../../hooks/useSelectedRoom'
import cons from '../../../client/state/cons'
import initMatrix from '../../../client/initMatrix'
import Notifications from '../../../client/state/Notifications'
import NotificationBadge from '../../atoms/badge/NotificationBadge'
import { abbreviateNumber } from '../../../util/common'
import Postie from '../../../util/Postie'
import { useForceUpdate } from '../../hooks/useForceUpdate'

interface ISingleBotDisplayPartProps {
  drawerPostie: Postie
  botInfo: IGetBotListSingleBotType
  sx?: SxProps<Theme>
}
const SingleBotDisplayPart: React.FC<ISingleBotDisplayPartProps> = ({ botInfo, sx, drawerPostie }) => {
  const mx = useMatrixClient()
  const noti = initMatrix.notifications as Notifications
  const {
    aiStore: { addBotUserIdToRoomId },
    modalStore: { changeIframeAppDisplay },
  } = useMobxStore()
  const [addLoading, setAddLoading] = useState<boolean>(false)
  const [selectedRoom] = useSelectedRoom()
  const dmRoomId = (() => {
    if (!mx || !botInfo.user_id) return undefined
    const findRoomId = hasDMWith(botInfo.user_id)
    if (findRoomId) {
      addBotUserIdToRoomId(botInfo.user_id, findRoomId)
    }
    return findRoomId
  })()
  const isMuted = noti.getNotiType(dmRoomId) === cons.notifs.MUTE
  const isUnread = !isMuted && noti.hasNoti(dmRoomId)
  const isAlert = noti.getHighlightNoti(dmRoomId) !== 0
  const notificationCount = abbreviateNumber(noti.getTotalNoti(dmRoomId))
  const [, forceUpdate] = useForceUpdate()
  const isActive = useMemo(() => selectedRoom && selectedRoom === dmRoomId, [dmRoomId, selectedRoom])

  useEffect(() => {
    const unSub1 = dmRoomId ? drawerPostie.subscribe('selector-change', dmRoomId, forceUpdate) : () => {}
    const unSub2 = dmRoomId ? drawerPostie.subscribe('unread-change', dmRoomId, forceUpdate) : () => {}
    return () => {
      unSub1()
      unSub2()
    }
  }, [dmRoomId])
  const onAvatarClick = async () => {
    if (!mx || !botInfo.user_id) return
    const dmRoomId = hasDMWith(botInfo.user_id)
    changeIframeAppDisplay(false)
    if (dmRoomId) {
      selectRoom(dmRoomId)
      return
    }
    setAddLoading(true)
    try {
      const result = await roomActions.createDM(botInfo.user_id, await hasDevices(botInfo.user_id))
      selectRoom(result.room_id)
    } catch (e) {
      snackbarUtils.error(`Failed to create DM with ${botInfo.display_name}`)
    }
    setAddLoading(false)
  }
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...sx,
      }}
    >
      {addLoading ? (
        <CircularProgress
          sx={{
            position: 'absolute',
            zIndex: 1,
            display: 'block',
            [`& .${circularProgressClasses.circle}`]: {
              stroke: '#4128D1',
            },
          }}
          size="26px"
          thickness={10}
        />
      ) : null}
      <SidebarAvatar
        active={isActive}
        tooltip={botInfo.display_name}
        onClick={onAvatarClick}
        avatar={<Avatar text={botInfo.display_name} size="normal" imageSrc={botInfo.avatar_url || ''} />}
        notificationBadge={isUnread ? <NotificationBadge alert={isAlert} content={notificationCount !== 0 ? notificationCount : null} /> : null}
      />
    </Box>
  )
}
const SideBarAiBotPart: React.FC<{ drawerPostie: Postie }> = ({ drawerPostie }) => {
  const {
    aiStore: { botList },
  } = useMobxStore()
  return (
    <Box
      sx={{
        width: '100%',
        flexShrink: 0,
      }}
    >
      {botList.map((botInfo, index) => (
        <SingleBotDisplayPart
          key={botInfo.id}
          drawerPostie={drawerPostie}
          botInfo={botInfo}
          sx={{
            marginBottom: index === botList.length - 1 ? '0px' : '8px',
          }}
        />
      ))}
    </Box>
  )
}
export default observer(SideBarAiBotPart)
