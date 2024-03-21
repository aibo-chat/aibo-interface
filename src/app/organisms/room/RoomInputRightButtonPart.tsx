import { observer } from 'mobx-react-lite'
import React, { MouseEventHandler, useCallback, useMemo, useState } from 'react'
import { Icon, IconButton, Icons, PopOut } from 'folds'
import { ReactEditor } from 'slate-react'
import { Room } from 'matrix-js-sdk'
import { Box, CircularProgress, Menu, MenuItem, ButtonBase } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { AxiosResponse } from 'axios'
import { UseStateProvider } from '../../components/UseStateProvider'
import { EmojiBoard, EmojiBoardTab } from '../../components/emoji-board'
import { mobileOrTablet } from '../../utils/user-agent'
import { useMobxStore } from '../../../stores/StoreProvider'
import { request } from '../../../api/request'
import defedApi, { IPermissionResult, IResponseType } from '../../../api/defed-api'
import imageMap from '../../../images/imageMap'
import PluginIcon from '../../../../public/res/svg/common/common_fullfilled_plugin_icon.svg?react'

interface IRoomInputRightButtonPartProps {
  toolbar: boolean
  setToolbar: (update: boolean | ((s: boolean) => boolean)) => void
  imagePackRooms: Array<Room>
  handleEmoticonSelect: (unicode: string, shortcode: string) => void
  handleStickerSelect: (mxc: string, shortcode: string, label: string) => void
  editor: ReactEditor
  hideStickerBtn: boolean
  submit: MouseEventHandler<HTMLButtonElement>
  currentRoom: Room
}

const RoomInputRightButtonPart: React.FC<IRoomInputRightButtonPartProps> = ({
  toolbar,
  setToolbar,
  imagePackRooms,
  handleEmoticonSelect,
  handleStickerSelect,
  editor,
  hideStickerBtn,
  submit,
  currentRoom,
}) => {
  const { t } = useTranslation()
  const {
    renderStore: { _ROOM_LIST_UPDATED },
    appStore: { userAccount },
    aiStore: { botConfigInitiating, botUserIdToRoomId },
    userAssetStore: { userAsset },
    modalStore: { changeTransferModalVisible, changeTransferModalTargetProxy, setPermissionResult },
    userRelationshipStore: { roomIdToProxyMap },
  } = useMobxStore()
  const { enqueueSnackbar } = useSnackbar()
  const targetProxy = currentRoom?.roomId ? roomIdToProxyMap.get(currentRoom.roomId) : ''
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [cryptoBoxButtonLoading, setCryptoBoxButtonLoading] = useState(false)
  const moreMenuOpen = useMemo(() => Boolean(moreMenuAnchorEl), [moreMenuAnchorEl])
  const isCurrentRoomBotRoom = useMemo(() => {
    if (botUserIdToRoomId?.length) {
      return Boolean(botUserIdToRoomId.find((item) => item.roomId === currentRoom.roomId))
    }
    return false
  }, [botUserIdToRoomId, currentRoom.roomId])

  const onIconButtonClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreMenuAnchorEl(event.currentTarget)
  }, [])
  const handleClose = () => {
    setMoreMenuAnchorEl(null)
  }
  const onSendCryptoBoxButtonClick = async () => {
    if (!userAccount?.proxyAddress || !targetProxy) return
    setCryptoBoxButtonLoading(true)
    try {
      if (Number.isNaN(Number(userAsset?.usdValue))) {
        setCryptoBoxButtonLoading(false)
        enqueueSnackbar(t('Wrong Network'), { variant: 'error' })
        return
      }
      const permissionResult: AxiosResponse<IResponseType<IPermissionResult>> = await request.get(defedApi.getPermissionForRedEnvelope, {
        params: { sender: userAccount.proxyAddress, receiver: targetProxy },
      })
      if (!permissionResult?.data?.data) {
        return
      }
      if (Number.isNaN(Number(permissionResult.data.data.defedBalanceLimit))) {
        setCryptoBoxButtonLoading(false)
        enqueueSnackbar(t('Wrong Network'), { variant: 'error' })
        return
      }
      if (Number(userAsset?.usdValue) > permissionResult.data.data.defedBalanceLimit) {
        setCryptoBoxButtonLoading(false)
        setPermissionResult({
          ...permissionResult.data.data,
          targetProxy,
        })
        handleClose()
      } else {
        setCryptoBoxButtonLoading(false)
        enqueueSnackbar(t('Your balance should be greater than 0.'), { variant: 'error' })
      }
    } catch (e) {
      setCryptoBoxButtonLoading(false)
      console.log(e)
    }
  }

  return (
    <>
      <IconButton variant="SurfaceVariant" size="300" radii="300" onClick={() => setToolbar(!toolbar)}>
        <Icon src={toolbar ? Icons.AlphabetUnderline : Icons.Alphabet} />
      </IconButton>
      <UseStateProvider initial={undefined}>
        {(emojiBoardTab: EmojiBoardTab | undefined, setEmojiBoardTab) => (
          <PopOut
            offset={16}
            alignOffset={-44}
            position="Top"
            align="End"
            open={!!emojiBoardTab}
            content={
              <EmojiBoard
                tab={emojiBoardTab}
                onTabChange={setEmojiBoardTab}
                imagePackRooms={imagePackRooms}
                returnFocusOnDeactivate={false}
                onEmojiSelect={handleEmoticonSelect}
                onCustomEmojiSelect={handleEmoticonSelect}
                onStickerSelect={handleStickerSelect}
                requestClose={() => {
                  setEmojiBoardTab(undefined)
                  if (!mobileOrTablet()) ReactEditor.focus(editor)
                }}
              />
            }
          >
            {(anchorRef) => (
              <>
                {!hideStickerBtn && (
                  <IconButton aria-pressed={emojiBoardTab === EmojiBoardTab.Sticker} onClick={() => setEmojiBoardTab(EmojiBoardTab.Sticker)} variant="SurfaceVariant" size="300" radii="300">
                    <Icon src={Icons.Sticker} filled={emojiBoardTab === EmojiBoardTab.Sticker} />
                  </IconButton>
                )}
                <IconButton
                  ref={anchorRef}
                  aria-pressed={hideStickerBtn ? !!emojiBoardTab : emojiBoardTab === EmojiBoardTab.Emoji}
                  onClick={() => setEmojiBoardTab(EmojiBoardTab.Emoji)}
                  variant="SurfaceVariant"
                  size="300"
                  radii="300"
                >
                  <Icon src={Icons.Smile} filled={hideStickerBtn ? !!emojiBoardTab : emojiBoardTab === EmojiBoardTab.Emoji} />
                </IconButton>
              </>
            )}
          </PopOut>
        )}
      </UseStateProvider>
      {targetProxy && !botConfigInitiating && !isCurrentRoomBotRoom ? (
        <ButtonBase
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#E5E5E5',
            },
          }}
          onClick={onIconButtonClick}
        >
          <PluginIcon
            style={{
              width: '24px',
              height: '24px',
            }}
          />
        </ButtonBase>
      ) : null}
      <Menu
        id="room-input-more-menu"
        anchorEl={moreMenuAnchorEl}
        open={moreMenuOpen}
        onClose={handleClose}
        MenuListProps={{}}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={onSendCryptoBoxButtonClick} disabled={cryptoBoxButtonLoading}>
          <Box
            component="img"
            src={imageMap.cryptoBox.messageGiftButton}
            sx={{
              width: { lg: '24px', xs: '24px' },
              height: { lg: '24px', xs: '24px' },
              marginRight: '6px',
            }}
          />
          {t('Crypto-Box')}
          {cryptoBoxButtonLoading ? (
            <CircularProgress
              size="20px"
              thickness={4}
              sx={{
                marginLeft: '16px',
                '& .MuiCircularProgress-svg': {
                  color: '#62A1FF',
                },
              }}
            />
          ) : null}
        </MenuItem>
        <MenuItem
          onClick={() => {
            changeTransferModalTargetProxy({
              proxy: targetProxy,
              roomId: currentRoom.roomId,
            })
            changeTransferModalVisible(true)
            handleClose()
          }}
        >
          <Box
            component="img"
            src={imageMap.transfer.messageTransferButton}
            sx={{
              width: { lg: '24px', xs: '24px' },
              height: { lg: '24px', xs: '24px' },
              marginRight: '6px',
            }}
          />
          {t('Transfer')}
        </MenuItem>
      </Menu>
      <IconButton onClick={submit} variant="SurfaceVariant" size="300" radii="300">
        <Icon src={Icons.Send} />
      </IconButton>
    </>
  )
}
export default observer(RoomInputRightButtonPart)
