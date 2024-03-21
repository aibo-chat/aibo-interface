import { action, makeAutoObservable, observable } from 'mobx'
import { Store } from './index'

export default class RenderStore {
  rootStore: Store

  _ROOM_LIST_UPDATED = 0

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: observable,
      resetStore: action,
      _ROOM_LIST_UPDATED: observable,
      updateRoomList: action,
    })
  }

  resetStore = () => {
    this._ROOM_LIST_UPDATED = 0
  }

  updateRoomList = () => {
    this._ROOM_LIST_UPDATED += 1
  }
}
