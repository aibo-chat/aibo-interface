import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Box, ButtonBase } from '@mui/material'
import { useIsomorphicLayoutEffect } from 'ahooks'
import { gsap } from 'gsap'
import { useMobxStore } from '../../stores/StoreProvider'
import CloseIcon from '../../../public/res/svg/common/common_outline_close_icon_without_circle.svg?react'
import RefreshIcon from '../../../public/res/svg/common/common_outlined_refresh_icon.svg?react'

const IframeApp: React.FC = () => {
  const {
    modalStore: { iframeAppData, changeIframeAppData, iframeAppDisplay, removeAppShortCut },
  } = useMobxStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(containerRef.current, { x: '100%', opacity: 1 })
      gsap.to(containerRef.current, { x: 0, duration: 0.5, ease: 'power2.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])
  useIsomorphicLayoutEffect(() => {
    if (iframeAppData?.url && iframeRef.current) {
      iframeRef.current.src = iframeAppData.url
    }
  }, [iframeAppData?.url])
  const handleRefreshButtonClick = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src
      if (!currentSrc) return
      const url = new URL(currentSrc)
      url.searchParams.set('refresh', Date.now().toString())
      iframeRef.current.src = url.toString()
    }
  }
  const handleCloseButtonClick = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          changeIframeAppData(undefined)
          removeAppShortCut(iframeAppData)
        },
      })
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: iframeAppDisplay ? 1000 : -1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFF',
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '16px 12px',
          backgroundColor: '#F6F6F6',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <ButtonBase
          sx={{
            width: '24px',
            height: '24px',
          }}
          onClick={handleRefreshButtonClick}
        >
          <RefreshIcon
            style={{
              width: '16px',
              height: '16px',
              fill: '#626262',
            }}
          />
        </ButtonBase>
        <ButtonBase onClick={handleCloseButtonClick}>
          <CloseIcon
            style={{
              width: '24px',
              height: '24px',
              fill: '#626262',
            }}
          />
        </ButtonBase>
      </Box>
      <Box
        ref={iframeRef}
        component="iframe"
        sx={{
          flex: 1,
          overflow: 'hidden',
          width: '100%',
          border: 'none',
        }}
      />
    </Box>
  )
}
export default observer(IframeApp)
