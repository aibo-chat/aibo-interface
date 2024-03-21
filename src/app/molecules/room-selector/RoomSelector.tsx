import React, { MouseEventHandler } from 'react'
import './RoomSelector.scss'

import { Box } from '@mui/material'
import { twemojify } from '../../../util/twemojify'
import colorMXID from '../../../util/colorMXID'

import Text from '../../atoms/text/Text'
import Avatar from '../../atoms/avatar/Avatar'
import NotificationBadge from '../../atoms/badge/NotificationBadge'
import { blurOnBubbling } from '../../atoms/button/script'
import { GroupConditionResult } from '../../../stores/app-store'
import CommonConditionDisplay from '../../components/common/CommonConditionDisplay'

interface IRoomSelectorWrapperProps {
  isSelected: boolean
  isMuted?: boolean
  isUnread: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
  content: React.ReactNode
  options?: React.ReactNode
  onContextMenu?: MouseEventHandler<HTMLButtonElement>
}
const RoomSelectorWrapper: React.FC<IRoomSelectorWrapperProps> = ({ isSelected, isMuted = false, isUnread, onClick, content, options, onContextMenu }) => {
  const classes = ['room-selector']
  if (isMuted) classes.push('room-selector--muted')
  if (isUnread) classes.push('room-selector--unread')
  if (isSelected) classes.push('room-selector--selected')

  return (
    <div className={classes.join(' ')}>
      <button className="room-selector__content" type="button" onClick={onClick} onMouseUp={(e) => blurOnBubbling(e as unknown as Event, '.room-selector__content')} onContextMenu={onContextMenu}>
        {content}
      </button>
      <div className="room-selector__options">{options}</div>
    </div>
  )
}

interface IRoomSelectorProps {
  name: string
  parentName?: string
  roomId: string
  imageSrc?: string | null
  iconSrc?: string
  isSelected?: boolean
  isMuted?: boolean
  isUnread: boolean
  notificationCount: string | number
  isAlert: boolean
  options?: React.ReactNode
  onClick: MouseEventHandler<HTMLButtonElement>
  onContextMenu?: MouseEventHandler<HTMLButtonElement>
  roomConditions?: Array<GroupConditionResult>
  subTextPart?: string
}
const RoomSelector: React.FC<IRoomSelectorProps> = ({
  name,
  parentName,
  roomId,
  imageSrc,
  iconSrc,
  isSelected = false,
  isMuted = false,
  isUnread,
  notificationCount,
  isAlert,
  options,
  onClick,
  onContextMenu,
  roomConditions,
  subTextPart,
}) => (
  <RoomSelectorWrapper
    isSelected={isSelected}
    isMuted={isMuted}
    isUnread={isUnread}
    content={
      <>
        <Avatar text={name} bgColor={colorMXID(roomId)} imageSrc={imageSrc} iconColor="var(--ic-surface-low)" iconSrc={iconSrc} size="small" />
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text variant="b1" weight={isUnread ? 'medium' : 'normal'}>
            {twemojify(name)}
            {parentName && (
              <Text variant="b3" span>
                {' — '}
                {twemojify(parentName)}
              </Text>
            )}
          </Text>
          {subTextPart ? (
            <Box
              component="p"
              className="text"
              sx={{
                fontSize: '10px',
              }}
            >
              {subTextPart}
            </Box>
          ) : null}
        </Box>
        {roomConditions ? <CommonConditionDisplay placement="top" roomConditions={roomConditions} /> : null}
        {isUnread && <NotificationBadge alert={isAlert} content={notificationCount !== 0 ? notificationCount : null} />}
      </>
    }
    options={options}
    onClick={onClick}
    onContextMenu={onContextMenu}
  />
)

export default RoomSelector
