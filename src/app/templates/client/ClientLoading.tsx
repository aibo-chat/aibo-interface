import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Box, Button } from '@mui/material'
import { useIsomorphicLayoutEffect } from 'ahooks'
import lottie, { AnimationItem } from 'lottie-web'
import Text from '../../atoms/text/Text'
import SetPasswordModal from '../../components/SetPasswordModal'
import { useMobxStore } from '../../../stores/StoreProvider'
import clientLoadingImageMap from '../../../images/clientLoadingImageMap'
import RefreshIcon from '../../../../public/res/svg/common/common_outlined_refresh_icon.svg?react'
import AiboJSON from '../../../../public/res/json/aibo.json'

const ClientLoading: React.FC = () => {
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
          animationData: AiboJSON,
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
      <Box
        sx={{
          width: '300px',
          height: connectError ? 0 : '300px',
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
          Loading ...
        </Text>
      )}
      <SetPasswordModal />
    </div>
  )
}
export default observer(ClientLoading)
