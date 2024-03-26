import React, { useRef } from 'react'
import './Welcome.scss'

import { observer } from 'mobx-react-lite'
import { Box } from '@mui/material'
import lottie, { AnimationItem } from 'lottie-web'
import { useIsomorphicLayoutEffect } from 'ahooks'
import Text from '../../atoms/text/Text'
import SetPasswordModal from '../../components/SetPasswordModal'
import { ComputedAiboJson } from '../../../util/jsonComputed'

function Welcome() {
  const logoRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem>()
  useIsomorphicLayoutEffect(() => {
    if (!animationRef.current) {
      if (!logoRef.current) return
      animationRef.current = lottie.loadAnimation({
        container: logoRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: ComputedAiboJson,
      })
    } else {
      animationRef.current.show()
    }
  }, [])
  return (
    <div className="loading-display">
      <Box
        sx={{
          width: '300px',
          height: '300px',
        }}
        ref={logoRef}
      />
      <Text className="loading__message" variant="b2">
        Loading ...
      </Text>
      <SetPasswordModal />
    </div>
  )
}

export default observer(Welcome)
