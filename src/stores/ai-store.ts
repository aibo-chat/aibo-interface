import { action, flow, makeObservable, observable } from 'mobx'
import { AxiosResponse } from 'axios'
import { Store } from './index'
import DefedApi, { IResponseType } from '../api/defed-api'
import { request } from '../api/request'
import matrixApi, { IGetBotListResponse, IGetBotListSingleBotType } from '../api/matrix-api'
import snackbarUtils from '../util/SnackbarUtils'
import { hasDevices, hasDMWith } from '../util/matrixUtil'
import * as roomActions from '../client/action/room'

export enum TxStatus {
  PENDING = 0,
  SUCCESSFUL = 1,
  FAILED = 2,
}

export interface CommonTransferOrderData {
  id: number
  flag: number
  transactionType: string
  transType: number
  tokenSymbol: string
  tokenName: string
  amount: string
  from: string
  to: string
  chainId: string
  txStatus: TxStatus
  depositFrom: number
  txHash: string
  tradeDate: number
  tokenDecimals: string
}
export default class AiStore {
  rootStore: Store

  botList: Array<IGetBotListSingleBotType> = []

  botUserIdToRoomId: Array<{ userId: string; roomId: string }> = []

  botConfigInitiating = true

  transferDataWithOrderId: Map<number, CommonTransferOrderData | undefined> = new Map()

  targetBotRoomId = ''

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeObservable(this, {
      rootStore: observable,
      resetStore: action,
      initBotConfig: flow.bound,
      botList: observable,
      botUserIdToRoomId: observable,
      addBotUserIdToRoomId: action,
      botConfigInitiating: observable,
      transferDataWithOrderId: observable,
      updateTransferDataWithOrderId: flow.bound,
      targetBotRoomId: observable,
    })
  }

  resetStore = () => {
    this.botList = []
    this.botUserIdToRoomId = []
    this.botConfigInitiating = false
  };

  *initBotConfig() {
    this.botConfigInitiating = true
    try {
      const result: AxiosResponse<IResponseType<IGetBotListResponse>> = yield request.get(matrixApi.listMatrixBot)
      if (Array.isArray(result?.data?.data)) {
        this.botList = result.data.data.filter((item) => item.status === 1)
        if (this.botList.length) {
          const botInfo = this.botList[0]
          if (!botInfo.user_id) return
          const dmRoomId = hasDMWith(botInfo.user_id)
          if (dmRoomId) {
            this.targetBotRoomId = dmRoomId
            return
          }
          try {
            const result: { room_id: string } = yield roomActions.createDM(botInfo.user_id, yield hasDevices(botInfo.user_id))
            this.targetBotRoomId = result.room_id
          } catch (e) {
            snackbarUtils.error(`Failed to create DM with ${botInfo.display_name}`)
          }
        }
      } else {
        if (result?.data?.msg) {
          snackbarUtils.error(result.data.msg)
        }
      }
    } catch (e) {
      snackbarUtils.error('initBotConfig error')
    }
    this.botConfigInitiating = false
  }

  addBotUserIdToRoomId = (userId: string, roomId: string) => {
    const exists = this.botUserIdToRoomId.some((item) => item.userId === userId)
    if (!exists) {
      this.botUserIdToRoomId.push({ userId, roomId })
    } else {
      this.botUserIdToRoomId = this.botUserIdToRoomId.map((item) => (item.userId === userId ? { userId, roomId } : item))
    }
  };

  *updateTransferDataWithOrderId(orderId: number) {
    if (orderId !== undefined) {
      const transferOrderData: AxiosResponse<IResponseType<CommonTransferOrderData>> = yield request.get(DefedApi.getPageTransaction, {
        params: {
          id: orderId,
        },
      })
      if (transferOrderData?.data?.data?.id !== undefined) {
        this.transferDataWithOrderId.set(orderId, transferOrderData.data.data)
      }
    }
  }
}
