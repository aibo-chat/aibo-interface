import React, { useState, useEffect, useRef, ChangeEvent, MouseEventHandler } from 'react'
import './CreateRoom.scss'
import { Controller, SubmitErrorHandler, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { Box, Button as MuiButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import validator from 'validator'
import { observer } from 'mobx-react-lite'
import { MatrixClient, MatrixError } from 'matrix-js-sdk'
import { twemojify } from '../../../util/twemojify'
import initMatrix from '../../../client/initMatrix'
import cons from '../../../client/state/cons'
import navigation from '../../../client/state/navigation'
import { selectRoom, openReusableContextMenu } from '../../../client/action/navigation'
import * as roomActions from '../../../client/action/room'
import { isRoomAliasAvailable, getIdServer } from '../../../util/matrixUtil'
import { getEventCords } from '../../../util/common'
import Text from '../../atoms/text/Text'
import Button from '../../atoms/button/Button'
import { IOSSwitch } from '../../atoms/button/Toggle'
import IconButton from '../../atoms/button/IconButton'
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu'
import Input from '../../atoms/input/Input'
import Spinner from '../../atoms/spinner/Spinner'
import SegmentControl from '../../atoms/segmented-controls/SegmentedControls'
import Dialog from '../../molecules/dialog/Dialog'
import SettingTile from '../../molecules/setting-tile/SettingTile'
import HashIC from '../../../../public/res/ic/outlined/hash.svg'
import HashLockIC from '../../../../public/res/ic/outlined/hash-lock.svg'
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg'
import SpaceIC from '../../../../public/res/ic/outlined/space.svg'
import SpaceLockIC from '../../../../public/res/ic/outlined/space-lock.svg'
import SpaceGlobeIC from '../../../../public/res/ic/outlined/space-globe.svg'
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg'
import CrossIC from '../../../../public/res/ic/outlined/cross.svg'
import CreateGroupConditionItem from '../../components/CreateRoom/CreateGroupConditionItem'
import PlusIcon from '../../../../public/res/svg/common/common_outline_plus_icon.svg?react'
import { useMobxStore } from '../../../stores/StoreProvider'
import GroupChatMigratePart from './GroupChatMigratePart'
import { MatrixHomeServer } from '../../../constant'
import { GroupConditionResult } from '../../../stores/app-store'

interface ICreateRoomContentProps {
  isSpace?: boolean
  parentId?: string
  onRequestClose: Function
}
export type CreateNewGroupCondition = {
  chain?: number
  token?: number | string
  amount?: number
}
export interface CreateRoomData {
  name: string
  topic: string
  joinRule: string
  isEncrypted: boolean
  conditions: Array<CreateNewGroupCondition>
}
export const ErrorText: React.FC<{ text: string }> = ({ text }) => (
  <Box
    sx={{
      color: '#FF3B30',
      fontSize: '12px',
      margin: '4px 0 14px',
    }}
  >
    {text}
  </Box>
)
interface IDefedCreateRoomOpts {
  name: string
  topic?: string
  joinRule: string
  alias?: string
  isEncrypted: boolean
  powerLevel?: number
  isSpace?: boolean
  parentId: string | null
  conditions: Array<GroupConditionResult>
  invite?: Array<string>
}
const CreateRoomContentWithOutObserver: React.FC<ICreateRoomContentProps> = ({ isSpace, parentId = null, onRequestClose }) => {
  const { t } = useTranslation()
  const {
    handleSubmit,
    control,
    trigger,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<CreateRoomData>({
    defaultValues: {
      name: '',
      topic: '',
      joinRule: parentId ? 'restricted' : 'invite',
      isEncrypted: true,
      conditions: [{}],
    },
  })
  const {
    appStore: { groupConditionsConfig, userAccount },
    userRelationshipStore: { oldCreatedRooms },
  } = useMobxStore()
  const { conditions, joinRule, isEncrypted } = useWatch({ control })
  // const [isEncrypted, setIsEncrypted] = useState(true)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [creatingError, setCreatingError] = useState<null | string>(null)

  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null)
  const [addressValue, setAddressValue] = useState<string | undefined>(undefined)
  const [groupChatToMigrate, setGroupChatToMigrate] = useState<number | null>(null)
  const [roleIndex, setRoleIndex] = useState(0)

  const addressRef = useRef<HTMLInputElement>(null)

  const mx = initMatrix.matrixClient
  const userHs = mx ? getIdServer(mx.getUserId()) : ''

  useEffect(() => {
    const { roomList } = initMatrix
    const onCreated = (roomId: string | undefined) => {
      setIsCreatingRoom(false)
      setCreatingError(null)
      setIsValidAddress(null)
      setAddressValue(undefined)

      if (!mx?.getRoom(roomId)?.isSpaceRoom()) {
        selectRoom(roomId)
      }
      onRequestClose()
    }
    roomList?.on(cons.events.roomList.ROOM_CREATED, onCreated)
    return () => {
      roomList?.removeListener(cons.events.roomList.ROOM_CREATED, onCreated)
    }
  }, [])

  const onInvalid: SubmitErrorHandler<CreateRoomData> = (errors, event) => {
    console.log('onInvalid', errors, event)
  }
  const onValid: SubmitHandler<CreateRoomData> = async (data) => {
    if (isCreatingRoom) return
    setIsCreatingRoom(true)
    setCreatingError(null)
    const { name, joinRule, isEncrypted, topic, conditions } = data
    const finalConditions = conditions
      .map((condition) => {
        const targetChain = groupConditionsConfig.find((item) => item.id === condition.chain)
        if (targetChain) {
          const finalAmount = condition.amount?.toString()
          const targetToken = targetChain.list.find((item) => item.id === condition.token || item.address === condition.token)
          if (targetToken) {
            return {
              ...targetToken,
              amount: finalAmount,
            }
          }
        }
        return null
      })
      .filter((item) => item) as unknown as Array<GroupConditionResult>
    let finalTopic: string | undefined = topic
    if (topic.trim() === '') finalTopic = undefined
    let roomAlias
    if (joinRule === 'public') {
      roomAlias = addressRef?.current?.value
      if (roomAlias?.trim() === '') roomAlias = undefined
    }

    const powerLevel = roleIndex === 1 ? 101 : undefined
    const createRoomOptions: IDefedCreateRoomOpts = {
      name,
      topic: finalTopic,
      joinRule,
      alias: roomAlias,
      isEncrypted: isSpace || joinRule === 'public' ? false : isEncrypted,
      powerLevel,
      isSpace,
      parentId,
      conditions: finalConditions,
    }
    // 对旧群用户进行邀请
    if (groupChatToMigrate && oldCreatedRooms?.length) {
      const targetGroupChatToMigrate = oldCreatedRooms.find((item) => item.id === groupChatToMigrate)
      if (targetGroupChatToMigrate?.conversationList?.length) {
        createRoomOptions.invite = targetGroupChatToMigrate.conversationList.filter((conv) => conv.toProxy !== userAccount?.proxyAddress).map((conv) => `@${conv.toProxy}:${MatrixHomeServer}`)
      }
    }
    try {
      await roomActions.createRoom(createRoomOptions)
    } catch (e) {
      if ((e as MatrixError)?.data?.error) {
        setCreatingError((e as MatrixError).data.error as string)
      }
      if ((e as MatrixError)?.data?.errcode && ['M_ROOM_IN_USE'].includes((e as MatrixError).data.errcode as string)) {
        setIsValidAddress(false)
      }
      setIsCreatingRoom(false)
    }
  }
  const validateAddress = (e: ChangeEvent<HTMLInputElement>) => {
    const myAddress = e.target.value
    setIsValidAddress(null)
    setAddressValue(e.target.value)
    setCreatingError(null)

    setTimeout(async () => {
      if (myAddress !== addressRef.current?.value) return
      const roomAlias = addressRef.current?.value
      if (roomAlias === '') return
      const roomAddress = `#${roomAlias}:${userHs}`

      if (await isRoomAliasAvailable(roomAddress)) {
        setIsValidAddress(true)
      } else {
        setIsValidAddress(false)
      }
    }, 1000)
  }

  const joinRules = ['invite', 'restricted', 'public']
  const joinRuleShortText = ['Private', 'Restricted', 'Public']
  const joinRuleText = ['Private (invite only)', 'Restricted (space member can join)', 'Public (anyone can join)']
  const jrRoomIC = [HashLockIC, HashIC, HashGlobeIC]
  const jrSpaceIC = [SpaceLockIC, SpaceIC, SpaceGlobeIC]
  const handleJoinRule: MouseEventHandler<HTMLButtonElement> = (evt) => {
    openReusableContextMenu('bottom', getEventCords(evt as unknown as Event, '.btn-surface'), (closeMenu: () => void) => (
      <>
        <MenuHeader>Visibility (who can join)</MenuHeader>
        {joinRules.map((rule) => (
          <MenuItem
            key={rule}
            variant={rule === joinRule ? 'positive' : 'surface'}
            iconSrc={isSpace ? jrSpaceIC[joinRules.indexOf(rule)] : jrRoomIC[joinRules.indexOf(rule)]}
            onClick={() => {
              closeMenu()
              setValue('joinRule', rule)
            }}
            disabled={!parentId && rule === 'restricted'}
          >
            {joinRuleText[joinRules.indexOf(rule)]}
          </MenuItem>
        ))}
      </>
    ))
  }
  const onAddCustomizedToken = (index: number, data: CreateNewGroupCondition) => {
    if (!conditions || !data) return
    const newConditions = [...conditions]
    newConditions.splice(index, 1, data)
    setValue('conditions', newConditions)
  }

  return (
    <div className="create-room">
      <Box component="form" className="create-room__form" onSubmit={handleSubmit(onValid, onInvalid)}>
        <SettingTile
          title="Visibility"
          options={
            <Button onClick={handleJoinRule} iconSrc={ChevronBottomIC}>
              {joinRuleShortText[joinRules.indexOf(joinRule as string)]}
            </Button>
          }
          content={<Text variant="b3">{`Select who can join this ${isSpace ? 'space' : 'room'}.`}</Text>}
        />
        {joinRule === 'public' && (
          <div>
            <Text className="create-room__address__label" variant="b2">
              {isSpace ? 'Space address' : 'Room address'}
            </Text>
            <div className="create-room__address">
              <Text variant="b1">#</Text>
              <Input value={addressValue} onChange={validateAddress} state={isValidAddress === false ? 'error' : 'normal'} forwardRef={addressRef} placeholder="my_address" required />
              <Text variant="b1" style={{ display: 'none' }}>{`:${userHs}`}</Text>
            </div>
            {isValidAddress === false && (
              <Text className="create-room__address__tip" variant="b3">
                <span style={{ color: 'var(--bg-danger)' }}>{`#${addressValue}:${userHs} is already in use`}</span>
              </Text>
            )}
          </div>
        )}
        {!isSpace && joinRule !== 'public' && (
          <SettingTile
            title="Enable end-to-end encryption"
            options={
              <IOSSwitch
                checked={isEncrypted}
                onChange={(event, checked) => {
                  setValue('isEncrypted', checked)
                }}
              />
            }
            content={<Text variant="b3">You can’t disable this later. Bridges & most bots won’t work yet.</Text>}
          />
        )}
        <SettingTile
          title="Select your role"
          options={<SegmentControl selected={roleIndex} segments={[{ text: 'Admin' }, { text: 'Founder' }]} onSelect={setRoleIndex} />}
          content={<Text variant="b3">Selecting Admin sets 100 power level whereas Founder sets 101.</Text>}
        />
        {!isSpace ? (
          <GroupChatMigratePart formSetValue={setValue} formResetField={resetField} formTrigger={trigger} setGroupChatToMigrate={setGroupChatToMigrate} groupChatToMigrate={groupChatToMigrate} />
        ) : null}
        <div className="create-room__name-wrapper">
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
                controlledValue={field.value}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const newValue = event.target.value
                  field.onChange(newValue)
                }}
                label={`${isSpace ? 'Space' : 'Room'} name`}
                disabled={groupChatToMigrate !== null}
              />
            )}
          />
        </div>
        {errors.name?.message ? <ErrorText text={errors.name.message} /> : null}
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
              controlledValue={field.value}
              minHeight={46}
              resizable
              label="Topic (optional)"
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = event.target.value
                field.onChange(newValue)
              }}
              disabled={groupChatToMigrate !== null}
            />
          )}
        />
        {errors.topic?.message ? <ErrorText text={errors.topic.message} /> : null}
        <Controller
          name="conditions"
          control={control}
          rules={{
            validate: {
              value: (value) => {
                if (value.length !== 0) {
                  const tokenValidResult = value.find((item) => item.chain && !item.token)
                  if (tokenValidResult) {
                    return t('Please set the group conditions correctly.')
                  }
                  const amountValidResult = value.find((item) => item.chain && !item.amount)
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
              {conditions?.[0] ? (
                <CreateGroupConditionItem
                  disabled={groupChatToMigrate !== null}
                  key={`${conditions[0].chain}-${conditions[0].token}-${0}`}
                  index={0}
                  condition={conditions[0]}
                  currentConditions={conditions as Array<CreateNewGroupCondition>}
                  onChange={field.onChange}
                  trigger={trigger}
                  onAddCustomizedToken={onAddCustomizedToken}
                  sx={
                    errors.conditions?.message
                      ? {
                          marginBottom: 0,
                        }
                      : undefined
                  }
                  footer={
                    <MuiButton
                      sx={{ marginLeft: '8px', padding: '10px 12px', height: '48px', backgroundColor: '#5372DD', borderRadius: '8px' }}
                      disabled={isValidAddress === false || isCreatingRoom}
                      type="submit"
                      variant="surface"
                    >
                      <Box
                        sx={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '8px',
                        }}
                      >
                        <PlusIcon
                          style={{
                            width: '100%',
                            height: '100%',
                            fill: '#FFFFFF',
                          }}
                        />
                      </Box>
                      Create
                    </MuiButton>
                  }
                />
              ) : null}
            </Box>
          )}
        />
        {errors.conditions?.message ? <ErrorText text={errors.conditions.message} /> : null}
        {isCreatingRoom && (
          <div className="create-room__loading">
            <Spinner size="small" />
            <Text>{`Creating ${isSpace ? 'space' : 'room'}...`}</Text>
          </div>
        )}
        {typeof creatingError === 'string' && (
          <Text className="create-room__error" variant="b3">
            {creatingError}
          </Text>
        )}
      </Box>
    </div>
  )
}
const CreateRoomContent = observer(CreateRoomContentWithOutObserver)

function useWindowToggle(): [{ isSpace: boolean; parentId: any } | null, () => void] {
  const [create, setCreate] = useState<{ isSpace: boolean; parentId: any } | null>(null)

  useEffect(() => {
    const handleOpen = (isSpace: boolean, parentId: any) => {
      setCreate({
        isSpace,
        parentId,
      })
    }
    navigation.on(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen)
    return () => {
      navigation.removeListener(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen)
    }
  }, [])

  const onRequestClose = () => setCreate(null)

  return [create, onRequestClose]
}

function CreateRoom() {
  const [create, onRequestClose] = useWindowToggle()
  const { isSpace, parentId } = create ?? {}
  const mx = initMatrix.matrixClient as MatrixClient
  const room = mx.getRoom(parentId)

  return (
    <Dialog
      isOpen={create !== null}
      title={
        <Text variant="s1" weight="medium" primary>
          {room ? twemojify(room.name) : 'Home'}
          <span style={{ color: 'var(--tc-surface-low)' }}>{` — create ${isSpace ? 'space' : 'room'}`}</span>
        </Text>
      }
      contentOptions={<IconButton src={CrossIC} onClick={onRequestClose} tooltip="Close" />}
      onRequestClose={onRequestClose}
    >
      {create ? <CreateRoomContent isSpace={isSpace} parentId={parentId} onRequestClose={onRequestClose} /> : <div />}
    </Dialog>
  )
}

export default CreateRoom
