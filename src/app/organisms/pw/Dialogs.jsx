import React from 'react'

import { observer } from 'mobx-react-lite'
import ReadReceipts from '../read-receipts/ReadReceipts'
import ProfileViewer from '../profile-viewer/ProfileViewer'
import ShortcutSpaces from '../shortcut-spaces/ShortcutSpaces'
import SpaceAddExisting from '../../molecules/space-add-existing/SpaceAddExisting'
import Search from '../search/Search'
import ViewSource from '../view-source/ViewSource'
import CreateRoom from '../create-room/CreateRoom'
import JoinAlias from '../join-alias/JoinAlias'
import EmojiVerification from '../emoji-verification/EmojiVerification'

import ReusableDialog from '../../molecules/dialog/ReusableDialog'
import SetPasswordModal from '../../components/SetPasswordModal'
import AddCustomizedTokenModal from '../../components/CreateRoom/AddCustomizedTokenModal'
import { useMobxStore } from '../../../stores/StoreProvider'
import UserGuide from '../../components/common/UserGuide'

function Dialogs() {
  const {
    modalStore: { addCustomizedTokenConditionPreInfo, userGuideVisible },
  } = useMobxStore()
  console.log('Dialogs', userGuideVisible)
  return (
    <>
      <ReadReceipts />
      <ViewSource />
      <ProfileViewer />
      <ShortcutSpaces />
      <CreateRoom />
      <JoinAlias />
      <SpaceAddExisting />
      <Search />
      <EmojiVerification />
      <SetPasswordModal />
      <ReusableDialog />
      {addCustomizedTokenConditionPreInfo ? <AddCustomizedTokenModal /> : null}
      {userGuideVisible ? <UserGuide /> : null}
    </>
  )
}

export default observer(Dialogs)
