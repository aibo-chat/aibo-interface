import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, ChangeEventHandler, useMemo } from 'react'
import { Box, Button, ButtonBase, InputBase, SxProps, Theme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { FieldPathValue, UseFormTrigger } from 'react-hook-form/dist/types'
import { CreateNewGroupCondition } from '../../organisms/create-room/CreateRoom'
import { useMobxStore } from '../../../stores/StoreProvider'
import { GroupChatMenuItem, GroupChatNumberFormatCustom, GroupChatSelect } from './GroupChatCommon'
import ExtraLinkIcon from '../../../../public/res/svg/common/common_outline_external_link_icon.svg?react'
import CommonImage from '../common/CommonImage'
import PlusIcon from '../../../../public/res/svg/common/common_outline_plus_icon.svg?react'
import commonImageMap from '../../../images/commonImageMap'

export const IMAGE_URL_PREFIX = 'https://defed.mypinata.cloud/ipfs/'
interface ICreateGroupConditionItemProps {
  index: number
  condition: CreateNewGroupCondition
  currentConditions: Array<CreateNewGroupCondition>
  onChange: (event: ChangeEvent | FieldPathValue<any, 'conditions'>) => void
  trigger: UseFormTrigger<any>
  onAddCustomizedToken: (index: number, data: CreateNewGroupCondition) => void
  sx?: SxProps<Theme>
  footer?: React.ReactNode
  disabled?: boolean
}
const CreateGroupConditionItem: React.FC<ICreateGroupConditionItemProps> = ({ condition, index, currentConditions, onChange, trigger, sx, footer, disabled = false, onAddCustomizedToken }) => {
  const {
    appStore: { groupConditionsConfig },
    modalStore: { changeAddCustomizedTokenConditionPreInfo },
  } = useMobxStore()
  const { t } = useTranslation()
  const isEditVersion = useMemo(() => !footer, [footer])
  const currentChain = useMemo(() => groupConditionsConfig.find((item) => item.id === condition.chain), [condition.chain, groupConditionsConfig])
  const chainData = useMemo(() => groupConditionsConfig.map((item) => item.id), [groupConditionsConfig])
  const tokenData = useMemo(() => (currentChain?.list && Array.isArray(currentChain.list) ? currentChain.list.map((item) => item.id) : []), [currentChain])
  const inputDecimal = useMemo(() => {
    if (condition.token === 4) {
      return 0
    }
    return 4
  }, [condition.token])
  const onAmountChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value
    const newConditions = [...currentConditions]
    newConditions.splice(index, 1, {
      ...condition,
      amount: newValue ? Number(newValue) : undefined,
    })
    onChange(newConditions)
    trigger('conditions')
  }
  const onTokenChange: (event: SelectChangeEvent<any>, child: React.ReactNode) => void = (event) => {
    if (!currentChain || !event.target.value) return
    const newConditions = [...currentConditions]
    newConditions.splice(index, 1, {
      chain: currentChain.id,
      token: event.target.value,
      amount: undefined,
    })
    onChange(newConditions)
  }
  const onChainChange: (event: SelectChangeEvent<any>, child: React.ReactNode) => void = (event) => {
    const newConditions = [...currentConditions]
    newConditions.splice(index, 1, {
      chain: event.target.value,
      token: undefined,
      amount: undefined,
    })
    onChange(newConditions)
  }
  const renderTokenSelectExtraContent = () => (
    <Button
      sx={{
        width: '100%',
        padding: '10px 12px 10px 8px',
        fontFamily: 'var(--font-secondary)',
        color: '#4685FF',
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: '#F4F4F4',
        },
        justifyContent: 'flex-start',
      }}
      variant="text"
      onClick={(event) => {
        event.preventDefault()
        changeAddCustomizedTokenConditionPreInfo(currentChain, (data) => {
          onAddCustomizedToken(index, data)
        })
      }}
    >
      <PlusIcon
        style={{
          width: '20px',
          height: '20px',
          fill: '#4685FF',
          marginRight: '10px',
        }}
      />
      <Box
        sx={{
          color: '#4685FF',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '24px',
        }}
      >
        {t('Add customized token')}
      </Box>
    </Button>
  )

  const renderTokenSelectItem = (value: any, index: number, isTitle = false) => {
    const targetDefaultToken = currentChain?.list?.find((item) => item.id === value || item.address === value)
    let displayTokenImage = ''
    let displaySymbol
    let displayLink: string | URL | undefined
    if (targetDefaultToken) {
      displayTokenImage = targetDefaultToken.token_logo ? `${IMAGE_URL_PREFIX}${targetDefaultToken.token_logo}` : commonImageMap.commonFullFilledQuestionMarkIcon
      displaySymbol = targetDefaultToken.symbol
      displayLink = targetDefaultToken.token_link
    }
    return (
      <GroupChatMenuItem
        sx={{
          height: '40px',
          width: '234px',
          '&:hover': {
            backgroundColor: isTitle ? 'unset' : '#F4F4F4',
          },
          '&.Mui-selected:hover': {
            backgroundColor: isTitle ? 'unset !important' : undefined,
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        key={value}
        value={value}
      >
        {value ? (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <CommonImage
                src={displayTokenImage}
                sx={{
                  width: '20px',
                  height: '20px',
                  marginRight: '10px',
                }}
              />
              <Box
                sx={{
                  color: '#474746',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displaySymbol}
              </Box>
            </Box>
            {isTitle ? null : (
              <ButtonBase
                onClick={() => {
                  if (displayLink) {
                    window.open(displayLink)
                  }
                }}
              >
                <ExtraLinkIcon
                  style={{
                    width: '20px',
                    height: '20px',
                    fill: '#4685FF',
                  }}
                />
              </ButtonBase>
            )}
          </>
        ) : (
          <Box
            sx={{
              color: '#848484',
            }}
          >
            {t('Select token')}
          </Box>
        )}
      </GroupChatMenuItem>
    )
  }
  const renderTokenTitleSelectItem = (value: any) => renderTokenSelectItem(value, 0, true)
  const renderChainSelectItem = (value: any, index: number, isTitle = false) => {
    const targetChain = groupConditionsConfig.find((item) => item.id === value)
    return (
      <GroupChatMenuItem
        sx={{
          height: '40px',
          width: '234px',
          '&:hover': {
            backgroundColor: isTitle ? 'unset' : '#F4F4F4',
          },
          '&.Mui-selected:hover': {
            backgroundColor: isTitle ? 'unset !important' : '#F4F4F4 !important',
          },
        }}
        key={value}
        value={value}
      >
        {targetChain ? (
          <>
            <CommonImage
              src={`${IMAGE_URL_PREFIX}${targetChain.network_logo}`}
              sx={{
                width: '20px',
                height: '20px',
                marginRight: '10px',
              }}
            />
            <Box
              sx={{
                color: '#474746',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '24px',
              }}
            >
              {targetChain.network}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              color: '#848484',
            }}
          >
            {t('Select chain')}
          </Box>
        )}
      </GroupChatMenuItem>
    )
  }
  const renderChainTitleSelectItem = (value: any) => renderChainSelectItem(value, 0, true)
  return (
    <Box
      sx={{
        width: '100%',
        display: isEditVersion ? 'flex' : 'block',
        alignItems: isEditVersion ? 'center' : 'normal',
        ...sx,
      }}
    >
      <Box
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
          },
          isEditVersion
            ? { flexShrink: 0, marginRight: '8px' }
            : {
                width: '100%',
                marginBottom: '8px',
              },
        ]}
      >
        <GroupChatSelect
          sx={{
            marginRight: '8px',
            width: isEditVersion ? '244px' : 'unset',
            flexGrow: isEditVersion ? 0 : 1,
            flexShrink: isEditVersion ? 0 : 1,
            flexBasis: isEditVersion ? 1 : 0,
            overflow: isEditVersion ? 'visible' : 'hidden',
          }}
          data={chainData}
          renderItem={renderChainSelectItem}
          value={condition.chain || ''}
          renderValue={renderChainTitleSelectItem}
          onChange={onChainChange}
          disabled={disabled}
        />
        <GroupChatSelect
          sx={
            isEditVersion
              ? {
                  width: '244px',
                }
              : {
                  flex: 1,
                  overflow: 'hidden',
                }
          }
          data={tokenData}
          renderItem={renderTokenSelectItem}
          value={condition.token || ''}
          renderValue={renderTokenTitleSelectItem}
          onChange={onTokenChange}
          extraContent={renderTokenSelectExtraContent}
          disabled={disabled}
        />
      </Box>
      <Box
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
          },
          isEditVersion
            ? { flex: 1, overflow: 'hidden' }
            : {
                width: '100%',
              },
        ]}
      >
        <InputBase
          sx={{ alignItems: 'baseline', flex: 1, overflow: 'hidden', border: '1px solid #E6EBF0', borderRadius: '8px', padding: '3px 12px' }}
          placeholder={t('minimum holding amount')}
          value={condition.amount}
          autoFocus
          onChange={onAmountChange}
          inputProps={{
            sx: {
              textAlign: 'left',
              fontSize: { xsm: '14px', xs: '14px' },
              fontWeight: 500,
              color: '#474746',
              height: { xs: '40px', xsm: '40px' },
              '&::placeholder': {
                opacity: 1,
                color: '#848484',
              },
              padding: 0,
            },
            decimalScale: inputDecimal,
            'aria-label': 'amount input',
            isAllowed: (values: { floatValue: number }) => {
              if (!condition.chain || !condition.token) return false
              const { floatValue } = values
              if (floatValue === undefined) {
                return true
              }
              return floatValue >= 0
            },
          }}
          inputComponent={GroupChatNumberFormatCustom as any}
          disabled={disabled}
        />
        {footer && footer}
      </Box>
    </Box>
  )
}
export default observer(CreateGroupConditionItem)
