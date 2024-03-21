import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef } from 'react'
import { EventTimelineSet, IContent, MatrixEvent, RelationType } from 'matrix-js-sdk'
import { ButtonBase, CircularProgress, Box } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { AxiosResponse } from 'axios'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { DefedMsgType } from '../../../types/defed/message'
import { request } from '../../../api/request'
import snackbarUtils from '../../../util/SnackbarUtils'
import defedApi, { IGetTransferInMessageResultResponse, IResponseType } from '../../../api/defed-api'
import { useMobxStore } from '../../../stores/StoreProvider'
import { useMessageContent } from '../../hooks/useMessageContent'
import imageMap from '../../../images/imageMap'
import transferImageMap from '../../../images/transferImageMap'

export enum TransferStatus {
  WAIT = -2,
  WAIT_CONFIRMATION = -1,
  INIT = 0,
  PROCESSING = 1,
  SIGN_SUCCESS = 2,
  SUCCESS = 3,
  FAILURE = 4,
  REFUND = -3,
  CANCEL = -4,
}
export interface TransferMessageContent {
  symbol: string
  decimals: number
  realAmount: number
  amount: number
  asset: string
  bizTxId: number
  chainId: number
  confirmation: number
  createDate: number
  rejectDate?: number
  deadline: number
  id: number
  interestRateMode: number
  nonce: number
  operation: number
  signature: string
  to: string
  toAddress: string
  transferType: string
  txHash: string
  updateDate: number
  value: number
  status: TransferStatus
}

interface ITransferMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}
export enum TransferDetailDisplayStatus {
  WAIT,
  PROCESSING,
  SUCCESS,
  FAILURE,
  REFUND,
  CANCEL = 5,
}

const PollingInterval = 10 * 1000
const TransferMessage: React.FC<ITransferMessageProps> = ({ mEventId, mEvent, timelineSet }) => {
  const [content] = useMessageContent<TransferMessageContent>(mEventId, mEvent, timelineSet)
  const { realAmount, symbol, decimals } = content
  const {
    appStore: { userAccount },
    modalStore: { changeTransferDetailModalTargetMatrixData },
  } = useMobxStore()
  const { t } = useTranslation()
  const mx = useMatrixClient()
  const isUserSender = useMemo(() => mEvent.getSender() === mx.getUserId(), [mEvent, mx])
  const currentStatus = useMemo<TransferDetailDisplayStatus>(() => {
    if (content) {
      switch (content.status) {
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
        case TransferStatus.CANCEL:
          return TransferDetailDisplayStatus.CANCEL
        default:
          return TransferDetailDisplayStatus.WAIT
      }
    } else {
      return TransferDetailDisplayStatus.WAIT
    }
  }, [content])
  const pollingTimer = useRef<ReturnType<typeof setInterval>>()
  const isUserReceiver = useMemo(() => userAccount?.proxyAddress === content.toAddress, [content.toAddress, userAccount?.proxyAddress])
  const iconUrl = useMemo(() => {
    switch (currentStatus) {
      case TransferDetailDisplayStatus.CANCEL:
      case TransferDetailDisplayStatus.WAIT:
      case TransferDetailDisplayStatus.SUCCESS:
      case TransferDetailDisplayStatus.PROCESSING:
        return imageMap.transfer.messageTransferStatusNormalIcon
      case TransferDetailDisplayStatus.REFUND:
        return imageMap.transfer.messageTransferStatusRefundIcon
      case TransferDetailDisplayStatus.FAILURE:
        return imageMap.transfer.messageTransferStatusFailedIcon
      default:
        return imageMap.transfer.messageTransferStatusNormalIcon
    }
  }, [currentStatus])
  const amountStr = useMemo(() => {
    if (!realAmount) return '0'
    const divideAmount = 10 ** (decimals || 18)
    return new BigNumber(realAmount).div(divideAmount).toFixed(4, 1)
  }, [decimals, realAmount])
  const title = useMemo(() => {
    switch (currentStatus) {
      case TransferDetailDisplayStatus.CANCEL:
        return t('Canceled')
      case TransferDetailDisplayStatus.FAILURE:
        return t('Failed')
      case TransferDetailDisplayStatus.PROCESSING:
        return t('Transaction Pending...')
      case TransferDetailDisplayStatus.REFUND:
        return t('Rejected')
      case TransferDetailDisplayStatus.SUCCESS:
        return t('Accepted')
      case TransferDetailDisplayStatus.WAIT:
      default:
        if (isUserSender) {
          return t('You’ve made a transfer')
        }
        return t('Accept transfer')
    }
  }, [content.status, currentStatus, isUserSender, t])
  const isTransferExpired = (() => {
    if (content) {
      const currentDate = dayjs().valueOf()
      if (currentDate > content.deadline) {
        return true
      }
    }
    return false
  })()
  const updateMessage = async (roomId: string, newContent: TransferMessageContent) => {
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
  const updateData = async () => {
    const roomId = mEvent.getRoomId()
    if (!roomId) return
    try {
      const result: AxiosResponse<IResponseType<IGetTransferInMessageResultResponse>> = await request.get(defedApi.getTransferInMessageResult, {
        params: {
          id: content.id,
        },
      })
      if (result?.data?.data) {
        const fetchData = result.data.data
        if (fetchData.id) {
          let newStatus = fetchData.status
          if (content.status === TransferStatus.REFUND) {
            newStatus = TransferStatus.REFUND
          } else {
            if (result.status === TransferStatus.WAIT) {
              const currentDate = dayjs().valueOf()
              const isCurrentDateExpired = currentDate >= fetchData.deadline
              if (isCurrentDateExpired) {
                newStatus = TransferStatus.REFUND
              }
            }
          }
          const newTransferContent = {
            ...content,
            ...fetchData,
            status: newStatus,
          }
          if (newTransferContent.status !== content.status) {
            if (newTransferContent.status === TransferStatus.SUCCESS) {
              cancelPolling()
              if (isUserReceiver) {
                snackbarUtils.success(t('You accept this transfer.'))
              }
            }
            updateMessage(roomId, newTransferContent)
          }
        } else {
          // The request result does not report an error, but the return value is still null. At this time, there is a problem in the database. You need to set the message to the error status
          cancelPolling()
          const newTransferContent: TransferMessageContent = {
            ...content,
            status: TransferStatus.FAILURE,
          }
          updateMessage(roomId, newTransferContent)
        }
      } else {
        if (result?.data?.msg) {
          snackbarUtils.error(result.data.msg)
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
  return (
    <ButtonBase
      sx={[
        {
          color: '#fff',
          fontFamily: 'var(--font-secondary)',
          width: { xs: '240px', xsm: '280px' },
          height: { xs: '100px', xsm: '116px' },
          borderRadius: '10px',
          padding: `20px 16px 12px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          position: 'relative',
          borderTopLeftRadius: 0,
        },
        content.status === TransferStatus.CANCEL
          ? {
              backgroundImage: `url(${transferImageMap.messageCancelBackground})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
            }
          : {
              backgroundColor: currentStatus === TransferDetailDisplayStatus.WAIT ? '#62A1FF' : '#AFCFFF',
            },
      ]}
      onClick={() => {
        changeTransferDetailModalTargetMatrixData({
          mEventId,
          mEvent,
          timelineSet,
        })
      }}
    >
      <Box
        sx={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {currentStatus === TransferDetailDisplayStatus.PROCESSING ? (
          <CircularProgress
            size="48px"
            thickness={4}
            sx={{
              marginRight: '16px',
              '& .MuiCircularProgress-svg': {
                color: '#fff',
              },
            }}
          />
        ) : (
          <Box
            component="img"
            src={iconUrl}
            sx={{
              width: { xs: '40px', xsm: '48px' },
              height: { xs: '40px', xsm: '48px' },
              marginRight: '16px',
            }}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ fontSize: '18px', fontWeight: 500 }}>
            <Box
              component="span"
              sx={{
                marginRight: '4px',
              }}
            >
              {amountStr}
            </Box>
            <Box component="span">{symbol}</Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                fontSize: '12px',
                marginRight: '8px',
              }}
            >
              {title}
            </Box>
            {currentStatus === TransferDetailDisplayStatus.WAIT ? (
              isUserSender ? null : (
                <Box
                  sx={{
                    width: '16px',
                    height: '16px',
                  }}
                  component="img"
                  src={imageMap.transfer.messageTransferClockIcon}
                />
              )
            ) : null}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          fontSize: '12px',
        }}
      >
        {t('DEFED Transfer')}
      </Box>
      {currentStatus === TransferDetailDisplayStatus.REFUND ? (
        <Box
          sx={{
            width: { xs: '88px', xsm: '100px' },
            height: { xs: '28px', xsm: '36px' },
            border: '0.5px solid #FFFFFF',
            transform: 'rotate(-15deg)',
            borderRadius: '4px',
            position: 'absolute',
            right: '6px',
            bottom: '18px',
            color: '#fff',
            fontSize: { xs: '12px', xsm: '14px' },
            fontWeight: { xs: 400, xsm: 500 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isTransferExpired ? t('Confirmed') : t('Unconfirmed')}
        </Box>
      ) : null}
    </ButtonBase>
  )
}
export default observer(TransferMessage)
