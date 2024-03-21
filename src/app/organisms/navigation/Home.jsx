import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

import { observer } from 'mobx-react-lite'
import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import navigation from '../../../client/state/navigation'
import { roomIdByActivity, roomIdByAtoZ } from '../../../util/sort'

import RoomsCategory from './RoomsCategory'

import { useCategorizedSpaces } from '../../hooks/useCategorizedSpaces'
import { useMobxStore } from '../../../stores/StoreProvider'

const Home = ({ spaceId, drawerPostie }) => {
  const mx = initMatrix.matrixClient
  const { roomList, notifications, accountData } = initMatrix
  const { spaces, rooms, directs } = roomList
  const {
    renderStore: { _ROOM_LIST_UPDATED },
    aiStore: { botUserIdToRoomId, botConfigInitiating },
    userRelationshipStore: { checkUserProxyWithDirectRoomIds },
  } = useMobxStore()
  useCategorizedSpaces()
  const isValidSpaceId = useMemo(() => spaceId && spaceId !== cons.tabs.HOME, [spaceId])
  const isCategorized = accountData.categorizedSpaces.has(spaceId)

  let categories = null
  let spaceIds = []
  let roomIds = []
  let directIds = []

  if (isValidSpaceId) {
    const spaceChildIds = roomList.getSpaceChildren(spaceId) ?? []
    spaceIds = spaceChildIds.filter((roomId) => spaces.has(roomId))
    roomIds = spaceChildIds.filter((roomId) => rooms.has(roomId))
    directIds = spaceChildIds.filter((roomId) => directs.has(roomId))
  } else {
    spaceIds = roomList.getOrphanSpaces().filter((id) => !accountData.spaceShortcut.has(id))
    roomIds = roomList.getOrphanRooms()
    directIds = roomList.getOrphansDirects()
  }

  // filter for ai bot
  if (Array.isArray(directIds)) {
    directIds = directIds.filter((id) => !botUserIdToRoomId.some((item) => item.roomId === id))
    roomIds = roomIds.filter((id) => !botUserIdToRoomId.some((item) => item.roomId === id))
  }
  checkUserProxyWithDirectRoomIds(directIds)

  if (isCategorized) {
    categories = roomList.getCategorizedSpaces(spaceIds)
    categories.delete(spaceId)
  }

  useEffect(() => {
    const selectorChanged = (selectedRoomId, prevSelectedRoomId) => {
      if (!drawerPostie.hasTopic('selector-change')) return
      const addresses = []
      if (drawerPostie.hasSubscriber('selector-change', selectedRoomId)) addresses.push(selectedRoomId)
      if (drawerPostie.hasSubscriber('selector-change', prevSelectedRoomId)) addresses.push(prevSelectedRoomId)
      if (addresses.length === 0) return
      drawerPostie.post('selector-change', addresses, selectedRoomId)
    }

    const notiChanged = (roomId, total, prevTotal) => {
      if (total === prevTotal) return
      if (drawerPostie.hasTopicAndSubscriber('unread-change', roomId)) {
        drawerPostie.post('unread-change', roomId)
      }
    }

    navigation.on(cons.events.navigation.ROOM_SELECTED, selectorChanged)
    notifications.on(cons.events.notifications.NOTI_CHANGED, notiChanged)
    notifications.on(cons.events.notifications.MUTE_TOGGLED, notiChanged)
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, selectorChanged)
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, notiChanged)
      notifications.removeListener(cons.events.notifications.MUTE_TOGGLED, notiChanged)
    }
  }, [])

  return (
    <>
      {Array.isArray(directIds) && !botConfigInitiating && !isValidSpaceId ? <RoomsCategory name="Peoples" roomIds={directIds.sort(roomIdByActivity)} drawerPostie={drawerPostie} /> : null}

      {Array.isArray(roomIds) && <RoomsCategory name="Rooms" roomIds={roomIds.sort(roomIdByAtoZ)} drawerPostie={drawerPostie} />}

      {!isCategorized && Array.isArray(spaceIds) && <RoomsCategory name="Spaces" roomIds={spaceIds.sort(roomIdByAtoZ)} drawerPostie={drawerPostie} />}

      {isCategorized &&
        categories &&
        [...categories.keys()].sort(roomIdByAtoZ).map((catId) => {
          const rms = []
          const dms = []
          categories.get(catId).forEach((id) => {
            if (directs.has(id)) dms.push(id)
            else rms.push(id)
          })
          rms.sort(roomIdByAtoZ)
          dms.sort(roomIdByActivity)
          return <RoomsCategory key={catId} spaceId={catId} name={mx.getRoom(catId).name} roomIds={rms.concat(dms)} drawerPostie={drawerPostie} />
        })}
    </>
  )
}
Home.defaultProps = {
  spaceId: null,
}
Home.propTypes = {
  spaceId: PropTypes.string,
}

export default observer(Home)
