import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { EventTimelineSet, IContent, MatrixEvent, RelationType } from 'matrix-js-sdk'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { BigNumber } from 'bignumber.js'
import { Box, ButtonBase } from '@mui/material'
import { AxiosResponse } from 'axios'
import { useMessageContent } from '../../hooks/useMessageContent'
import { useMobxStore } from '../../../stores/StoreProvider'
import { useMatrixClient } from '../../hooks/useMatrixClient'
import { request } from '../../../api/request'
import defedApi, { IClaimRedEnvelopeRecordResponse, IResponseType } from '../../../api/defed-api'
import { DefedMsgType } from '../../../types/defed/message'
import imageMap from '../../../images/imageMap'
import { substitutionString } from '../../../util/common'
import { useUserInfoWithProxy } from '../../hooks/useUserInfoWithProxy'
import GiftIcon from '../../../../public/res/svg/common/common_outlined_gift_icon.svg?react'

export interface CryptoBoxMessageContent {
  senderProxy: string
  receiverProxy: string
  redEnvelopeId: number
  status: number
  result?: any
}
interface ICryptoBoxMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}

const CryptoBoxMessage: React.FC<ICryptoBoxMessageProps> = (props) => {
  const { mEvent, mEventId, timelineSet } = props
  const matrixClient = useMatrixClient()
  const {
    appStore: { userAccount },
    modalStore: { setCryptoBoxModalVisible, setGiftAmount },
  } = useMobxStore()
  const [content] = useMessageContent<CryptoBoxMessageContent>(mEventId, mEvent, timelineSet)
  const { status, result, senderProxy, receiverProxy } = content
  const [receiverUserInfo] = useUserInfoWithProxy(receiverProxy)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [buttonLoading, setButtonLoading] = useState(false)
  const isUserSender = useMemo(() => senderProxy === userAccount?.proxyAddress, [senderProxy, userAccount?.proxyAddress])
  // 红包是否过期
  const userReceived = useMemo<{
    DEFE: BigNumber
    ETH: BigNumber
  }>(() => {
    if (!userAccount?.proxyAddress || status === 2 || status === 0) {
      return {
        ETH: new BigNumber(0),
        DEFE: new BigNumber(0),
      }
    }
    return {
      DEFE: new BigNumber(result?.[userAccount.proxyAddress]?.DEFE)
        .div(10 ** 16)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .div(10 ** 2),
      ETH: new BigNumber(result?.[userAccount.proxyAddress]?.ETH)
        .div(10 ** 14)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .div(10 ** 4),
    }
  }, [result, status, userAccount?.proxyAddress])
  const isShowETH = userReceived?.ETH && !userReceived.ETH.isZero()
  const isShowDEFE = userReceived?.DEFE && !userReceived.DEFE.isZero()
  const onClaimedCryptoBoxClick = () => {
    if (isUserSender) {
      enqueueSnackbar(t('Receiver has claimed DEFED crypto box.'), { variant: 'error' })
    }
  }
  const updateMessage = async (newContent: CryptoBoxMessageContent) => {
    const roomId = mEvent.getRoomId()
    if (!roomId) return
    const content: IContent = {
      msgtype: DefedMsgType.CryptoBox,
      body: newContent,
      'm.new_content': {
        msgtype: DefedMsgType.CryptoBox,
        body: newContent,
      },
      'm.relates_to': {
        event_id: mEvent.getId(),
        rel_type: RelationType.Replace,
      },
    }

    matrixClient.sendMessage(roomId, content).catch((e) => {
      console.error(e)
    })
  }
  const onCryptoBoxMessageClick = async () => {
    // The sender of crypto box should not be able to open it.
    if (isUserSender) {
      enqueueSnackbar(t('This crypto box has not been claimed.'), { variant: 'error' })
      return
    }
    setButtonLoading(true)
    setCryptoBoxModalVisible(true)
    const params = {
      sender: senderProxy,
      receiver: receiverProxy,
      redEnvelopeId: content.redEnvelopeId,
    }
    try {
      const result: AxiosResponse<IResponseType<IClaimRedEnvelopeRecordResponse>> = await request.post(defedApi.postOpenClaimRedEnvelope, params)
      if (result?.data?.data?.sender) {
        const claimRedEnvelopeResult = result.data.data
        // Claim success
        const receivedAmount = {
          ETH: claimRedEnvelopeResult.wethamount,
          DEFE: claimRedEnvelopeResult.polyDEFEAmount,
        }
        setGiftAmount({
          DEFE: new BigNumber(receivedAmount.DEFE)
            .div(10 ** 16)
            .decimalPlaces(0, BigNumber.ROUND_FLOOR)
            .div(10 ** 2)
            .toNumber(),
          ETH: new BigNumber(receivedAmount.ETH)
            .div(10 ** 14)
            .decimalPlaces(0, BigNumber.ROUND_FLOOR)
            .div(10 ** 4)
            .toNumber(),
        })
        const newContent = {
          ...content,
          status: 1,
          result: {
            [senderProxy]: receivedAmount,
            [receiverProxy]: receivedAmount,
          },
        }
        updateMessage(newContent)
      } else {
        setCryptoBoxModalVisible(false)
        // claim red envelope failure
        if (result?.data?.code === 500) {
          if (result.data?.msg === 'Receiver has claimed cash gift.') {
            const newContent = {
              ...content,
              status: 2,
            }
            updateMessage(newContent)
            enqueueSnackbar(t('You have claimed a DEFED crypto box.'), { variant: 'error' })
          }
        } else {
          if (result?.data?.msg) {
            enqueueSnackbar(t(result?.data?.msg || 'User claimed error'), { variant: 'error' })
          }
        }
      }
    } catch (e) {
      setCryptoBoxModalVisible(false)
      enqueueSnackbar(t('User claimed error'), { variant: 'error' })
    }
    setButtonLoading(false)
  }
  const renderMessageContent = useCallback(() => {
    if (!result) return null
    if (status === 2 || status === 0) return null
    let receivedMessage: string | React.ReactNode
    if (isUserSender) {
      receivedMessage = (
        <>
          <Box
            sx={{
              fontWeight: 700,
              marginRight: '4px',
            }}
            component="span"
          >
            {receiverUserInfo?.handleName || substitutionString(receiverProxy, 5, 5, '.')}
          </Box>
          {t('has claimed this crypto box and you received')}
        </>
      )
    } else {
      receivedMessage = t(`You have claimed this crypto box and received`)
    }
    const userReceive = (userAccount?.proxyAddress && result[userAccount?.proxyAddress]) || {}
    return (
      <Box
        sx={{
          width: '100%',
          fontSize: '14px',
          fontWeight: 420,
          color: 'rgb(0,0,0)',
          textAlign: 'center',
          marginTop: '12px',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '14px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: '-36px',
          }}
        >
          <GiftIcon
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Box>
        {receivedMessage}
        <Box
          component="span"
          sx={{
            marginLeft: '4px',
            color: '#FF7A00',
            fontWeight: 700,
          }}
        >
          {userReceive.ETH
            ? `${new BigNumber(userReceive.ETH)
                .div(10 ** 14 * 2)
                .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                .div(10 ** 4)
                .toFormat(4)} ETH`
            : ''}
          {userReceive.DEFE && userReceive.ETH ? (
            <Box
              sx={{
                color: '#78828c',
              }}
              component="span"
            >
              {' and '}
            </Box>
          ) : (
            ''
          )}
          {userReceive.DEFE
            ? `${new BigNumber(userReceive.DEFE)
                .div(10 ** 16 * 2)
                .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                .div(10 ** 2)
                .toFormat(2)} DEFE`
            : ''}
        </Box>
        .
      </Box>
    )
  }, [isUserSender, receiverProxy, receiverUserInfo?.handleName, result, status, t, userAccount?.proxyAddress])
  return status === 2 ? (
    <Box
      sx={{
        width: '160px',
        height: '160px',
        backgroundImage: `url(${imageMap.cryptoBox.cryptoBoxExpiredBgEn})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '64px',
      }}
    />
  ) : status === 0 ? (
    <ButtonBase
      sx={{
        width: '160px',
        height: '160px',
        backgroundImage: `url(${imageMap.cryptoBox.cryptoBoxBg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={onCryptoBoxMessageClick}
      disabled={buttonLoading}
    />
  ) : (
    <>
      <ButtonBase
        sx={{
          width: '160px',
          height: '160px',
          backgroundImage: `url(${imageMap.cryptoBox.cryptoBoxOpenEn})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
        disabled={isUserSender}
        onClick={onClaimedCryptoBoxClick}
      >
        {isShowDEFE && !isShowETH ? (
          <Box
            component="img"
            src={imageMap.cryptoBox.cryptoBoxDefeSideIcon}
            sx={{
              position: 'absolute',
              top: '44px',
              left: '120px',
              width: '30px',
              height: '30px',
            }}
          />
        ) : null}
        {isShowDEFE ? (
          <Box
            sx={{
              position: 'absolute',
              top: isShowETH ? '11px' : '13.5px',
              left: isShowETH ? '62.75px' : '81px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={imageMap.cryptoBox.cryptoBoxDefeIcon}
              sx={{
                width: isShowETH ? '37.5px' : '41.5px',
                height: isShowETH ? '37.5px' : '41.5px',
                marginBottom: '4px',
              }}
            />
            <Box
              sx={{
                width: '43px',
                height: '24px',
                background: 'linear-gradient(270deg, #2399E8 -0.68%, rgba(47, 229, 253, 0.5) 100%)',
                border: '0.329063px solid #13D9FF',
                backdropFilter: 'blur(1px)',
                borderRadius: '6px',
                color: '#FFF',
                fontFamily: 'var(--font-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  height: '10px',
                  transform: 'scale(0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {userReceived.DEFE.toFormat(2)}
              </Box>
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  height: '10px',
                  transform: 'scale(0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                DEFE
              </Box>
            </Box>
          </Box>
        ) : null}
        {isShowETH ? (
          <Box
            sx={{
              position: 'absolute',
              top: '24px',
              left: '122px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={imageMap.cryptoBox.cryptoBoxEthIcon}
              sx={{
                width: '37.5px',
                height: '37.5px',
                marginBottom: '4px',
              }}
            />
            <Box
              sx={{
                width: '43px',
                height: '24px',
                background: 'linear-gradient(270deg, #7E79E2 -0.68%, rgba(166, 191, 255, 0.6) 100%)',
                border: '0.329063px solid #B894FF',
                backdropFilter: 'blur(1px)',
                borderRadius: '6px',
                color: '#FFF',
                fontFamily: 'var(--font-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  height: '10px',
                  transform: 'scale(0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {userReceived.ETH.toFormat(4)}
              </Box>
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  height: '10px',
                  transform: 'scale(0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ETH
              </Box>
            </Box>
          </Box>
        ) : null}
      </ButtonBase>
      {renderMessageContent()}
    </>
  )
}
export default observer(CryptoBoxMessage)
