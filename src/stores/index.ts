import { observable, makeObservable, action, flow } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import AppStore from './app-store'
import UserInfoStore from './user-info-store'
import UserAssetStore from './user-asset-store'
import ModalStore from './modal-store'
import AiStore from './ai-store'
import RoomStore from './room-store'
import UserRelationshipStore from './user-relationship-store'
import RenderStore from './render-store'

enableStaticRendering(typeof window === 'undefined')

export class Store {
  targetProxy = ''

  appStore: AppStore

  userInfoStore: UserInfoStore

  userAssetStore: UserAssetStore

  modalStore: ModalStore

  aiStore: AiStore

  roomStore: RoomStore

  userRelationshipStore: UserRelationshipStore

  renderStore: RenderStore

  constructor() {
    this.appStore = new AppStore(this)
    this.userInfoStore = new UserInfoStore(this)
    this.userAssetStore = new UserAssetStore(this)
    this.modalStore = new ModalStore(this)
    this.aiStore = new AiStore(this)
    this.roomStore = new RoomStore(this)
    this.userRelationshipStore = new UserRelationshipStore(this)
    this.renderStore = new RenderStore(this)
    makeObservable(this, {
      initData: flow.bound,
      targetProxy: observable,
      changeTargetProxy: action,
      resetStore: action,
      appStore: observable,
      userInfoStore: observable,
      userAssetStore: observable,
      modalStore: observable,
      aiStore: observable,
      roomStore: observable,
      userRelationshipStore: observable,
      renderStore: observable,
    })
  }

  *initData(targetProxy?: string) {
    yield this.aiStore.initBotConfig()
    // 需要auth认证的初始化得放在initUserData之后
    yield this.appStore.initUserData(targetProxy)
    // yield this.appStore.initGroupConfig()
    yield this.userAssetStore.initData()
    // yield this.userRelationshipStore.initData()
  }

  changeTargetProxy = (newValue: string) => {
    this.targetProxy = newValue
  }

  resetStore = () => {
    this.appStore.resetStore()
    this.userInfoStore.resetStore()
    this.userAssetStore.resetStore()
    this.modalStore.resetStore()
    this.aiStore.resetStore()
    this.roomStore.resetStore()
    this.userRelationshipStore.resetStore()
    this.renderStore.resetStore()
  }
}
