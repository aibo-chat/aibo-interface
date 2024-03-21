import React from 'react'
import './RoomTile.scss'

import { Box } from '@mui/material'
import { twemojify } from '../../../util/twemojify'

import colorMXID from '../../../util/colorMXID'

import Text from '../../atoms/text/Text'
import Avatar from '../../atoms/avatar/Avatar'
import { parseMatrixAccountId, substitutionStringForMatrixId } from '../../../util/common'
import { GroupConditionResult } from '../../../stores/app-store'
import CommonConditionDisplay from '../../components/common/CommonConditionDisplay'

interface IRoomTileProps {
  avatarSrc?: string
  name: string
  id: string
  inviterName?: string
  memberCount?: string | number
  desc?: React.ReactNode
  options?: React.ReactNode
  roomConditions?: Array<GroupConditionResult>
}
const RoomTile: React.FC<IRoomTileProps> = ({ avatarSrc, name, id, inviterName, memberCount, desc, options, roomConditions }) => (
  <div className="room-tile">
    <div className="room-tile__avatar">
      <Avatar imageSrc={avatarSrc} bgColor={colorMXID(id)} text={name} userId={id} />
    </div>
    <div className="room-tile__content">
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          variant="s1"
        >
          {twemojify(substitutionStringForMatrixId(name, 10, 10, '.'), undefined, false, true)}
        </Text>
        {roomConditions?.length ? (
          <CommonConditionDisplay
            roomConditions={roomConditions}
            sx={{
              marginLeft: '12px',
              flexShrink: 0,
            }}
          />
        ) : null}
      </Box>
      <Text variant="b3">
        {inviterName
          ? `Invited by ${parseMatrixAccountId(inviterName)} to ${parseMatrixAccountId(id)}${memberCount ? ` • ${memberCount} members` : ''}`
          : parseMatrixAccountId(id) + (memberCount ? ` • ${memberCount} members` : '')}
      </Text>
      {desc && typeof desc === 'string' ? (
        <Text className="room-tile__content__desc" variant="b2">
          {twemojify(desc, undefined, true)}
        </Text>
      ) : (
        desc
      )}
    </div>
    {options && <div className="room-tile__options">{options}</div>}
  </div>
)

export default RoomTile
