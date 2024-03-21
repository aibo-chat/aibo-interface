import React, { useState, useEffect, ChangeEvent, useMemo } from 'react'
import './RoomProfile.scss'

import { MatrixClient, Room } from 'matrix-js-sdk'
import { Box } from '@mui/material'
import { Controller, SubmitErrorHandler, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import validator from 'validator'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { twemojify } from '../../../util/twemojify'

import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import colorMXID from '../../../util/colorMXID'

import Text from '../../atoms/text/Text'
import Avatar from '../../atoms/avatar/Avatar'
import Button from '../../atoms/button/Button'
import Input from '../../atoms/input/Input'
import IconButton from '../../atoms/button/IconButton'
import ImageUpload from '../image-upload/ImageUpload'

import PencilIC from '../../../../public/res/ic/outlined/pencil.svg'

import { useStore } from '../../hooks/useStore'
import { useForceUpdate } from '../../hooks/useForceUpdate'
import { confirmDialog } from '../confirm-dialog/ConfirmDialog'
import { parseMatrixAccountId } from '../../../util/common'
import RoomList from '../../../client/state/RoomList'
import { CreateNewGroupCondition, ErrorText } from '../../organisms/create-room/CreateRoom'
import CreateGroupConditionItem from '../../components/CreateRoom/CreateGroupConditionItem'
import { useMobxStore } from '../../../stores/StoreProvider'
import { GroupConditionResult } from '../../../stores/app-store'
import { DefedEventType } from '../../../types/defed/message'
import CommonConditionDisplay from '../../components/common/CommonConditionDisplay'

interface IRoomProfileProps {
  roomId: string
}

interface UpdateRoomData {
  name: string
  topic?: string
  conditions?: Array<CreateNewGroupCondition>
}

const RoomProfile: React.FC<IRoomProfileProps> = ({ roomId }) => {
  const isMountStore = useStore()
  const {
    appStore: { groupConditionsConfig, developerMode },
  } = useMobxStore()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [, forceUpdate] = useForceUpdate()
  const [status, setStatus] = useState<{ msg: null | string; type: string }>({
    msg: null,
    type: cons.status.PRE_FLIGHT,
  })

  const mx = initMatrix.matrixClient as MatrixClient
  const roomList = initMatrix.roomList as RoomList
  const isDM = roomList.directs.has(roomId)
  const room = mx.getRoom(roomId) as Room
  let avatarSrc: string | null | undefined = room.getAvatarUrl(mx.baseUrl, 36, 36, 'crop')
  avatarSrc = isDM ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 36, 36, 'crop', undefined, false) : avatarSrc
  const { currentState } = room
  const roomName = room.name // 生成房间名时没有设置，则sdk返回基于用户的房间名称
  const roomTopic = currentState.getStateEvents('m.room.topic')[0]?.getContent().topic
  const roomConditions = currentState.getStateEvents(DefedEventType.RoomConditions)[0]?.getContent().room_conditions as Array<GroupConditionResult>

  const {
    handleSubmit,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<UpdateRoomData>({
    defaultValues: {
      name: roomName,
      topic: roomTopic,
      conditions: [],
    },
  })
  const { conditions } = useWatch({ control })
  const userId = mx.getUserId() as string
  const canChangeAvatar = currentState.maySendStateEvent('m.room.avatar', userId)
  // const canChangeName = currentState.maySendStateEvent('m.room.name', userId) //目前不让修改名称了
  const canChangeName = false
  const canChangeTopic = currentState.maySendStateEvent('m.room.topic', userId)
  const canChangeRoomConditions = roomConditions?.[0] && currentState.maySendEvent(DefedEventType.RoomConditions, userId)
  const showEditButton = useMemo(
    () => developerMode || (!isDM && (canChangeName || canChangeTopic || canChangeRoomConditions)),
    [canChangeName, canChangeRoomConditions, canChangeTopic, developerMode, isDM],
  )

  useEffect(() => {
    isMountStore.setItem(true)
    const roomList = initMatrix.roomList as RoomList
    const handleProfileUpdate = (rId: string) => {
      if (roomId !== rId) return
      forceUpdate()
    }

    roomList.on(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate)
    return () => {
      roomList.removeListener(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate)
      isMountStore.setItem(false)
      setStatus({
        msg: null,
        type: cons.status.PRE_FLIGHT,
      })
      setIsEditing(false)
    }
  }, [roomId])

  const onInvalid: SubmitErrorHandler<UpdateRoomData> = (errors, event) => {
    console.log('onInvalid', errors, event)
  }
  const getFormConditionData = (conditions: Array<GroupConditionResult>) =>
    conditions?.length
      ? (conditions
          .map((condition) => {
            const targetChain = groupConditionsConfig.find((item) => item.network === condition.network)
            if (targetChain) {
              const targetToken = targetChain.list.find((item) => item.id === condition.id)
              if (targetToken) {
                return {
                  chain: targetChain.id,
                  token: targetToken.id,
                  amount: condition.amount,
                }
              }
              return {
                ...condition,
                chain: targetChain.id,
                token: condition.address,
                amount: condition.amount,
              }
            }
            return undefined
          })
          .filter((item) => item) as Array<CreateNewGroupCondition>)
      : []
  const onValid: SubmitHandler<UpdateRoomData> = async (data) => {
    const { name: newName, topic: newTopic, conditions: newConditions } = data
    try {
      if (canChangeName) {
        if (newName !== roomName && roomName.trim() !== '') {
          setStatus({
            msg: 'Saving room name...',
            type: cons.status.IN_FLIGHT,
          })
          await mx.setRoomName(roomId, newName)
        }
      }
      if (canChangeTopic) {
        if (newTopic !== roomTopic) {
          if (isMountStore.getItem()) {
            setStatus({
              msg: 'Saving room topic...',
              type: cons.status.IN_FLIGHT,
            })
          }
          await mx.setRoomTopic(roomId, newTopic as string)
        }
      }
      if (newConditions?.length) {
        const originalConditions = getFormConditionData(roomConditions)
        const originalConditionsStr = JSON.stringify(originalConditions)
        const newConditionsStr = JSON.stringify(newConditions)
        if (originalConditionsStr !== newConditionsStr) {
          const finalConditions = newConditions
            .map((condition) => {
              const finalAmount = condition.amount?.toString()
              const targetChain = groupConditionsConfig.find((item) => item.id === condition.chain)
              if (targetChain) {
                const targetToken = targetChain.list.find((item) => item.id === condition.token)
                if (targetToken) {
                  return {
                    ...targetToken,
                    amount: finalAmount,
                  }
                }
              }
              return null
            })
            .filter((item) => item)
          if (isMountStore.getItem()) {
            setStatus({
              msg: t('Saving room conditions...'),
              type: cons.status.IN_FLIGHT,
            })
          }
          await mx.sendStateEvent(roomId, DefedEventType.RoomConditions, { room_conditions: finalConditions })
        }
      }
      if (!isMountStore.getItem()) return
      setStatus({
        msg: 'Saved successfully',
        type: cons.status.SUCCESS,
      })
    } catch (err) {
      if (!isMountStore.getItem()) return
      setStatus({
        msg: (err as Error).message || 'Unable to save.',
        type: cons.status.ERROR,
      })
    }
  }

  const handleCancelEditing = () => {
    setStatus({
      msg: null,
      type: cons.status.PRE_FLIGHT,
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = async (url: null | string) => {
    if (url === null) {
      const isConfirmed = await confirmDialog('Remove avatar', 'Are you sure that you want to remove room avatar?', 'Remove', 'caution')
      if (isConfirmed) {
        await mx.sendStateEvent(roomId, 'm.room.avatar', { url }, '')
      }
    } else await mx.sendStateEvent(roomId, 'm.room.avatar', { url }, '')
  }

  const onAddCustomizedToken = (index: number, data: CreateNewGroupCondition) => {
    if (!conditions || !data) return
    const newConditions = [...conditions]
    newConditions.splice(index, 1, data)
    setValue('conditions', newConditions)
  }

  const renderEditNameAndTopic = () => (
    <Box component="form" className="room-profile__edit-form" onSubmit={handleSubmit(onValid, onInvalid)}>
      {canChangeName ? (
        <Controller
          control={control}
          name="name"
          rules={{
            required: t('Room name should not be empty!'),
            validate: (value) => {
              if (value) {
                const result = validator.isLength(value, { max: 50 })
                if (!result) {
                  return t('Room name should be less than 50 characters!')
                }
              }
            },
          }}
          render={({ field }) => (
            <Input
              value={field.value}
              disabled={status.type === cons.status.IN_FLIGHT}
              label="Name"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.onChange(event.target.value)
              }}
            />
          )}
        />
      ) : null}
      {errors.name?.message ? <ErrorText text={errors.name.message} /> : null}
      {canChangeTopic ? (
        <Controller
          control={control}
          name="topic"
          rules={{
            validate: (value) => {
              if (value) {
                const result = validator.isLength(value, { max: 200 })
                if (!result) {
                  return t('Room topic should be less than 200 characters!')
                }
              }
            },
          }}
          render={({ field }) => (
            <Input
              value={field.value}
              disabled={status.type === cons.status.IN_FLIGHT}
              minHeight={100}
              resizable
              label="Topic"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.onChange(event.target.value)
              }}
            />
          )}
        />
      ) : null}
      {errors.topic?.message ? <ErrorText text={errors.topic.message} /> : null}
      {canChangeRoomConditions ? (
        <Controller
          name="conditions"
          control={control}
          rules={{
            validate: {
              value: (value) => {
                if (value?.length !== 0) {
                  const tokenValidResult = value?.find((item) => !item.token || !item.chain)
                  if (tokenValidResult) {
                    return t('Please set the group conditions correctly.')
                  }
                  const amountValidResult = value?.find((item) => !item.amount)
                  if (amountValidResult) {
                    return t('Please enter the correct group conditions.')
                  }
                }
              },
            },
          }}
          render={({ field }) => (
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              <label className="input__label text-b2">{t('Entry condition (optional)')}</label>
              {field.value?.map((condition, index) => (
                <CreateGroupConditionItem
                  key={`${condition.chain}-${condition.token}-${index}`}
                  index={index}
                  condition={condition}
                  currentConditions={roomConditions as unknown as Array<CreateNewGroupCondition>}
                  onChange={field.onChange}
                  trigger={trigger}
                  sx={
                    errors.conditions?.message
                      ? {
                          marginBottom: 0,
                        }
                      : undefined
                  }
                  footer={room.isSpaceRoom() ? <Box /> : null}
                  disabled={!canChangeRoomConditions}
                  onAddCustomizedToken={onAddCustomizedToken}
                />
              ))}
            </Box>
          )}
        />
      ) : null}
      {errors.conditions?.message ? <ErrorText text={errors.conditions.message} /> : null}
      {(!canChangeName || !canChangeTopic) && <Text variant="b3">{`You have permission to change ${room.isSpaceRoom() ? 'space' : 'room'} ${canChangeName ? 'name' : 'topic'} only.`}</Text>}
      {status.type === cons.status.IN_FLIGHT && <Text variant="b2">{status.msg}</Text>}
      {status.type === cons.status.SUCCESS && (
        <Text style={{ color: 'var(--tc-positive-high)' }} variant="b2">
          {status.msg}
        </Text>
      )}
      {status.type === cons.status.ERROR && (
        <Text style={{ color: 'var(--tc-danger-high)' }} variant="b2">
          {status.msg}
        </Text>
      )}
      {status.type !== cons.status.IN_FLIGHT && (
        <div>
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button onClick={handleCancelEditing}>Cancel</Button>
        </div>
      )}
    </Box>
  )

  const changeEditMode = () => {
    setValue('name', roomName)
    setValue('topic', roomTopic)
    if (roomConditions) {
      setValue('conditions', getFormConditionData(roomConditions))
    }
    setIsEditing(true)
  }
  const renderNameAndTopic = () => (
    <div className="room-profile__display" style={{ marginBottom: avatarSrc && canChangeAvatar ? '24px' : '0', flex: 1, overflow: 'hidden', alignItems: 'stretch' }}>
      <Box>
        <Text
          variant="h2"
          weight="medium"
          primary
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {twemojify(roomName, undefined, false, true)}
        </Text>
        {roomConditions?.length ? (
          <CommonConditionDisplay
            roomConditions={roomConditions}
            sx={{
              marginRight: '4px',
            }}
          />
        ) : null}
        {showEditButton && <IconButton src={PencilIC} size="extra-small" tooltip="Edit" onClick={changeEditMode} />}
      </Box>
      <Text variant="b3">{`Room Id：${parseMatrixAccountId(room.getCanonicalAlias() || room.roomId)}`}</Text>
      {roomTopic && <Text variant="b2">{twemojify(roomTopic, undefined, true)}</Text>}
    </div>
  )

  return (
    <div className="room-profile">
      <div className="room-profile__content">
        {!canChangeAvatar && <Avatar imageSrc={avatarSrc as any} text={roomName} bgColor={colorMXID(roomId)} size="large" />}
        {canChangeAvatar && <ImageUpload text={roomName} bgColor={colorMXID(roomId)} imageSrc={avatarSrc} onUpload={handleAvatarUpload} onRequestRemove={() => handleAvatarUpload(null)} />}
        {!isEditing && renderNameAndTopic()}
        {isEditing && renderEditNameAndTopic()}
      </div>
    </div>
  )
}

export default observer(RoomProfile)
