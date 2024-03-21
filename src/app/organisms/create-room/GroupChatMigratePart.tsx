import { observer } from 'mobx-react-lite'
import React, { Dispatch, MouseEventHandler, SetStateAction, useCallback } from 'react'
import { Box, outlinedInputClasses, SelectChangeEvent, Tooltip } from '@mui/material'
import { UseFormSetValue } from 'react-hook-form'
import { UseFormTrigger } from 'react-hook-form/dist/types'
import { useTranslation } from 'react-i18next'
import { UseFormResetField } from 'react-hook-form/dist/types/form'
import { GroupChatMenuItem, GroupChatSelect } from '../../components/CreateRoom/GroupChatCommon'
import { useMobxStore } from '../../../stores/StoreProvider'
import HintIcon from '../../../../public/res/svg/common/common_outlined_hint_icon.svg?react'
import { CreateNewGroupCondition, CreateRoomData } from './CreateRoom'
import CommonConditionDisplay from '../../components/common/CommonConditionDisplay'
import { GroupConditionResult } from '../../../stores/app-store'
import CloseIcon from '../../../../public/res/svg/common/common_outlined_close_icon.svg?react'

interface IGroupChatMigratePartProps {
  formSetValue: UseFormSetValue<CreateRoomData>
  formResetField: UseFormResetField<CreateRoomData>
  formTrigger: UseFormTrigger<CreateRoomData>
  groupChatToMigrate: number | null
  setGroupChatToMigrate: Dispatch<SetStateAction<number | null>>
}

const GroupChatMigratePart: React.FC<IGroupChatMigratePartProps> = ({ formSetValue, formResetField, formTrigger, groupChatToMigrate, setGroupChatToMigrate }) => {
  const {
    appStore: { groupConditionsConfig },
    userRelationshipStore: { oldCreatedRooms },
  } = useMobxStore()
  const { t } = useTranslation()
  const onClearButtonClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation()
    event.preventDefault()
    formResetField('name')
    formResetField('topic')
    formResetField('conditions')
    setGroupChatToMigrate(null)
  }
  const handleGroupChatToMigrateChange = (event: SelectChangeEvent<unknown>) => {
    const targetId = event.target.value as unknown as number
    const targetGroupChat = oldCreatedRooms?.find((item) => item.id === targetId)
    if (!targetGroupChat) return
    formSetValue('name', targetGroupChat.name)
    formSetValue('topic', targetGroupChat.description)
    formSetValue('conditions', [{}])
    if (targetGroupChat.groupConditionList?.length && groupConditionsConfig?.length) {
      const resultConditions = targetGroupChat.groupConditionList
        .map((condition) => {
          const targetChain = groupConditionsConfig.find((chainItem) => chainItem.network === condition.network)
          if (targetChain?.list?.length) {
            const targetToken = targetChain.list.find((tokenItem) => tokenItem.address === condition.address)
            if (targetToken) {
              return {
                chain: targetChain.id,
                token: targetToken.id,
                amount: condition.amount,
              }
            }
          }
          return null
        })
        .filter((item) => item) as unknown as Array<CreateNewGroupCondition>
      if (resultConditions.length) {
        formSetValue('conditions', resultConditions)
      }
    }
    formTrigger()
    setGroupChatToMigrate(targetId)
  }

  const renderMigrateGroupChatItem = useCallback(
    (value: number, index: number, isTitle?: boolean) => {
      const targetGroupChat = oldCreatedRooms?.find((item) => item.id === value)
      const groupConditionList: Array<GroupConditionResult> = targetGroupChat?.groupConditionList?.length
        ? targetGroupChat.groupConditionList.map((item) => ({
            address: item.address,
            decimals: item.decimals,
            id: item.id,
            list: [],
            network: item.network,
            symbol: item.symbol,
            type: item.type,
            amount: Number(item.amount),
            token_link: item.tokenLink,
            token_logo: item.tokenLogo,
            network_logo: item.networkLogo,
            create_date: item.createDate,
            update_date: item.updateDate,
          }))
        : []
      return targetGroupChat ? (
        <GroupChatMenuItem
          sx={{
            height: '40px',
            width: isTitle ? '214px' : '234px',
            '&:hover': {
              backgroundColor: isTitle ? 'unset' : '#F4F4F4',
            },
            '&.Mui-selected:hover': {
              backgroundColor: isTitle ? 'unset !important' : '#F4F4F4 !important',
            },
            justifyContent: 'space-between',
          }}
          key={value}
          value={value}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {targetGroupChat.name}
            </Box>
            {groupConditionList?.length ? <CommonConditionDisplay roomConditions={groupConditionList} /> : null}
          </Box>
          {isTitle ? (
            <Box
              onMouseDown={onClearButtonClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
              }}
            >
              <CloseIcon
                style={{
                  width: '20px',
                  height: '20px',
                  fill: '#626262',
                  flexShrink: 0,
                }}
              />
            </Box>
          ) : null}
        </GroupChatMenuItem>
      ) : null
    },
    [oldCreatedRooms],
  )
  const renderMigrateGroupChatTitleItem = (value: unknown) =>
    value ? (
      renderMigrateGroupChatItem(value as number, 0, true)
    ) : (
      <GroupChatMenuItem
        sx={{
          height: '40px',
          width: '214px',
          '&:hover': {
            backgroundColor: 'unset',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'unset !important',
          },
        }}
      >
        <Box
          sx={{
            color: '#848484',
          }}
        >
          {t('Select a group chat')}
        </Box>
      </GroupChatMenuItem>
    )

  return oldCreatedRooms?.length ? (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            marginRight: '6px',
          }}
        >
          Migrate Group Chat
        </Box>
        <Tooltip title={t('Select the group chat that needs to be migrated.')}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HintIcon
              style={{
                width: '16px',
                height: '16px',
              }}
            />
          </Box>
        </Tooltip>
      </Box>
      <GroupChatSelect
        value={groupChatToMigrate}
        data={oldCreatedRooms.map((item) => item.id)}
        renderItem={renderMigrateGroupChatItem}
        renderValue={renderMigrateGroupChatTitleItem}
        sx={{
          [`${outlinedInputClasses.notchedOutline}`]: {
            borderRadius: '8px',
          },
        }}
        onChange={handleGroupChatToMigrateChange}
      />
    </Box>
  ) : null
}
export default observer(GroupChatMigratePart)
