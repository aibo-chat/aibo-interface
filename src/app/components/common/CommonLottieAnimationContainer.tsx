import React, { useRef } from 'react'
import Lottie, { AnimationItem } from 'lottie-web'
import { useIsomorphicLayoutEffect, usePrevious } from 'ahooks'
import { Box } from '@mui/material'

interface ICommonLottieAnimationContainerProps {
  animationJson: any
  flag: 0 | 1
  width?: string
  height?: string
}

const CommonLottieAnimationContainer: React.FC<ICommonLottieAnimationContainerProps> = ({ animationJson, flag, width = '32px', height = '32px' }) => {
  const animationRef = useRef<AnimationItem>()
  const iconRef = useRef<HTMLDivElement>()
  const previousFlag = usePrevious(flag)
  useIsomorphicLayoutEffect(() => {
    if (flag !== undefined && previousFlag !== undefined && flag !== previousFlag) {
      if (flag) {
        if (!animationRef.current) {
          if (!iconRef.current) return
          animationRef.current = Lottie.loadAnimation({
            container: iconRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: animationJson,
          })
          animationRef.current?.addEventListener('complete', () => {
            console.log('complete')
            animationRef.current?.hide()
          })
        } else {
          animationRef.current.show()
          animationRef.current.goToAndPlay(0)
        }
      } else {
        if (animationRef.current) {
          animationRef.current.hide()
        }
      }
    }
  }, [previousFlag, flag])
  return (
    <Box
      sx={{
        position: 'absolute',
        width,
        height,
        zIndex: 1,
      }}
      ref={iconRef}
    />
  )
}
export default CommonLottieAnimationContainer
