import { action, makeObservable, observable } from 'mobx'
import { EventTimelineSet, MatrixEvent } from 'matrix-js-sdk'
import { Store } from './index'
import { IPermissionResult } from '../api/defed-api'
import { GroupConditionResult } from './app-store'
import { CreateNewGroupCondition } from '../app/organisms/create-room/CreateRoom'
import { FeedsSingleNewsNecessaryData } from '../app/components/message/FeedsSingleNews'

interface IPermissionResultWithTargetProxy extends IPermissionResult {
  targetProxy: string
}
export interface IframeAppData {
  key: string
  url: string
  icon: string
}
export default class ModalStore {
  rootStore: Store

  transferModalVisible = false

  transferModalTargetData: { proxy?: string; roomId?: string } = {}

  transferDetailModalTargetMatrixData: { mEvent: MatrixEvent; mEventId: string; timelineSet: EventTimelineSet } | null = null

  permissionResult: IPermissionResultWithTargetProxy | null = null

  cryptoBoxModalVisible = false

  giftAmount = { ETH: 0, DEFE: 0 }

  addCustomizedTokenConditionPreInfo?: GroupConditionResult = undefined

  addCustomizedTokenConditionAction?: (data: CreateNewGroupCondition) => void = undefined

  feedToShare?: FeedsSingleNewsNecessaryData = undefined

  imagePreviewSrc?: string = undefined

  userGuideVisible = false

  iframeAppData?: IframeAppData = undefined

  iframeAppDisplay = false

  appShortCutArray: Array<IframeAppData> = []

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeObservable(this, {
      rootStore: observable,
      resetStore: action,
      transferModalVisible: observable,
      changeTransferModalVisible: action,
      transferModalTargetData: observable,
      changeTransferModalTargetProxy: action,
      transferDetailModalTargetMatrixData: observable,
      changeTransferDetailModalTargetMatrixData: action,
      permissionResult: observable,
      setPermissionResult: action,
      cryptoBoxModalVisible: observable,
      setCryptoBoxModalVisible: action,
      giftAmount: observable,
      setGiftAmount: action,
      addCustomizedTokenConditionPreInfo: observable,
      changeAddCustomizedTokenConditionPreInfo: action,
      addCustomizedTokenConditionAction: observable,
      feedToShare: observable,
      changeFeedToShare: action,
      imagePreviewSrc: observable,
      changeImagePreviewSrc: action,
      userGuideVisible: observable,
      changeUserGuideVisible: action,
      iframeAppData: observable,
      changeIframeAppData: action,
      iframeAppDisplay: observable,
      changeIframeAppDisplay: action,
      appShortCutArray: observable,
      removeAppShortCut: action,
    })
  }

  resetStore = () => {
    this.transferModalVisible = false
    this.transferModalTargetData = {}
    this.permissionResult = null
    this.addCustomizedTokenConditionPreInfo = undefined
    this.addCustomizedTokenConditionAction = undefined
    this.feedToShare = undefined
    this.imagePreviewSrc = ''
    this.userGuideVisible = false
    this.iframeAppData = undefined
    this.iframeAppDisplay = false
    this.appShortCutArray = []
  }

  changeTransferModalVisible = (newValue: boolean) => {
    this.transferModalVisible = newValue
  }

  changeTransferModalTargetProxy = (newValue: { proxy?: string; roomId?: string }) => {
    this.transferModalTargetData = newValue
  }

  changeTransferDetailModalTargetMatrixData = (newValue: { mEvent: MatrixEvent; mEventId: string; timelineSet: EventTimelineSet } | null) => {
    this.transferDetailModalTargetMatrixData = newValue
  }

  setPermissionResult = (newValue: IPermissionResultWithTargetProxy | null) => {
    this.permissionResult = newValue
  }

  setCryptoBoxModalVisible = (newValue: boolean) => {
    this.cryptoBoxModalVisible = newValue
    if (!newValue) {
      this.setGiftAmount({ ETH: 0, DEFE: 0 })
    }
  }

  setGiftAmount = (newValue: { ETH: number; DEFE: number }) => {
    this.giftAmount = newValue
  }

  changeAddCustomizedTokenConditionPreInfo = (newValue?: GroupConditionResult, callback?: (data: CreateNewGroupCondition) => void) => {
    this.addCustomizedTokenConditionPreInfo = newValue
    if (newValue) {
      this.addCustomizedTokenConditionAction = callback
    } else {
      this.addCustomizedTokenConditionAction = undefined
    }
  }

  changeFeedToShare = (newValue: FeedsSingleNewsNecessaryData | undefined) => {
    this.feedToShare = newValue
  }

  changeImagePreviewSrc = (newValue?: string) => {
    this.imagePreviewSrc = newValue
  }

  changeUserGuideVisible = (newValue: boolean) => {
    this.userGuideVisible = newValue
  }

  changeIframeAppData = (newValue?: IframeAppData) => {
    this.iframeAppData = newValue
    this.iframeAppDisplay = Boolean(newValue)
    if (newValue) {
      const findIndex = this.appShortCutArray.findIndex((item) => item.key === newValue?.key)
      if (findIndex === -1) {
        this.appShortCutArray.push(newValue)
      } else {
        this.appShortCutArray.splice(findIndex, 1, newValue)
      }
    }
  }

  changeIframeAppDisplay = (newValue: boolean) => {
    this.iframeAppDisplay = newValue
  }

  removeAppShortCut = (target?: IframeAppData) => {
    if (target) {
      const findIndex = this.appShortCutArray.findIndex((item) => item.key === target?.key)
      if (findIndex !== -1) {
        this.appShortCutArray.splice(findIndex, 1)
      }
    }
  }
}
