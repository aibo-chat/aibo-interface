import React from 'react'
import PropTypes from 'prop-types'
import './DrawerHeader.scss'

import { observer } from 'mobx-react-lite'
import { Box } from '@mui/material'
import { twemojify } from '../../../util/twemojify'

import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import { openPublicRooms, openCreateRoom, openSpaceManage, openSpaceAddExisting, openInviteUser, openReusableContextMenu } from '../../../client/action/navigation'
import { getEventCords } from '../../../util/common'

import { blurOnBubbling } from '../../atoms/button/script'

import Text from '../../atoms/text/Text'
import RawIcon from '../../atoms/system-icons/RawIcon'
import Header, { TitleWrapper } from '../../atoms/header/Header'
import IconButton from '../../atoms/button/IconButton'
import { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu'
import SpaceOptions from '../../molecules/space-options/SpaceOptions'

import PlusIC from '../../../../public/res/ic/outlined/plus.svg'
import AddUserIC from '../../../../public/res/ic/outlined/add-user.svg'
import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg'
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg'
import HashSearchIC from '../../../../public/res/ic/outlined/hash-search.svg'
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg'
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg'
import { useMobxStore } from '../../../stores/StoreProvider'

export const HomeSpaceOptions = observer(({ spaceId, afterOptionSelect }) => {
  const {
    userRelationshipStore: { notMigratedRelationship },
  } = useMobxStore()
  const mx = initMatrix.matrixClient
  const room = mx.getRoom(spaceId)
  const canManage = room ? room.currentState.maySendStateEvent('m.space.child', mx.getUserId()) : true

  return (
    <>
      <MenuHeader>Add rooms or spaces</MenuHeader>
      {!spaceId ? (
        <Box
          sx={{
            position: 'relative',
          }}
        >
          {notMigratedRelationship?.length ? (
            <Box
              sx={{
                position: 'absolute',
                left: '34px',
                top: '8px',
                height: '5px',
                borderRadius: '3px',
                width: '5px',
                backgroundColor: '#FF4940',
              }}
            />
          ) : null}
          <MenuItem
            iconSrc={AddUserIC}
            onClick={() => {
              afterOptionSelect()
              openInviteUser()
            }}
            disabled={!canManage}
          >
            Add direct message
          </MenuItem>
        </Box>
      ) : null}
      <MenuItem
        iconSrc={SpacePlusIC}
        onClick={() => {
          afterOptionSelect()
          openCreateRoom(true, spaceId)
        }}
        disabled={!canManage}
      >
        Create new space
      </MenuItem>
      <MenuItem
        iconSrc={HashPlusIC}
        onClick={() => {
          afterOptionSelect()
          openCreateRoom(false, spaceId)
        }}
        disabled={!canManage}
      >
        Create new room
      </MenuItem>
      {!spaceId && (
        <MenuItem
          iconSrc={HashGlobeIC}
          onClick={() => {
            afterOptionSelect()
            openPublicRooms()
          }}
        >
          Explore public rooms/spaces
        </MenuItem>
      )}
      {/* { !spaceId && ( */}
      {/*  <MenuItem */}
      {/*    iconSrc={PlusIC} */}
      {/*    onClick={() => { afterOptionSelect(); openJoinAlias(); }} */}
      {/*  > */}
      {/*    Join with address */}
      {/*  </MenuItem> */}
      {/* )} */}
      {spaceId && (
        <MenuItem
          iconSrc={PlusIC}
          onClick={() => {
            afterOptionSelect()
            openSpaceAddExisting(spaceId)
          }}
          disabled={!canManage}
        >
          Add existing
        </MenuItem>
      )}
      {spaceId && (
        <MenuItem
          onClick={() => {
            afterOptionSelect()
            openSpaceManage(spaceId)
          }}
          iconSrc={HashSearchIC}
        >
          Manage rooms
        </MenuItem>
      )}
    </>
  )
})
HomeSpaceOptions.defaultProps = {
  spaceId: null,
}
HomeSpaceOptions.propTypes = {
  spaceId: PropTypes.string,
  afterOptionSelect: PropTypes.func.isRequired,
}

const DrawerHeader = ({ selectedTab, spaceId }) => {
  const {
    renderStore: { _ROOM_LIST_UPDATED },
    userRelationshipStore: { notMigratedRelationship },
  } = useMobxStore()
  const mx = initMatrix.matrixClient
  const tabName = selectedTab !== cons.tabs.DIRECTS ? 'Home' : 'Direct messages'

  const isDMTab = selectedTab === cons.tabs.DIRECTS
  const room = mx.getRoom(spaceId)
  const spaceName = isDMTab ? null : room?.name || null

  const openSpaceOptions = (e) => {
    e.preventDefault()
    openReusableContextMenu('bottom', getEventCords(e, '.header'), (closeMenu) => <SpaceOptions roomId={spaceId} afterOptionSelect={closeMenu} />)
  }

  const openHomeSpaceOptions = (e) => {
    e.preventDefault()
    openReusableContextMenu('right', getEventCords(e, '.ic-btn'), (closeMenu) => <HomeSpaceOptions spaceId={spaceId} afterOptionSelect={closeMenu} />)
  }

  return (
    <Header>
      {spaceName ? (
        <button className="drawer-header__btn" onClick={openSpaceOptions} type="button" onMouseUp={(e) => blurOnBubbling(e, '.drawer-header__btn')}>
          <TitleWrapper>
            <Text variant="s1" weight="medium" primary>
              {twemojify(spaceName)}
            </Text>
          </TitleWrapper>
          <RawIcon size="small" src={ChevronBottomIC} />
        </button>
      ) : (
        <TitleWrapper>
          <Text variant="s1" weight="medium" primary>
            {tabName}
          </Text>
        </TitleWrapper>
      )}

      {isDMTab && <IconButton onClick={() => openInviteUser()} tooltip="Start DM" src={PlusIC} size="small" />}
      {!isDMTab && (
        <Box
          className="user-guide-first-step"
          sx={{
            position: 'relative',
          }}
        >
          {!spaceName && notMigratedRelationship?.length ? (
            <Box
              sx={{
                position: 'absolute',
                right: '6px',
                top: '6px',
                height: '5px',
                borderRadius: '3px',
                width: '5px',
                backgroundColor: '#FF4940',
              }}
            />
          ) : null}
          <IconButton onClick={openHomeSpaceOptions} tooltip="Add rooms/spaces" src={PlusIC} size="small" />
        </Box>
      )}
    </Header>
  )
}

DrawerHeader.defaultProps = {
  spaceId: null,
}
DrawerHeader.propTypes = {
  selectedTab: PropTypes.string.isRequired,
  spaceId: PropTypes.string,
}

export default observer(DrawerHeader)
