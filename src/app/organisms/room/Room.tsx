import React from 'react'
import './Room.scss'
import { Room } from 'matrix-js-sdk'
import { Line } from 'folds'
import { observer } from 'mobx-react-lite'
import RoomView from './RoomView'
import RoomSettings from './RoomSettings'
import { MembersDrawer } from './MembersDrawer'
import { ScreenSize, useScreenSize } from '../../hooks/useScreenSize'
import { useSetting } from '../../state/hooks/settings'
import { settingsAtom } from '../../state/settings'
import { PowerLevelsContextProvider, usePowerLevels } from '../../hooks/usePowerLevels'
import { roomIdToTypingMembersAtom, useBindRoomIdToTypingMembersAtom } from '../../state/typingMembers'
import TransferModal from '../../components/TransferModal'
import TransferDetailModal from '../../components/TransferDetailModal'
import { useMobxStore } from '../../../stores/StoreProvider'
import CreateCryptoBoxModal from '../../components/CryptoBox/CreateCryptoBoxModal'
import CryptoBoxModal from '../../components/CryptoBox/CryptoBoxModal'
import initMatrix from '../../../client/initMatrix'
import FeedsShareModal from '../../components/message/FeedsShareModal'
import CommonImagePreviewModal from '../../components/common/CommonImagePreviewModal'

export type RoomBaseViewProps = {
  room: Room
  eventId?: string
}
const RoomBaseView: React.FC<RoomBaseViewProps> = ({ room, eventId }) => {
  useBindRoomIdToTypingMembersAtom(room.client, roomIdToTypingMembersAtom)

  const {
    appStore: { developerMode },
    modalStore: { transferDetailModalTargetMatrixData, permissionResult, feedToShare, imagePreviewSrc },
  } = useMobxStore()
  const [isDrawer] = useSetting(settingsAtom, 'isPeopleDrawer')
  const [screenSize] = useScreenSize()
  const powerLevelAPI = usePowerLevels(room)
  const isDM = initMatrix.roomList?.directs.has(room.roomId)

  return (
    <PowerLevelsContextProvider value={powerLevelAPI}>
      <div className="room">
        <div className="room__content">
          <RoomSettings roomId={room.roomId} />
          <RoomView room={room} eventId={eventId} />
        </div>
        {(developerMode || !isDM) && screenSize === ScreenSize.Desktop && isDrawer && (
          <>
            <Line variant="Background" direction="Vertical" size="300" />
            <MembersDrawer key={room.roomId} room={room} />
          </>
        )}
        <TransferModal room={room} />
        {transferDetailModalTargetMatrixData ? <TransferDetailModal matrixData={transferDetailModalTargetMatrixData} /> : null}
        {permissionResult ? <CreateCryptoBoxModal room={room} /> : null}
        <CryptoBoxModal />
        {feedToShare ? <FeedsShareModal /> : null}
        {imagePreviewSrc ? <CommonImagePreviewModal /> : null}
      </div>
    </PowerLevelsContextProvider>
  )
}

export default observer(RoomBaseView)
