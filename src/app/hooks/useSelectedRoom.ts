import { useState, useEffect } from 'react'

import cons from '../../client/state/cons'
import navigation from '../../client/state/navigation'

export function useSelectedRoom() {
  const [selectedTab, setSelectedTab] = useState(navigation.selectedRoomId)

  useEffect(() => {
    const onRoomSelected = (roomId: any) => {
      setSelectedTab(roomId)
    }
    navigation.on(cons.events.navigation.ROOM_SELECTED, onRoomSelected)
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, onRoomSelected)
    }
  }, [])

  return [selectedTab]
}
