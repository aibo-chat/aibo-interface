import React, { useMemo } from 'react'
import './Avatar.scss'

import { Box, SxProps, Theme } from '@mui/material'
import multiAvatar from '@multiavatar/multiavatar/esm'
import { twemojify } from '../../../util/twemojify'

import Text from '../text/Text'
import RawIcon from '../system-icons/RawIcon'

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg'
import { avatarInitials, substitutionStringForMatrixId } from '../../../util/common'
import { toDataURI } from '../../utils/common'

interface IAvatarProps {
  text?: string
  bgColor?: string
  iconSrc?: string
  iconColor?: string
  imageSrc?: string | null
  size?: 'large' | 'normal' | 'small' | 'extra-small'
  sx?: SxProps<Theme>
  userId?: string
}
const Avatar = React.forwardRef<any, IAvatarProps>(({ text, userId, bgColor = 'transparent', iconSrc, iconColor, imageSrc, size = 'normal', sx }, ref) => {
  let textSize: 's1' | 'h1' | 'b1' | 'b3' | 'h2' | 'b2' = 's1'
  if (size === 'large') textSize = 'h1'
  if (size === 'small') textSize = 'b1'
  if (size === 'extra-small') textSize = 'b3'

  const finalImageSrc = useMemo(() => {
    if (imageSrc) {
      return imageSrc
    }
    if (userId) {
      const regex = /(?<=@)([^:]*)(?=:)/gm
      if (regex.test(userId)) {
        return toDataURI(multiAvatar(substitutionStringForMatrixId(userId.toLowerCase(), 30, 30, '')))
      }
    }
    if (text) {
      const regex = /(?<=@)([^:]*)(?=:)/gm
      if (regex.test(text)) {
        return toDataURI(multiAvatar(substitutionStringForMatrixId(text.toLowerCase(), 30, 30, '')))
      }
    }
  }, [imageSrc, text, userId])
  return (
    <Box ref={ref} className={`avatar-container avatar-container__${size} noselect`} sx={sx}>
      {finalImageSrc ? (
        <img
          draggable="false"
          src={finalImageSrc}
          onLoad={(e) => {
            ;(e.target as HTMLImageElement).style.backgroundColor = 'transparent'
          }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = ImageBrokenSVG
          }}
          alt=""
        />
      ) : (
        <span style={{ backgroundColor: !iconSrc ? bgColor : 'transparent' }} className={`avatar__border${iconSrc ? '--active' : ''}`}>
          {iconSrc ? (
            <RawIcon size={size} src={iconSrc} color={iconColor} />
          ) : (
            text && (
              <Text variant={textSize} primary>
                {twemojify(avatarInitials(text), undefined, false, true)}
              </Text>
            )
          )}
        </span>
      )}
    </Box>
  )
})

export default Avatar
