import React, { useEffect } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMobxStore } from '../../../stores/StoreProvider'

interface ICommonAvatarProps {
  imageUrl?: string
  proxy: string
  sx?: SxProps<Theme>
  showDetail?: boolean
}

const CommonAvatar: React.FC<ICommonAvatarProps> = (props) => {
  const { imageUrl, proxy, sx, showDetail } = props
  // ObservableCount is used to trigger refresh for avatarProxyMap
  const {
    userInfoStore: { getUserInfoWithProxy, updateUserInfoWithProxy, observableCount },
  } = useMobxStore()
  const finalImageUrl = (() => {
    if (imageUrl) {
      return imageUrl
    }
    if (proxy) {
      return getUserInfoWithProxy(proxy)?.avatarLink
    }
    return ''
  })()

  useEffect(() => {
    if (proxy) {
      if (imageUrl) {
        updateUserInfoWithProxy(proxy, { avatarLink: imageUrl })
      } else {
        updateUserInfoWithProxy(proxy)
      }
    }
  }, [proxy, imageUrl])
  return <Box component="img" src={finalImageUrl} sx={{ cursor: showDetail ? 'pointer' : 'unset', ...sx }} />
}
export default observer(CommonAvatar)
