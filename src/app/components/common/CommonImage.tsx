import { observer } from 'mobx-react-lite'
import React, { ReactEventHandler, useRef } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

interface ICommonImageProps {
  src: string
  sx?: SxProps<Theme>
  errorImage?: string
}

const CommonImage: React.FC<ICommonImageProps> = ({ src, sx, errorImage }) => {
  const errorInitDone = useRef(false)
  const handleError: ReactEventHandler<HTMLImageElement> = async (event) => {
    const eventTarget = event.target as HTMLImageElement
    if (eventTarget.src) {
      const targetSrc = eventTarget.src
      const xmlHttpRequest = new XMLHttpRequest()
      xmlHttpRequest.open('GET', targetSrc, false)
      xmlHttpRequest.send()
      const { responseText } = xmlHttpRequest
      if (!errorInitDone.current && /<svg/.test(responseText)) {
        errorInitDone.current = true
        eventTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(responseText)}`
      } else if (errorImage) {
        eventTarget.src = errorImage
      }
    }
  }
  return <Box crossOrigin="anonymous" component="img" src={src} sx={sx} onError={handleError} />
}
export default observer(CommonImage)
