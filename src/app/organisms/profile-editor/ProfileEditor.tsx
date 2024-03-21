import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box } from '@mui/material'
import { MatrixClient } from 'matrix-js-sdk'
import { observer } from 'mobx-react-lite'
import { twemojify } from '../../../util/twemojify'

import initMatrix from '../../../client/initMatrix'
import colorMXID from '../../../util/colorMXID'

import Text from '../../atoms/text/Text'
import IconButton from '../../atoms/button/IconButton'
import Button from '../../atoms/button/Button'
import ImageUpload from '../../molecules/image-upload/ImageUpload'
import Input from '../../atoms/input/Input'

import PencilIC from '../../../../public/res/ic/outlined/pencil.svg'
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog'
import './ProfileEditor.scss'
import { substitutionString, substitutionStringForMatrixId } from '../../../util/common'
import { useMobxStore } from '../../../stores/StoreProvider'

interface IProfileEditorProps {
  userId: string
}
const ProfileEditor: React.FC<IProfileEditorProps> = ({ userId }) => {
  const {
    appStore: { developerMode },
  } = useMobxStore()
  const [isEditing, setIsEditing] = useState(false)
  const mx = initMatrix.matrixClient as MatrixClient
  const user = mx ? mx.getUser(mx.getUserId() || '') : null
  const displayUserId = useMemo(() => substitutionStringForMatrixId(userId, 30, 30, '.'), [userId])
  const displayNameRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState(mx && user?.avatarUrl ? mx.mxcUrlToHttp(user.avatarUrl, 80, 80, 'crop') : null)
  const [username, setUsername] = useState(user?.displayName)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    let isMounted = true
    mx.getProfileInfo(mx.getUserId() || '').then((info) => {
      if (!isMounted) return
      setAvatarSrc(info.avatar_url ? mx.mxcUrlToHttp(info.avatar_url, 80, 80, 'crop') : null)
      setUsername(info.displayname || user?.displayName)
    })
    return () => {
      isMounted = false
    }
  }, [userId])

  const handleAvatarUpload = async (url: string | null) => {
    if (url === null) {
      const isConfirmed = await confirmDialog('Remove avatar', 'Are you sure that you want to remove avatar?', 'Remove', 'caution')
      if (isConfirmed) {
        mx.setAvatarUrl('')
        setAvatarSrc(null)
      }
      return
    }
    mx.setAvatarUrl(url)
    setAvatarSrc(mx.mxcUrlToHttp(url, 80, 80, 'crop'))
  }

  const saveDisplayName = () => {
    const newDisplayName = displayNameRef.current?.value
    if (newDisplayName && newDisplayName !== username) {
      mx.setDisplayName(newDisplayName)
      setUsername(newDisplayName)
      setDisabled(true)
      setIsEditing(false)
    }
  }

  const onDisplayNameInputChange = () => {
    setDisabled(username === displayNameRef.current?.value || displayNameRef.current?.value == null)
  }
  const cancelDisplayNameChanges = () => {
    if (displayNameRef.current) {
      displayNameRef.current.value = username || ''
    }
    onDisplayNameInputChange()
    setIsEditing(false)
  }

  // @ts-ignore
  const renderForm = () => (
    <form
      className="profile-editor__form"
      style={{ marginBottom: avatarSrc ? '24px' : '0' }}
      onSubmit={(e) => {
        e.preventDefault()
        saveDisplayName()
      }}
    >
      <Input label={`Display name of ${mx.getUserId()}`} onChange={onDisplayNameInputChange} value={mx.getUser(mx.getUserId() || '')?.displayName} forwardRef={displayNameRef} />
      <Button variant="primary" type="submit" disabled={disabled}>
        Save
      </Button>
      <Button onClick={cancelDisplayNameChanges}>Cancel</Button>
    </form>
  )

  const renderInfo = () => (
    <div className="profile-editor__info" style={{ marginBottom: avatarSrc ? '24px' : '0' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Text variant="h2" primary weight="medium" style={{ textOverflow: 'ellipsis', width: '100%', overflow: 'hidden' }}>
            {username ? twemojify(substitutionString(username)) : substitutionString(displayUserId)}
          </Text>
        </Box>
        {developerMode ? <IconButton src={PencilIC} size="extra-small" tooltip="Edit" onClick={() => setIsEditing(true)} /> : null}
      </Box>
      <br />
      <Text
        variant="b2"
        style={{
          wordBreak: 'break-all',
        }}
      >
        {displayUserId}
      </Text>
    </div>
  )

  return (
    <div className="profile-editor">
      <ImageUpload text={username ?? userId} bgColor={colorMXID(userId)} imageSrc={avatarSrc} onUpload={handleAvatarUpload} onRequestRemove={() => handleAvatarUpload(null)} />
      {isEditing ? renderForm() : renderInfo()}
    </div>
  )
}

export default observer(ProfileEditor)
