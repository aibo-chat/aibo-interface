import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Box, SxProps, Theme, Tooltip, tooltipClasses, TooltipProps } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ConditionIcon from '../../../../public/res/svg/common/common_outlined_condition_icon.svg?react'
import { IMAGE_URL_PREFIX } from '../CreateRoom/CreateGroupConditionItem'
import { GroupConditionResult } from '../../../stores/app-store'
import commonImageMap from '../../../images/commonImageMap'
import CommonImage from './CommonImage'

interface ICommonConditionDisplayProps {
  roomConditions: Array<GroupConditionResult>
  sx?: SxProps<Theme>
  placement?: TooltipProps['placement']
}

const CommonConditionDisplay: React.FC<ICommonConditionDisplayProps> = ({ sx, roomConditions, placement = 'bottom' }) => {
  const { t } = useTranslation()
  const condition = useMemo(() => roomConditions?.[0], [roomConditions])
  return (
    <Tooltip
      slotProps={{
        popper: {
          sx: {
            [`& .${tooltipClasses.tooltip}`]: {
              backgroundColor: 'transparent',
              padding: '0',
            },
            [`& .${tooltipClasses.tooltipPlacementBottom}`]: {
              marginTop: '4px !important',
            },
            [`& .${tooltipClasses.tooltipPlacementTop}`]: {
              marginBottom: '4px !important',
            },
            [`& .${tooltipClasses.tooltipPlacementLeft}`]: {
              marginRight: '4px !important',
            },
            [`& .${tooltipClasses.tooltipPlacementRight}`]: {
              marginLeft: '4px !important',
            },
          },
        },
      }}
      title={
        condition ? (
          <Box
            sx={{
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: '8px',
              backgroundColor: '#1A1A1A',
              border: '1px solid #CCC',
              overflow: 'hidden',
              fontSize: '12px',
              fontWeigh: 500,
              lineHeight: 'normal',
              color: '#FFFFFF',
              position: 'relative',
              padding: '8px',
            }}
          >
            <CommonImage
              sx={{
                width: '14px',
                height: '14px',
                borderRadius: '7px',
                marginRight: '4px',
                flexShrink: 0,
              }}
              src={condition.network_logo ? `${IMAGE_URL_PREFIX}${condition.network_logo}` : commonImageMap.commonFullFilledQuestionMarkIcon}
            />
            <Box
              sx={{
                marginRight: '4px',
              }}
            >
              {condition.network}
            </Box>
            <Box
              sx={{
                height: '14px',
                width: '1px',
                backgroundColor: '#FFFFFFBF',
                marginRight: '4px',
              }}
            />
            <CommonImage
              sx={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                marginRight: '4px',
                flexShrink: 0,
              }}
              src={condition.token_logo ? `${IMAGE_URL_PREFIX}${condition.token_logo}` : commonImageMap.commonFullFilledQuestionMarkIcon}
            />
            <Box
              sx={{
                marginRight: '4px',
              }}
            >
              {condition.symbol || condition.address}
            </Box>
            <Box
              sx={{
                height: '14px',
                width: '1px',
                backgroundColor: '#FFFFFFBF',
                marginRight: '4px',
              }}
            />
            <Box component="span" sx={{ flexShrink: 0 }}>
              {t('Min')}:
            </Box>
            <Box
              component="span"
              sx={{
                marginLeft: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre',
                maxWidth: '100px',
              }}
            >
              {condition.amount}
            </Box>
          </Box>
        ) : null
      }
      placement={placement}
      PopperProps={{
        sx: {
          [`& .${tooltipClasses.tooltip}`]: {
            maxWidth: 'unset !important',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            borderRadius: '12px',
            color: '#141414',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            padding: '0px',
          },
        },
      }}
    >
      <Box
        sx={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...sx,
        }}
      >
        <ConditionIcon
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    </Tooltip>
  )
}
export default observer(CommonConditionDisplay)
