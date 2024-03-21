import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import { AxiosResponse } from 'axios'
import { Store } from './index'
import snackbarUtils from '../util/SnackbarUtils'
import { request } from '../api/request'
import DefedApi, { IConversationData, IGetConversationList, IListMyCreateGroupResponseData, IResponseType } from '../api/defed-api'
import initMatrix from '../client/initMatrix'
import { substitutionStringForMatrixId } from '../util/common'

export interface RecentTransferRecordList {
  address: string
  avatar: string | null
  handleName: string | null
  proxyAddress: string
}
export const USER_GUIDE_FLAG_KEY = 'user-guide-flag'
export default class UserRelationshipStore {
  rootStore: Store

  oldRelationship: IConversationData[] = []

  roomIdToProxyMap: Map<string, string> = new Map()

  oldCreatedRooms: Array<IListMyCreateGroupResponseData> = []

  recentTransferRecord: Array<RecentTransferRecordList> = []

  constructor(roomStore: Store) {
    this.rootStore = roomStore
    makeAutoObservable(this, {
      rootStore: observable,
      resetStore: action,
      initData: flow.bound,
      getUserOldRelationship: flow.bound,
      checkUserProxyWithDirectRoomIds: action,
      roomIdToProxyMap: observable,
      notMigratedRelationship: computed,
      getUserOldCreatedRooms: flow.bound,
      oldCreatedRooms: observable,
      getUserRecentTransferRecord: flow.bound,
    })
  }

  resetStore = () => {
    this.oldRelationship = []
    this.roomIdToProxyMap = new Map()
    this.oldCreatedRooms = []
    this.recentTransferRecord = []
  };

  *getUserOldRelationship() {
    if (!this.rootStore.appStore.userAccount?.uid) return snackbarUtils.error('GetUserOldRelationship Error: no uid!')
    try {
      const result: AxiosResponse<IResponseType<IGetConversationList>> = yield request.get(DefedApi.getConversationList, {
        params: {
          userId: this.rootStore.appStore.userAccount.uid,
        },
      })
      if (Array.isArray(result?.data?.data?.cons)) {
        this.oldRelationship = result.data.data.cons.filter((conv) => conv.type === 'single')
        const storageResult = window.localStorage.getItem(USER_GUIDE_FLAG_KEY)
        if (storageResult !== 'true') {
          this.rootStore.modalStore.changeUserGuideVisible(true)
        }
      }
    } catch (e) {
      console.error(e)
      snackbarUtils.error('GetUserOldRelationship Error!')
    }
  }

  *getUserOldCreatedRooms() {
    try {
      const result: AxiosResponse<IResponseType<Array<IListMyCreateGroupResponseData>>> = yield request.get(DefedApi.listMyCreateGroup)
      if (Array.isArray(result?.data?.data)) {
        this.oldCreatedRooms = result.data.data
      }
    } catch (e) {
      console.error(e)
      snackbarUtils.error('GetUserOldCreatedRoom Error!')
    }
  }

  *initData() {
    yield this.getUserOldRelationship()
    yield this.getUserOldCreatedRooms()
    yield this.getUserRecentTransferRecord()
  }

  checkUserProxyWithDirectRoomIds = (roomIds: Array<string>) => {
    if (!roomIds?.length) return
    const mx = initMatrix.matrixClient
    if (!mx) return
    for (const roomId of roomIds) {
      const targetRoom = mx.getRoom(roomId)
      if (targetRoom) {
        const members = targetRoom.getMembers()
        if (members?.length === 2) {
          const targetMember = members.find((member) => member.userId !== targetRoom.myUserId)
          if (targetMember) {
            const regex = /(?<=@)0x([^:]*)(?=:)/gm
            if (regex.test(targetMember.userId)) {
              this.roomIdToProxyMap.set(roomId, substitutionStringForMatrixId(targetMember.userId, 30, 30, ''))
            }
          }
        }
      }
    }
  }

  get notMigratedRelationship(): Array<IConversationData> {
    if (this.oldRelationship.length) {
      const allExistProxy = Array.from(this.roomIdToProxyMap.values())
      return this.oldRelationship.filter((conv) => !allExistProxy.includes(conv.toProxy) && conv.toProxy !== this.rootStore.appStore.userAccount?.proxyAddress)
    }
    return []
  }

  *getUserRecentTransferRecord() {
    try {
      const res: AxiosResponse<IResponseType<Array<any>>> = yield request.get(DefedApi.getRecentTransfer)
      if (res?.data?.data?.length) {
        this.recentTransferRecord = res.data.data
      }
    } catch (e) {
      console.error(e)
      snackbarUtils.error('GetUserRecentTransferRecord Error!')
    }
  }
}
