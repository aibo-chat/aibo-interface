import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'ahooks'
import { Box, ButtonBase } from '@mui/material'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import Lottie, { AnimationItem } from 'lottie-web'
import TransferImageMap from '../../../../images/transferImageMap'
import TxHashIcon from '../../../../../public/res/svg/transfer/common_transfer_txhash_icon.svg?react'
import { DefedNetworkConfigs } from '../../../../constant'
import { textCenterEllipsis } from './components'
import { useMobxStore } from '../../../../stores/StoreProvider'
import { TxStatus } from '../../../../stores/ai-store'
import LoadingJSON from '../../../../../public/res/json/common_transfer_loading.json'
import { CommonTransferMessageContent } from './CommonTransferMessage'

interface IOrderPartProps {
  orderId: number
  defaultData?: CommonTransferMessageContent
}

const PollingInterval = 10 * 1000
const OrderPart: React.FC<IOrderPartProps> = ({ orderId, defaultData }) => {
  const { t } = useTranslation()
  const {
    aiStore: { updateTransferDataWithOrderId, transferDataWithOrderId },
  } = useMobxStore()
  const transferData = (() => {
    if (orderId) {
      const cacheData = transferDataWithOrderId.get(orderId)
      if (cacheData) {
        return cacheData
      }
    }
    if (defaultData) {
      return {
        id: 0,
        flag: 0,
        transactionType: '',
        transType: 0,
        tokenSymbol: defaultData.token_symbol || '',
        tokenName: defaultData.token_name || '',
        amount: defaultData.transfer_amount || '',
        from: defaultData.from || '',
        to: defaultData.to || '',
        chainId: '',
        txStatus: defaultData.tx_status !== undefined ? defaultData.tx_status : TxStatus.PENDING,
        depositFrom: 0,
        txHash: '',
        tradeDate: 0,
        tokenDecimals: '',
      }
    }
  })()
  const pollingTimer = useRef<ReturnType<typeof setInterval>>()
  const animationRef = useRef<AnimationItem>()
  const iconRef = useRef<HTMLDivElement>()

  const startPolling = () => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current)
    }
    pollingTimer.current = setInterval(() => {
      updateTransferDataWithOrderId(orderId)
    }, PollingInterval)
  }
  const cancelPolling = () => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current)
      pollingTimer.current = undefined
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (!transferData || transferData?.txStatus === TxStatus.PENDING) {
      startPolling()
      if (!animationRef.current) {
        if (!iconRef.current) return
        animationRef.current = Lottie.loadAnimation({
          container: iconRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: LoadingJSON,
        })
      } else {
        animationRef.current.show()
        animationRef.current.goToAndPlay(0)
      }
    } else {
      cancelPolling()
      if (animationRef.current) {
        animationRef.current.hide()
      }
    }
    return () => {
      cancelPolling()
      if (animationRef.current) {
        animationRef.current.destroy()
        animationRef.current = undefined
      }
    }
  }, [transferData?.txStatus])
  const initTransferData = async () => {
    if (!orderId) return
    updateTransferDataWithOrderId(orderId)
  }
  useIsomorphicLayoutEffect(() => {
    initTransferData()
  }, [orderId])
  return (
    <Box
      sx={{
        width: '100%',
        padding: '20px 16px 0',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          width: '90px',
          height: '90px',
          marginBottom: '4px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '108px',
            height: '108px',
            zIndex: 1,
            backgroundColor: !transferData || transferData?.txStatus === TxStatus.PENDING ? '#FBFBFE' : 'transparent',
          }}
          ref={iconRef}
        />
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
          component="img"
          src={transferData?.txStatus === TxStatus.SUCCESSFUL ? TransferImageMap.commonTransferMessageSucceededIcon : TransferImageMap.commonTransferMessageFailedIcon}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          fontSize: '34px',
          fontWeight: 500,
          color: '#141414',
          marginBottom: '12px',
        }}
      >
        <Box
          component="span"
          sx={{
            marginRight: '8px',
          }}
        >
          {transferData?.amount ? new BigNumber(transferData.amount).div(10 ** Number(transferData.tokenDecimals)).toFormat(4) : '-'}
        </Box>
        <Box component="span">{transferData?.tokenSymbol || '-'}</Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          borderRadius: '12px',
          border: '1px solid #E6EBF0',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          '& .item': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          '& .itemTitle': {
            fontSize: '14px',
            fontWeight: 400,
            color: '#78828C',
            lineHeight: '20px',
          },
          '& .itemContent': {
            fontSize: '16px',
            fontWeight: 500,
            color: '#141414',
            lineHeight: '24px',
          },
        }}
      >
        <Box
          className="item"
          sx={{
            marginBottom: '16px',
          }}
        >
          <Box className="itemTitle">{t('From')}</Box>
          <Box className="itemContent">{transferData?.from ? textCenterEllipsis(transferData.from, 5, 5) : '--'}</Box>
        </Box>
        <Box
          className="item"
          sx={{
            marginBottom: '16px',
          }}
        >
          <Box className="itemTitle">{t('To')}</Box>
          <Box className="itemContent">{transferData?.to ? textCenterEllipsis(transferData.to, 5, 5) : '--'}</Box>
        </Box>
        <Box className="item">
          <Box className="itemTitle">{t('Tx Hash')}</Box>
          <ButtonBase
            sx={{
              width: '20px',
              height: '20px',
            }}
            onClick={() => {
              if (transferData?.chainId === undefined || transferData?.chainId === null) return
              if (!transferData?.txHash) return
              window.open(`${DefedNetworkConfigs[transferData.chainId].explorerLink}tx/${transferData.txHash}`)
            }}
          >
            <TxHashIcon />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  )
}
export default observer(OrderPart)
