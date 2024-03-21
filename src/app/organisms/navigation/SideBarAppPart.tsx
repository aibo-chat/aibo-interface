import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box } from '@mui/material'
import { useMobxStore } from '../../../stores/StoreProvider'
import CloseIcon from '../../../../public/res/svg/common/common_outline_close_icon_without_circle.svg?react'
import { IframeAppData } from '../../../stores/modal-store'

const SideBarAppPart: React.FC = () => {
  const {
    modalStore: { appShortCutArray, removeAppShortCut, changeIframeAppData, iframeAppData },
  } = useMobxStore()
  const onShortCutClick = (app: IframeAppData) => {
    changeIframeAppData(app)
  }
  const onCloseButtonClick = (app: IframeAppData) => {
    if (app?.key && app.key === iframeAppData?.key) {
      changeIframeAppData(undefined)
    }
    removeAppShortCut(app)
  }
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {appShortCutArray.map((app, index) => (
        <Box
          sx={{
            width: '42px',
            height: '42px',
            marginBottom: index === appShortCutArray.length - 1 ? 0 : '8px',
            borderRadius: '100px',
            transition: 'transform 200ms linear',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              transform: 'translateX(6px)',
            },
          }}
        >
          <Box
            component="img"
            src={app.icon}
            sx={{
              width: '100%',
              height: '100%',
            }}
            onClick={() => {
              onShortCutClick(app)
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: '-6px',
              top: '-6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => {
              onCloseButtonClick(app)
            }}
          >
            <CloseIcon
              style={{
                width: '12px',
                height: '12px',
                fill: '#676767',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  )
}
export default observer(SideBarAppPart)
