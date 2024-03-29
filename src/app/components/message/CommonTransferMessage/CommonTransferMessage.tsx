import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { EventTimelineSet, IContent, MatrixClient, MatrixEvent, RelationType } from 'matrix-js-sdk'
import { Box, Skeleton } from '@mui/material'
import { useDebounce, useIsomorphicLayoutEffect } from 'ahooks'
import { useMessageContent } from '../../../hooks/useMessageContent'
import { useMatrixClient } from '../../../hooks/useMatrixClient'
import { AptosTransfer } from '../../aptos/Transfer'
import { DefedMsgType } from '../../../../types/defed/message'
import { AptosTransferStepThree } from '../../aptos/TransferStepThree'

interface IAiTransferMessageProps {
  mEventId: string
  mEvent: MatrixEvent
  timelineSet: EventTimelineSet
}

export interface CommonTransferMessageContent {
  amount: string
  target: string
  head_title: string
  network?: string
  symbol: string
  sender_id?: number
  receiver_id?: number
  result?: {
    toAddress: string
    fromAddress: string
    coin: string
    sendAmount: string
    txHash: string
    networkName: string
  }
}

const CommonTransferMessage: React.FC<IAiTransferMessageProps> = ({ timelineSet, mEvent, mEventId }) => {
  const mx = useMatrixClient() as MatrixClient
  const [messageBody] = useMessageContent<CommonTransferMessageContent>(mEventId, mEvent, timelineSet)
  const [initDone, setInitDone] = useState<boolean>(false)
  const debouncedInitDone = useDebounce(initDone, { wait: 500 })
  useIsomorphicLayoutEffect(() => {
    setInitDone(true)
  }, [])
  const updateMessage = async (newContent: { [p in keyof CommonTransferMessageContent]?: CommonTransferMessageContent[p] }) => {
    const finalNewContent = {
      ...messageBody,
      ...newContent,
    }
    const content: IContent = {
      msgtype: DefedMsgType.CommonTransfer,
      body: finalNewContent,
      'm.new_content': {
        msgtype: DefedMsgType.CommonTransfer,
        body: finalNewContent,
      },
      'm.relates_to': {
        event_id: mEvent.getId(),
        rel_type: RelationType.Replace,
      },
    }
    const roomId = mEvent.getRoomId()
    if (!roomId) return
    try {
      await mx.sendMessage(roomId, content)
    } catch (e) {
      console.error(e)
    }
  }

  return debouncedInitDone ? (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <Box
        sx={{
          fontSize: '15px',
          fontWeight: 420,
          lineHeight: '22px',
          marginBottom: '8px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {messageBody?.head_title}
      </Box>
      {messageBody?.result ? (
        <AptosTransferStepThree
          toAddress={messageBody.result.toAddress}
          fromAddress={messageBody.result.fromAddress}
          coin={messageBody.result.coin}
          sendAmount={messageBody.result.sendAmount}
          txHash={messageBody.result.txHash}
          networkName={messageBody.result.networkName}
        />
      ) : (
        <AptosTransfer
          aiInputAmount={messageBody.amount}
          aiTokenSymbol={messageBody.symbol}
          aiToAddress={messageBody.target}
          updateMessage={updateMessage}
        />
      )}
    </Box>
  ) : (
    <Skeleton
      sx={{
        width: '100%',
        height: '264px',
      }}
      animation="wave"
    />
  )
}
export default observer(CommonTransferMessage)
