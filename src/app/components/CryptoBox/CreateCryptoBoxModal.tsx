import React, { useEffect, useMemo, useState } from 'react'
import { Box, Modal, Fade, Button, IconButton, CircularProgress, Typography, useMediaQuery, useTheme, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { observer } from 'mobx-react-lite'
import { AxiosResponse } from 'axios'
import { Room } from 'matrix-js-sdk'
import { useMobxStore } from '../../../stores/StoreProvider'
import { request } from '../../../api/request'
import defedApi, { IResponseType } from '../../../api/defed-api'
import CloseIcon from '../../../../public/res/svg/common/common_outlined_close_icon.svg?react'
import { useUserInfoWithProxy } from '../../hooks/useUserInfoWithProxy'
import { DefedMsgType } from '../../../types/defed/message'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { CryptoBoxMessageContent } from '../message/CryptoBoxMessage'
import imageMap from '../../../images/imageMap'

export interface IPermissionResult {
  defedBalanceLimit: number
  hasBeenSent: boolean
  receiverClaimed: boolean
  senderClaimed: boolean
  toDaySendNum: number
  totalSendNum: number
}
interface ICreateCryptoBoxModalProps {
  room: Room
  isWrongNetwork?: boolean
}
const CreateCryptoBoxModal: React.FC<ICreateCryptoBoxModalProps> = (props) => {
  const { isWrongNetwork, room } = props
  const { t } = useTranslation()
  const { breakpoints } = useTheme()
  const matrixClient = useMatrixClient()
  const isMobile = useMediaQuery(breakpoints.down('xsm'))
  const { enqueueSnackbar } = useSnackbar()
  const {
    appStore: { userAccount },
    modalStore: { permissionResult, setPermissionResult },
  } = useMobxStore()
  const [userInfo] = useUserInfoWithProxy(permissionResult?.targetProxy || '')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSend, setIsSend] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [giftLoading, setGiftLoading] = useState(false)
  const [remainGiftTimes, setRemainGiftTimes] = useState(0)
  const onCloseModal = () => {
    setPermissionResult(null)
  }
  const handleSendCashGift = async () => {
    if (!userAccount?.proxyAddress || !permissionResult) {
      return
    }
    if (error) setError('')
    setGiftLoading(true)
    try {
      const params = {
        sender: userAccount.proxyAddress,
        receiver: permissionResult.targetProxy,
      }
      const recordEnvelopeResult: AxiosResponse<IResponseType<{ id: number }>> = await request.post(defedApi.postSaveSendRecordForRedEnvelope, params)
      if (recordEnvelopeResult?.data?.data?.id) {
        // save send redEnvelope record successfully
        setGiftLoading(false)
        enqueueSnackbar(t('You have sent a DEFED crypto box.'), { variant: 'success' })
        onCloseModal()
        const newMessageContent: CryptoBoxMessageContent = {
          receiverProxy: permissionResult.targetProxy,
          senderProxy: userAccount.proxyAddress,
          redEnvelopeId: recordEnvelopeResult.data.data.id,
          status: 0,
        }
        await matrixClient.sendMessage(room.roomId, { body: newMessageContent, msgtype: DefedMsgType.CryptoBox })
      } else if (recordEnvelopeResult?.data?.code !== 200 && recordEnvelopeResult?.data?.msg) {
        setGiftLoading(false)
        enqueueSnackbar(t(recordEnvelopeResult.data.msg), { variant: 'error' })
        onCloseModal()
      }
    } catch (error) {
      console.error(error)
      setGiftLoading(false)
      onCloseModal()
      if ((error as { code: number })?.code === 4001) {
        setError(t('Transaction rejected.'))
      } else {
        setError(t('System error'))
      }
    }
  }
  const giftActionParams = useMemo(() => {
    if (isWrongNetwork) return { disabled: true, content: t('Wrong Network') }
    if (!isSend || isLoading) return { disabled: true, content: t('Send') }
    return { disabled: false, content: t(`Send`) }
  }, [isWrongNetwork, t, isSend, isLoading])
  const init = async () => {
    try {
      try {
        if (permissionResult) {
          if (!permissionResult.receiverClaimed && permissionResult.toDaySendNum < permissionResult.totalSendNum) {
            // toDaySendNum 发送方今天已经发送的红包数
            setIsSend(true)
          } else {
            // change hasBeenSent limit logic, old logic is user can not send to friend if hasBeenSent is true, new logic delete this limt
            if (permissionResult.receiverClaimed) {
              setIsSend(false)
              setError(t('Receiver has claimed cash gift.'))
            }
            if (permissionResult.toDaySendNum >= permissionResult.totalSendNum) {
              setIsSend(false)
              setError(t('The number of cash gift sent exceeds the limit.'))
            }
          }
          if (permissionResult.toDaySendNum !== null) {
            setRemainGiftTimes(permissionResult.toDaySendNum)
          }
        } else {
          setIsSend(false)
          enqueueSnackbar(t('Load gift data failed.'), { variant: 'error' })
        }
      } catch (e) {
        enqueueSnackbar(t('Load gift data failed.'), { variant: 'error' })
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }
  useEffect(() => {
    init()
  }, [])
  return (
    <Modal
      open
      onClose={onCloseModal}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src={isMobile ? imageMap.cryptoBox.createCryptoBoxTopBgMobile : imageMap.cryptoBox.createCryptoBoxTopBg}
            sx={{
              width: { xs: '375px', xsm: '698px' },
              height: { xs: '135px', xsm: '247px' },
              position: 'absolute',
              zIndex: -1,
              top: { xs: '-120px', xsm: '-223px' },
            }}
          />
          <Box
            component="img"
            src={isMobile ? imageMap.cryptoBox.createCryptoBoxBottomBgMobile : imageMap.cryptoBox.createCryptoBoxBottomBg}
            sx={{
              width: { xs: '375px', xsm: '698px' },
              height: { xs: '160px', xsm: '350px' },
              position: 'absolute',
              zIndex: -1,
              top: { xs: '97px', xsm: '144px' },
            }}
          />
          <Box
            sx={{
              width: { xs: '242px', xsm: '390px' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: { xs: '13px', xsm: '22px' },
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            <IconButton
              sx={{
                borderRadius: '50%',
                p: 0,
                minWidth: 0,
                position: 'absolute',
                top: { xs: '16px', xsm: '22px' },
                right: { xs: '15px', xsm: '22px' },
              }}
              onClick={onCloseModal}
              data-cy="close-button"
            >
              <CloseIcon
                style={{
                  width: '20px',
                  height: '20px',
                  fill: '#DDD',
                }}
              />
            </IconButton>
            <Box
              sx={{
                color: '#141416',
                fontSize: { xs: '16px', xsm: '22px' },
                fontWeight: 600,
                marginBottom: { xs: '9px', xsm: '15px' },
              }}
            >
              {t('Send crypto box')}
            </Box>
            <Box
              sx={{
                color: '#777E91',
                fontSize: { xs: '8px', xsm: '13px' },
                fontWeight: 500,
                marginBottom: { xs: '9px', xsm: '15px' },
              }}
            >
              {t('Send a cash gift and go fifty-fifty with your friends!')}
            </Box>
            <Box
              sx={{
                width: '100%',
                height: { xs: '51px', xsm: '80px' },
                display: 'flex',
                alignItems: 'center',
                borderRadius: { xs: '5px', xsm: '10px' },
                padding: { xs: `${'5px'} ${'8px'}`, xsm: `${'20px'} ${'14px'}` },
                border: '1px solid #B1B5C3',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  marginRight: '4px',
                }}
              >
                {userInfo?.handleName && userInfo.handleName !== permissionResult?.targetProxy ? (
                  <Box
                    sx={{
                      color: '#1E3246',
                      fontSize: { xs: '10px', xsm: '13px' },
                      fontWeight: 600,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {userInfo.handleName}
                  </Box>
                ) : null}
                <Box
                  sx={{
                    color: '#777E91',
                    fontSize: { xs: '8px', xsm: '11px' },
                    fontWeight: 500,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {permissionResult?.targetProxy}
                </Box>
              </Box>
              {isLoading ? (
                <CircularProgress
                  sx={{
                    flexShrink: 0,
                  }}
                  color="inherit"
                  size={isMobile ? '16px' : '20px'}
                />
              ) : isSend ? (
                <Box
                  component="img"
                  src={imageMap.cryptoBox.reloadingSuccess}
                  alt="success"
                  sx={{
                    flexShrink: 0,
                    height: {
                      xs: '16px',
                      xsm: '20px',
                    },
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={imageMap.cryptoBox.reloadingFail}
                  alt="fail"
                  sx={{
                    flexShrink: 0,
                    height: {
                      xs: '16px',
                      xsm: '20px',
                    },
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'left',
                justifyContent: 'center',
                minHeight: {
                  xs: '11px',
                  xsm: '20px',
                },
              }}
            >
              {isWrongNetwork
                ? null
                : error &&
                  !isLoading && (
                    <Typography variant="description" sx={{ color: '#FF3B30', pl: 0 }}>
                      {error}
                    </Typography>
                  )}
            </Box>
            <Box sx={{ width: '100%', marginTop: { xs: '2px', xsm: '2px' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Button
                variant="surface"
                sx={{
                  width: '100%',
                  height: { xs: '32px', xsm: '44px' },
                  background: 'linear-gradient(274deg, #1178E9 8.13%, #16E0F6 95.79%)',
                  marginBottom: {
                    xs: '9px',
                    xsm: '16px',
                  },
                }}
                size="large"
                disabled={giftActionParams.disabled || giftLoading}
                onClick={handleSendCashGift}
              >
                {giftLoading && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
                {giftActionParams.content}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4685FF' }}>
                <Box sx={{ mr: '4.5px', fontWeight: 500, fontSize: { xs: '8px', xsm: '11px' } }}>{t('Daily limit:')}</Box>
                {isLoading ? (
                  <CircularProgress color="inherit" size="14px" />
                ) : (
                  <>
                    <Box sx={{ fontSize: { xs: '10px', xsm: '13px' }, fontWeight: 400 }}>{remainGiftTimes}</Box>
                    <Box sx={{ fontSize: { xs: '10px', xsm: '13px' }, fontWeight: 400 }}>{`/${permissionResult?.totalSendNum}`}</Box>
                  </>
                )}
                <Box
                  sx={{
                    marginLeft: { xs: '2.5px', xsm: '4.5px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tooltip placement="top" title={t('Refreshed at 00:00 am (UTC)')}>
                    <Box component="img" src={imageMap.cryptoBox.tooltipBlue} alt="" sx={{ width: '16px', height: '16px' }} />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(CreateCryptoBoxModal)
