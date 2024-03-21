import React, { MouseEventHandler, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { MatrixClient, Room } from 'matrix-js-sdk'
import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import navigation from '../../../client/state/navigation'
import { openReusableContextMenu } from '../../../client/action/navigation'
import { abbreviateNumber, getEventCords } from '../../../util/common'
import { joinRuleToIconSrc } from '../../../util/matrixUtil'

import IconButton from '../../atoms/button/IconButton'
import RoomSelector from '../../molecules/room-selector/RoomSelector'
import RoomOptions from '../../molecules/room-options/RoomOptions'
import SpaceOptions from '../../molecules/space-options/SpaceOptions'

import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg'

import { useForceUpdate } from '../../hooks/useForceUpdate'
import Notifications from '../../../client/state/Notifications'
import Postie from '../../../util/Postie'

interface ISelectorProps {
  roomId: string
  isDM?: boolean
  drawerPostie: Postie
  onClick: MouseEventHandler<HTMLButtonElement>
}
const RenderAvatarSize = 36
const Selector: React.FC<ISelectorProps> = ({ roomId, isDM = true, drawerPostie, onClick }) => {
  const mx = initMatrix.matrixClient as MatrixClient
  const noti = initMatrix.notifications as Notifications
  const room = mx.getRoom(roomId) as Room
  // const latestEvent = useRoomLatestRenderedEvent(room, ['m.room.message'])
  // const latestEventContent = latestEvent?.getContent()
  // TODO 目前消息解析存在大问题，暂时先去掉

  let imageSrc = room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, RenderAvatarSize, RenderAvatarSize, 'crop', undefined, false) || null
  if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, RenderAvatarSize, RenderAvatarSize, 'crop') || null
  const roomConditions = room?.currentState.getStateEvents('m.room.condition')[0]?.getContent().room_conditions

  const isMuted = noti.getNotiType(roomId) === cons.notifs.MUTE

  const [, forceUpdate] = useForceUpdate()

  useEffect(() => {
    const unSub1 = drawerPostie.subscribe('selector-change', roomId, forceUpdate)
    const unSub2 = drawerPostie.subscribe('unread-change', roomId, forceUpdate)
    return () => {
      unSub1()
      unSub2()
    }
  }, [])

  const openOptions = (e: any) => {
    e.preventDefault()
    openReusableContextMenu(
      'right',
      getEventCords(e, '.room-selector'),
      room.isSpaceRoom()
        ? (closeMenu: any) => <SpaceOptions roomId={roomId} afterOptionSelect={closeMenu} />
        : (closeMenu: any) => <RoomOptions roomId={roomId} afterOptionSelect={closeMenu} type="left" />,
    )
  }

  return (
    <RoomSelector
      key={roomId}
      name={room.name}
      roomId={roomId}
      imageSrc={isDM ? imageSrc : undefined}
      iconSrc={isDM ? null : joinRuleToIconSrc(room.getJoinRule(), room.isSpaceRoom())}
      isSelected={navigation.selectedRoomId === roomId}
      isMuted={isMuted}
      isUnread={!isMuted && noti.hasNoti(roomId)}
      notificationCount={abbreviateNumber(noti.getTotalNoti(roomId))}
      isAlert={noti.getHighlightNoti(roomId) !== 0}
      onClick={onClick}
      onContextMenu={openOptions}
      options={<IconButton size="extra-small" tooltip="Options" tooltipPlacement="right" src={VerticalMenuIC} onClick={openOptions} />}
      roomConditions={roomConditions}
      // subTextPart={latestEventContent?.body}
    />
  )
}

export default observer(Selector)
