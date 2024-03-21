import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Fade, Modal, SxProps, Theme } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { EventTimelineSet, IContent, MatrixEvent, MsgType, RelationType } from 'matrix-js-sdk'
import { AxiosResponse } from 'axios'
import { TransferDetailDisplayStatus, TransferMessageContent, TransferStatus } from '../message/TransferMessage'
import { useMobxStore } from '../../../stores/StoreProvider'
import defedApi, { IGetTransferInMessageResultResponse, IResponseType } from '../../../api/defed-api'
import { request } from '../../../api/request'
import { substitutionString } from '../../../util/common'
import { DefedMsgType } from '../../../types/defed/message'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { useMessageContent } from '../../hooks/useMessageContent'
import CommonConfirmModal from '../common/CommonConfirmModal'
import imageMap from '../../../images/imageMap'

interface ITransferDetailModalProps {
  matrixData: { mEvent: MatrixEvent; mEventId: string; timelineSet: EventTimelineSet }
}
const TransferStatusIcon = [
  imageMap.transfer.transferStatusWait,
  imageMap.transfer.transferStatusProcessing,
  imageMap.transfer.transferStatusSuccess,
  imageMap.transfer.transferStatusFailure,
  imageMap.transfer.transferStatusRefund,
  imageMap.transfer.transferStatusCancel,
]
interface ITransferTimeItemProps {
  title: string
  time?: number
  containerSx?: SxProps<Theme>
}
const TextButton: React.FC<any> = (props) => {
  const { children, sx, ...otherProps } = props
  return (
    <Box
      component="span"
      sx={{
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
        ...(sx || {}),
      }}
      {...otherProps}
    >
      {children}
    </Box>
  )
}
const TransferTimeItem: React.FC<ITransferTimeItemProps> = (props) => {
  const { time, title, containerSx } = props
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '28px',
        fontSize: { xs: '12px', xsm: '14px' },
        marginBottom: '8px',
        ...(containerSx || {}),
      }}
    >
      <Box sx={{ color: '#78828C' }}>{title}</Box>
      {time ? <Box sx={{ color: '#323C46' }}>{dayjs(time).format('YYYY/MM/DD, HH:mm:ss')}</Box> : null}
    </Box>
  )
}
const PollingInterval = 10 * 1000
const TransferDetailModal: React.FC<ITransferDetailModalProps> = ({ matrixData }) => {
  const { mEventId, mEvent, timelineSet } = matrixData
  const mx = useMatrixClient()
  const {
    appStore: { userAccount },
    modalStore: { changeTransferDetailModalTargetMatrixData },
  } = useMobxStore()
  const [transferContent] = useMessageContent<TransferMessageContent>(mEventId, mEvent, timelineSet)
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [buttonLoading, setButtonLoading] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const isTransferExpired = useMemo(() => {
    if (transferContent) {
      const currentDate = dayjs().valueOf()
      if (currentDate > transferContent.deadline) {
        return true
      }
    }
    return false
  }, [transferContent])
  const amountStr = useMemo(() => {
    const { realAmount, decimals } = transferContent
    if (!realAmount) return '0'
    const divideAmount = 10 ** (decimals || 18)
    return new BigNumber(realAmount).div(divideAmount).toFixed(4, 1)
  }, [transferContent])
  const isUserSender = useMemo(() => mEvent.getSender() === mx.getUserId(), [mEvent, mx])
  const isUserReceiver = useMemo(() => userAccount?.proxyAddress === transferContent.toAddress, [transferContent.toAddress, userAccount?.proxyAddress])
  const currentStatus = useMemo<TransferDetailDisplayStatus>(() => {
    if (transferContent) {
      switch (transferContent.status) {
        case TransferStatus.CANCEL:
          return TransferDetailDisplayStatus.CANCEL
        case TransferStatus.WAIT:
          return TransferDetailDisplayStatus.WAIT
        case TransferStatus.SUCCESS:
          return TransferDetailDisplayStatus.SUCCESS
        case TransferStatus.FAILURE:
          return TransferDetailDisplayStatus.FAILURE
        case TransferStatus.REFUND:
          return TransferDetailDisplayStatus.REFUND
        case TransferStatus.INIT:
        case TransferStatus.PROCESSING:
        case TransferStatus.SIGN_SUCCESS:
        case TransferStatus.WAIT_CONFIRMATION:
          return TransferDetailDisplayStatus.PROCESSING
        default:
          return TransferDetailDisplayStatus.WAIT
      }
    } else {
      return TransferDetailDisplayStatus.WAIT
    }
  }, [transferContent])
  const pollingTimer = useRef<ReturnType<typeof setInterval>>()
  const updateData = async () => {
    try {
      const result: AxiosResponse<IResponseType<IGetTransferInMessageResultResponse>> = await request.get(defedApi.getTransferInMessageResult, {
        params: {
          id: transferContent.id,
        },
      })
      if (result?.data?.code && result.data.code !== 200) {
        if (result.data?.msg) {
          enqueueSnackbar(result.data.msg, { variant: 'error' })
        }
      } else {
        if (result?.data?.data) {
          const fetchData = result.data.data
          const roomId = mEvent.getRoomId()
          if (fetchData.id && roomId) {
            let newStatus = fetchData.status
            if (transferContent.status === TransferStatus.REFUND) {
              newStatus = TransferStatus.REFUND
            } else {
              if (fetchData.status === TransferStatus.WAIT) {
                const currentDate = dayjs().valueOf()
                const isCurrentDateExpired = currentDate >= fetchData.deadline
                if (isCurrentDateExpired) {
                  newStatus = TransferStatus.REFUND
                }
              }
            }
            const newTransferContent = {
              ...transferContent,
              ...fetchData,
              status: newStatus,
            }
            if (newTransferContent.status !== transferContent.status) {
              if (newTransferContent.status === TransferStatus.SUCCESS) {
                cancelPolling()
              }
              updateMessage(roomId, newTransferContent)
            }
          }
        } else {
          // The request result does not report an error, but the return value is still null. At this time, there is a problem in the database. You need to set the message to the error status
          cancelPolling()
          const newTransferContent: TransferMessageContent = {
            ...transferContent,
            status: TransferStatus.FAILURE,
          }
          const roomId = mEvent.getRoomId()
          if (newTransferContent.status !== transferContent.status && roomId) {
            updateMessage(roomId, newTransferContent)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
  const startPolling = () => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current)
    }
    pollingTimer.current = setInterval(() => {
      updateData()
    }, PollingInterval)
  }
  const cancelPolling = () => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current)
      pollingTimer.current = undefined
    }
  }
  useEffect(() => {
    if (currentStatus === TransferDetailDisplayStatus.PROCESSING) {
      startPolling()
    } else {
      cancelPolling()
    }
    return () => {
      cancelPolling()
    }
  }, [currentStatus])
  const renderTransferMessage = useCallback(() => {
    if (!transferContent) return null
    let messageContent = null
    switch (currentStatus) {
      case TransferDetailDisplayStatus.CANCEL:
        messageContent = t('The transfer has been canceled.')
        break
      case TransferDetailDisplayStatus.FAILURE:
        messageContent = t('The transfer has been failed on blockchain.')
        break
      case TransferDetailDisplayStatus.PROCESSING:
        messageContent = t('The transfer is waiting for confirmation on blockchain.')
        break
      case TransferDetailDisplayStatus.REFUND:
        if (isUserReceiver) {
          messageContent = t('Rejected')
        } else {
          messageContent = (
            <>
              <Box component="span" sx={{ color: '#FF962B', marginRight: '4px' }}>
                {substitutionString(transferContent.toAddress, 5, 5, '.')}
              </Box>
              {t('Rejected. The rejection will be confirmed on blockchain in 1 day.')}
            </>
          )
        }
        break
      case TransferDetailDisplayStatus.SUCCESS:
        if (isUserReceiver) {
          messageContent = t('You’ve accepted the transfer. The cryptos has been deposited to your DEFED balance.')
        } else {
          messageContent = (
            <>
              <Box component="span" sx={{ color: '#FF962B', marginRight: '4px' }}>
                {substitutionString(transferContent.toAddress, 5, 5, '.')}
              </Box>
              {t('Received')}
            </>
          )
        }
        break
      case TransferDetailDisplayStatus.WAIT:
        if (isUserReceiver) {
          messageContent = (
            <>
              {t('Awaiting receipt by')}
              <Box component="span" sx={{ color: '#FF962B', marginLeft: '4px' }}>
                {t('You')}
              </Box>
            </>
          )
        } else {
          messageContent = (
            <>
              {t('Awaiting receipt by')}
              <Box component="span" sx={{ color: '#FF962B', marginLeft: '4px' }}>
                {substitutionString(transferContent.toAddress, 5, 5, '.')}
              </Box>
            </>
          )
        }
        break
      default:
        break
    }
    return (
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          fontSize: { xs: '12px', xsm: '14px' },
          color: '#141414',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          marginBottom: '24px',
        }}
      >
        {messageContent}
      </Box>
    )
  }, [currentStatus, isUserReceiver, t, transferContent])
  const onCloseModal: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void = () => {
    changeTransferDetailModalTargetMatrixData(null)
  }
  const updateMessage = (roomId: string, newContent: TransferMessageContent) => {
    const content: IContent = {
      msgtype: DefedMsgType.Transfer,
      body: newContent,
      'm.new_content': {
        msgtype: DefedMsgType.Transfer,
        body: newContent,
      },
      'm.relates_to': {
        event_id: mEvent.getId(),
        rel_type: RelationType.Replace,
      },
    }

    mx.sendMessage(roomId, content).catch((e) => {
      console.error(e)
    })
  }
  const onTextButtonClick = async () => {
    const roomId = mEvent.getRoomId()
    if (!roomId) return
    if (isUserReceiver) {
      if (transferContent) {
        const newContent: TransferMessageContent = {
          ...transferContent,
          status: TransferStatus.REFUND,
          rejectDate: dayjs().valueOf(),
        }
        updateMessage(roomId, newContent)
      }
    } else {
      mx.sendMessage(roomId, { body: t('There is a transfer waiting for you to receive.'), msgtype: MsgType.Text })
    }
    onCloseModal({}, 'backdropClick')
  }
  const handleUserCancelTransfer = async () => {
    setConfirmModalOpen(false)
    // Deal with user cancel part
    if (currentStatus === TransferDetailDisplayStatus.WAIT && isUserSender) {
      setButtonLoading(true)
      try {
        const result: AxiosResponse<IResponseType<IGetTransferInMessageResultResponse>> = await request.post(defedApi.postCancelTransferMsg, { id: transferContent.id })
        const roomId = mEvent.getRoomId()
        if (roomId && result?.data?.data?.id) {
          const newTransferContent = {
            ...transferContent,
            ...result.data.data,
          }
          if (newTransferContent.status !== transferContent.status) {
            updateMessage(roomId, newTransferContent)
          }
        }
      } catch (e) {
        console.error(e)
      }
      setButtonLoading(false)
    }
    onCloseModal({}, 'backdropClick')
  }
  const onActionButtonClick = async () => {
    // Deal with user accept part
    if (currentStatus === TransferDetailDisplayStatus.WAIT && isUserReceiver) {
      setButtonLoading(true)
      try {
        const result: AxiosResponse<IResponseType<IGetTransferInMessageResultResponse>> = await request.post(defedApi.postReceiveTransferMsg, { id: transferContent.id })
        const roomId = mEvent.getRoomId()
        if (roomId && result?.data?.data?.id) {
          const newTransferContent = {
            ...transferContent,
            ...result.data.data,
          }
          if (newTransferContent.status !== transferContent.status) {
            updateMessage(roomId, newTransferContent)
          }
        }
      } catch (e) {
        console.error(e)
      }
      setButtonLoading(false)
    }
    onCloseModal({}, 'backdropClick')
  }
  useEffect(() => {
    if (mEvent) {
      updateData()
    }
  }, [])
  return (
    <Modal
      open
      BackdropProps={{
        timeout: 500,
      }}
      onClose={onCloseModal}
      closeAfterTransition
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
            width: { xs: '343px', xsm: '448px' },
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: { xs: `${'24px'} ${'16px'}`, xsm: '32px' },
          }}
        >
          {transferContent ? (
            <>
              {currentStatus === TransferDetailDisplayStatus.PROCESSING ? (
                <CircularProgress
                  size="56px"
                  sx={{
                    '& .MuiCircularProgress-svg': {
                      color: '#00D0B7',
                    },
                    marginBottom: '31px',
                  }}
                  color="inherit"
                />
              ) : (
                <Box component="img" sx={{ width: { xs: '54px', xsm: '68px' }, height: { xs: '54px', xsm: '68px' }, marginBottom: '24px' }} src={TransferStatusIcon[currentStatus]} />
              )}
              {renderTransferMessage()}
              <Box sx={{ fontSize: { xs: '32px', xsm: '40px' }, fontWeight: 500, color: '#141414', marginBottom: '24px' }}>
                <Box
                  component="span"
                  sx={{
                    marginRight: '4px',
                  }}
                >
                  {amountStr}
                </Box>
                <Box component="span">{transferContent.symbol}</Box>
              </Box>
              {currentStatus === TransferDetailDisplayStatus.WAIT ? (
                <Box
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    color: '#141414',
                    fontSize: '14px',
                    marginBottom: '24px',
                  }}
                >
                  {isUserReceiver
                    ? t('The cryptos will be refunded to other user if not accepted within 1 day.')
                    : t('The transfer will be auto-rejected if it’s not accepted by the payee within 1 day.')}
                  <TextButton
                    sx={{
                      color: '#4685FF',
                      marginLeft: '10px',
                    }}
                    onClick={onTextButtonClick}
                  >
                    {isUserReceiver ? t('Refund now') : t('Remind Payee')}
                  </TextButton>
                </Box>
              ) : null}
              <Box
                sx={{
                  width: '100%',
                  marginBottom: '16px',
                }}
              >
                <TransferTimeItem title={t('Transfer time')} time={transferContent.createDate} />
                {currentStatus === TransferDetailDisplayStatus.SUCCESS ? <TransferTimeItem title={t('Receipt time')} time={transferContent.updateDate} /> : null}
                {currentStatus === TransferDetailDisplayStatus.REFUND ? <TransferTimeItem title={t('Reject time')} time={transferContent.rejectDate} /> : null}
                {isTransferExpired && currentStatus === TransferDetailDisplayStatus.REFUND ? <TransferTimeItem title={t('confirmed in')} time={transferContent.deadline} /> : null}
              </Box>
              <Button
                sx={{
                  width: '100%',
                  height: '48px',
                }}
                variant="surface"
                onClick={onActionButtonClick}
                disabled={buttonLoading}
              >
                {currentStatus === TransferDetailDisplayStatus.WAIT && isUserReceiver ? t('Accept Transfer') : t('OK')}
              </Button>
              {currentStatus === TransferDetailDisplayStatus.WAIT && isUserSender ? (
                <>
                  <Button
                    sx={{
                      marginTop: '12px',
                      color: '#4685FF',
                      borderRadius: '90px',
                      border: '1px solid var(--light-primary-1, #4685FF)',
                      width: '100%',
                      height: '48px',
                    }}
                    onClick={() => {
                      setConfirmModalOpen(true)
                    }}
                    disabled={buttonLoading}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {buttonLoading ? (
                        <CircularProgress
                          size="16px"
                          thickness={4}
                          sx={{
                            marginRight: '16px',
                            '& .MuiCircularProgress-svg': {
                              color: 'red',
                            },
                          }}
                          color="inherit"
                        />
                      ) : null}
                      {t('Cancel this transfer')}
                    </Box>
                  </Button>
                  <CommonConfirmModal
                    content={t('Are you sure you want to cancel this transfer?')}
                    open={confirmModalOpen}
                    onCloseModal={() => {
                      setConfirmModalOpen(false)
                    }}
                    onConfirmButtonClick={handleUserCancelTransfer}
                  />
                </>
              ) : null}
              {currentStatus === TransferDetailDisplayStatus.REFUND ? (
                <Box
                  sx={{
                    width: '120px',
                    height: '43px',
                    border: '0.5px solid #FF962B',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(255, 174, 54, 0.2)',
                    transform: 'rotate(-30deg)',
                    position: 'absolute',
                    top: '30px',
                    left: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF962B',
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  {isTransferExpired ? t('Confirmed') : t('Unconfirmed')}
                </Box>
              ) : null}
            </>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                sx={{
                  '& .MuiCircularProgress-svg': {
                    color: '#00D0B7',
                  },
                }}
                color="inherit"
              />
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(TransferDetailModal)
