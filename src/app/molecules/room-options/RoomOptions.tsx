import React from 'react'

import { observer } from 'mobx-react-lite'
import { MatrixClient } from 'matrix-js-sdk'
import { ReactNodeLike } from 'prop-types'
import { twemojify } from '../../../util/twemojify'

import initMatrix from '../../../client/initMatrix'
import { openInviteUser } from '../../../client/action/navigation'
import * as roomActions from '../../../client/action/room'
import { markAsRead } from '../../../client/action/notifications'

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu'
import RoomNotification from '../room-notification/RoomNotification'

import TickMarkIC from '../../../../public/res/ic/outlined/tick-mark.svg'
import AddUserIC from '../../../../public/res/ic/outlined/add-user.svg'
import LeaveArrowIC from '../../../../public/res/ic/outlined/leave-arrow.svg'

import { confirmDialog } from '../confirm-dialog/ConfirmDialog'
import { useMobxStore } from '../../../stores/StoreProvider'

interface IRoomOptionsProps {
  roomId: string
  afterOptionSelect: Function
  type: 'left' | 'right'
}
const RoomOptions: React.FC<IRoomOptionsProps> = ({ roomId, afterOptionSelect, type }) => {
  const {
    appStore: { developerMode },
  } = useMobxStore()
  const mx = initMatrix.matrixClient as MatrixClient
  const { roomList} = initMatrix;
  const room = mx.getRoom(roomId)
  const canInvite = room?.canInvite(mx.getUserId() || '')

  const handleMarkAsRead = () => {
    markAsRead(roomId)
    afterOptionSelect()
  }

  const handleInviteClick = () => {
    openInviteUser(roomId)
    afterOptionSelect()
  }
  const handleLeaveClick = async () => {
    afterOptionSelect()
    const isConfirmed = await confirmDialog('Leave room', `Are you sure that you want to leave "${room?.name}" room?`, 'Leave', 'danger')
    if (!isConfirmed) return
    roomActions.leave(roomId)
  }

  return (
    <div style={{ maxWidth: '256px' }}>
      {/*<MenuHeader>{twemojify(`${initMatrix.matrixClient?.getRoom(roomId)?.name}`, undefined) as NonNullable<ReactNodeLike>}</MenuHeader>*/}
      {!developerMode && type === 'right' ? null : (
        <MenuItem iconSrc={TickMarkIC} onClick={handleMarkAsRead}>
          Mark as read
        </MenuItem>
      )}
      { (!developerMode && type === 'left') ? null : (
        <MenuItem iconSrc={AddUserIC} onClick={handleInviteClick} disabled={!canInvite || roomList.getRoomType(room)=='direct'}>
          Invite
        </MenuItem>
      )}
      {!developerMode && type === 'left' ? null : (
        <MenuItem iconSrc={LeaveArrowIC} variant="danger" onClick={handleLeaveClick}>
          Leave
        </MenuItem>
      )}
      {type === 'right' ? null : (
        <>
          <MenuHeader>Notification</MenuHeader>
          <RoomNotification roomId={roomId} type={type} />
        </>
      )}
    </div>
  )
}

export default observer(RoomOptions)
