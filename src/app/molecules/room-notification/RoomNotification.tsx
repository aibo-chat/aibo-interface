import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './RoomNotification.scss'

import { PushRuleKind } from 'matrix-js-sdk/src/@types/PushRules'
import { ConditionKind, PushRuleActionName, TweakName } from 'matrix-js-sdk'
import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'

import Text from '../../atoms/text/Text'
import RadioButton from '../../atoms/button/RadioButton'
import { MenuItem } from '../../atoms/context-menu/ContextMenu'

import BellIC from '../../../../public/res/ic/outlined/bell.svg'
import BellRingIC from '../../../../public/res/ic/outlined/bell-ring.svg'
import BellPingIC from '../../../../public/res/ic/outlined/bell-ping.svg'
import BellOffIC from '../../../../public/res/ic/outlined/bell-off.svg'
import { useMobxStore } from '../../../stores/StoreProvider'

const items = [
  {
    iconSrc: BellIC,
    text: 'Global',
    type: cons.notifs.DEFAULT,
  },
  {
    iconSrc: BellRingIC,
    text: 'All messages',
    type: cons.notifs.ALL_MESSAGES,
  },
  {
    iconSrc: BellPingIC,
    text: 'Mentions & Keywords',
    type: cons.notifs.MENTIONS_AND_KEYWORDS,
  },
  {
    iconSrc: BellOffIC,
    text: 'Mute',
    type: cons.notifs.MUTE,
  },
]

function setRoomNotifType(roomId: string, newType: string) {
  const mx = initMatrix.matrixClient
  if (!mx) return
  const { notifications } = initMatrix
  let roomPushRule
  try {
    roomPushRule = mx.getRoomPushRule('global', roomId)
  } catch {
    roomPushRule = undefined
  }
  const promises = []

  if (newType === cons.notifs.MUTE) {
    if (roomPushRule) {
      promises.push(mx.deletePushRule('global', PushRuleKind.RoomSpecific, roomPushRule.rule_id))
    }
    promises.push(
      mx.addPushRule('global', PushRuleKind.Override, roomId, {
        conditions: [
          {
            kind: ConditionKind.EventMatch,
            key: 'room_id',
            pattern: roomId,
          },
        ],
        actions: [PushRuleActionName.DontNotify],
      }),
    )
    return promises
  }

  const oldState = notifications?.getNotiType(roomId)
  if (oldState === cons.notifs.MUTE) {
    promises.push(mx.deletePushRule('global', PushRuleKind.Override, roomId))
  }

  if (newType === cons.notifs.DEFAULT) {
    if (roomPushRule) {
      promises.push(mx.deletePushRule('global', PushRuleKind.RoomSpecific, roomPushRule.rule_id))
    }
    return Promise.all(promises)
  }

  if (newType === cons.notifs.MENTIONS_AND_KEYWORDS) {
    promises.push(
      mx.addPushRule('global', PushRuleKind.RoomSpecific, roomId, {
        actions: [PushRuleActionName.DontNotify],
      }),
    )
    promises.push(mx.setPushRuleEnabled('global', PushRuleKind.RoomSpecific, roomId, true))
    return Promise.all(promises)
  }

  // cons.notifs.ALL_MESSAGES
  promises.push(
    mx.addPushRule('global', PushRuleKind.RoomSpecific, roomId, {
      actions: [
        PushRuleActionName.Notify,
        {
          set_tweak: TweakName.Sound,
          value: 'default',
        },
      ],
    }),
  )

  promises.push(mx.setPushRuleEnabled('global', PushRuleKind.RoomSpecific, roomId, true))

  return Promise.all(promises)
}

function useNotifications(roomId: string) {
  const { notifications } = initMatrix
  const [activeType, setActiveType] = useState(notifications?.getNotiType(roomId))
  useEffect(() => setActiveType(notifications?.getNotiType(roomId)), [roomId])

  const setNotification = useCallback(
    (item: { type: string }) => {
      if (item.type === activeType) return
      setActiveType(item.type)
      setRoomNotifType(roomId, item.type)
    },
    [activeType, roomId],
  )
  return [activeType, setNotification]
}

interface IRoomNotificationProps {
  roomId: string
  type?: 'left' | 'right'
}
const RoomNotification: React.FC<IRoomNotificationProps> = ({ roomId, type }) => {
  const {
    appStore: { developerMode },
  } = useMobxStore()
  const [activeType, setNotification] = useNotifications(roomId)

  const finalNotificationItems = useMemo(() => {
    if (developerMode || !type) {
      return items
    }
    return [
      {
        iconSrc: BellOffIC,
        text: 'Mute',
        type: cons.notifs.MUTE,
      },
    ]
  }, [developerMode])
  return (
    <div className="room-notification">
      {items.map((item) => (
        <MenuItem variant={activeType === item.type ? 'positive' : 'surface'} key={item.type} iconSrc={item.iconSrc} onClick={() => (setNotification as (item: { type: string }) => void)(item)}>
          {/* @ts-ignore */}
          <Text varient="b1">
            <span>{item.text}</span>
            <RadioButton isActive={activeType === item.type} />
          </Text>
        </MenuItem>
      ))}
    </div>
  )
}

export default RoomNotification
