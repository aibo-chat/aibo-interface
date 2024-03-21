import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Box, Button } from '@mui/material'
import { useIsomorphicLayoutEffect } from 'ahooks'
import lottie, { AnimationItem } from 'lottie-web'
import ContextMenu, { MenuItem } from '../../atoms/context-menu/ContextMenu'
import initMatrix from '../../../client/initMatrix'
import IconButton from '../../atoms/button/IconButton'
import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg'
import Text from '../../atoms/text/Text'
import SetPasswordModal from '../../components/SetPasswordModal'
import { useMobxStore } from '../../../stores/StoreProvider'
import clientLoadingImageMap from '../../../images/clientLoadingImageMap'
import RefreshIcon from '../../../../public/res/svg/common/common_outlined_refresh_icon.svg?react'
import DefedLogoJson from '../../../../public/res/json/defed_logo.json'

interface IClientLoadingProps {
  loadingMsg: string
}

const ClientLoading: React.FC<IClientLoadingProps> = ({ loadingMsg }) => {
  const {
    initData,
    targetProxy,
    appStore: { connectError, setConnectError },
  } = useMobxStore()
  const logoRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem>()
  useIsomorphicLayoutEffect(() => {
    if (connectError) {
      if (animationRef.current) {
        animationRef.current.hide()
      }
    } else {
      if (!animationRef.current) {
        if (!logoRef.current) return
        animationRef.current = lottie.loadAnimation({
          container: logoRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: DefedLogoJson,
        })
      } else {
        animationRef.current.show()
      }
    }
  }, [connectError])
  const onRetryButtonClick = async () => {
    setConnectError('')
    initData(targetProxy)
  }
  return (
    <div className="loading-display">
      <div className="loading__menu">
        <ContextMenu
          placement="bottom"
          content={
            (
              <>
                <MenuItem onClick={() => initMatrix.clearCacheAndReload()}>Clear cache & reload</MenuItem>
                <MenuItem onClick={() => initMatrix.logout()}>Logout</MenuItem>
              </>
            ) as any
          }
          /* @ts-ignore */
          render={(toggle) => <IconButton size="extra-small" onClick={toggle} src={VerticalMenuIC} />}
        />
      </div>
      <Box
        sx={{
          width: '859px',
          height: connectError ? 0 : '327px',
        }}
        ref={logoRef}
      />
      {connectError ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src={clientLoadingImageMap.retryImage}
            sx={{
              width: '320px',
              height: '320px',
              marginBottom: '50px',
            }}
          />
          <Button
            variant="contained"
            onClick={onRetryButtonClick}
            sx={{
              width: '188px',
              height: '58px',
              borderRadius: '10px',
              backgroundColor: '#4128D1',
              color: '#FFFFFF',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
            }}
          >
            Retry
            <RefreshIcon
              style={{
                width: '20px',
                height: '17px',
                fill: '#FFFFFF',
                marginLeft: '20px',
              }}
            />
          </Button>
        </Box>
      ) : null}
      {connectError ? (
        <Box
          sx={{
            color: 'red',
            fontSize: '14px',
            marginTop: '16px',
          }}
        >
          {connectError}
        </Box>
      ) : (
        <Text className="loading__message" variant="b2">
          {loadingMsg}
        </Text>
      )}
      <SetPasswordModal />
    </div>
  )
}
export default observer(ClientLoading)
