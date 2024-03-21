import { action, flow, makeObservable, observable, ObservableMap } from 'mobx'
import { AxiosResponse } from 'axios'
import multiAvatar from '@multiavatar/multiavatar/esm'
import { Store } from './index'
import { getUserInfoFromStorage, toDataURI, updateUserInfoToStorage } from '../app/utils/common'
import { request } from '../api/request'
import DefedApi, { IResponseType } from '../api/defed-api'
import defaultImgSvg from '../../public/res/svg/common/defaultImg.svg'

export interface UserExtraInfo {
  userId: number
  handleName?: string
  avatarLink?: string
  email?: string
  proxy: string
}
export const DEFAULT_AVATAR_URL = defaultImgSvg
export const DEFAULT_USER_INFO: UserExtraInfo = {
  proxy: '',
  userId: -1,
  avatarLink: DEFAULT_AVATAR_URL,
}
const MAX_USER_INFO_MAP_SIZE = 500
export default class UserInfoStore {
  rootStore: Store

  proxyUserInfoMap: ObservableMap<string, UserExtraInfo> = observable.map(new Map())

  netWorkProxyArray: Array<string> = []

  observableCount = 0

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeObservable(this, {
      resetStore: action,
      proxyUserInfoMap: observable,
      observableCount: observable,
      setProxyUserInfoMap: action,
      getUserInfoFromMap: action,
      getUserInfoWithProxy: action,
      setUserInfoWithProxy: action,
      updateUserInfoWithProxy: flow.bound,
    })
  }

  resetStore = () => {
    this.proxyUserInfoMap = observable.map(new Map())
    this.netWorkProxyArray = []
    this.observableCount = 0
  }

  setProxyUserInfoMap = (newProxy: string, newUserInfo: UserExtraInfo) => {
    if (newProxy) {
      const newKey = newProxy
      if (this.proxyUserInfoMap.has(newKey)) {
        this.proxyUserInfoMap.delete(newKey) // 移除数据
        this.proxyUserInfoMap.set(newKey, newUserInfo) // 插入到末尾
      } else {
        if (this.proxyUserInfoMap.size >= MAX_USER_INFO_MAP_SIZE) {
          // 删除最不常用到数据
          // 不必当心UserInfoMap为空，因为maxSize 一般不会取0，满足this.proxyUserInfoMap.size >= maxSize时，this.proxyUserInfoMap自然也不为空。
          const firstKey = this.proxyUserInfoMap.keys().next().value
          this.proxyUserInfoMap.delete(firstKey)
        }
        this.proxyUserInfoMap.set(newKey, newUserInfo) // 插入到末尾
      }
    }
  }

  getUserInfoFromMap = (targetProxy: string) => {
    const targetKey = targetProxy
    const oldUserInfo = this.proxyUserInfoMap.get(targetKey)
    if (oldUserInfo) {
      this.proxyUserInfoMap.delete(targetKey)
      this.proxyUserInfoMap.set(targetKey, oldUserInfo)
    }
    return oldUserInfo
  }

  getUserInfoWithProxy = (targetProxy: string): UserExtraInfo => {
    const oldUserInfoFromMemory = this.getUserInfoFromMap(targetProxy)
    if (oldUserInfoFromMemory) {
      return oldUserInfoFromMemory
    }
    const oldUserInfoFromStorage = getUserInfoFromStorage(targetProxy)
    if (oldUserInfoFromStorage) {
      this.setProxyUserInfoMap(targetProxy, oldUserInfoFromStorage)
      return oldUserInfoFromStorage
    }
    // Default User Info
    return DEFAULT_USER_INFO
  }

  setUserInfoWithProxy = (targetProxy: string, newUserInfo: UserExtraInfo): void => {
    this.setProxyUserInfoMap(targetProxy, newUserInfo)
    updateUserInfoToStorage(targetProxy, newUserInfo)
  };

  *updateUserInfoWithProxy(
    targetProxy: string,
    newUserInfoFromOutSide?: {
      [Property in keyof UserExtraInfo]?: UserExtraInfo[Property]
    },
  ) {
    if (targetProxy) {
      const oldUserInfo = this.getUserInfoWithProxy(targetProxy)
      let newUserInfo: UserExtraInfo = oldUserInfo
      if (newUserInfoFromOutSide) {
        newUserInfo = { ...oldUserInfo, ...newUserInfoFromOutSide }
      } else {
        const findIndexInNetWorkProxyArray = this.netWorkProxyArray.findIndex((proxy) => proxy === targetProxy)
        if (findIndexInNetWorkProxyArray === -1) {
          this.netWorkProxyArray.push(targetProxy)
          const res: AxiosResponse<IResponseType<UserExtraInfo>> = yield request.get(DefedApi.getUserInfo, { params: { proxy: targetProxy } })
          if (res?.data?.data?.userId) {
            if (res.data.data.avatarLink) {
              newUserInfo = { ...res.data.data }
            } else {
              newUserInfo = {
                ...res.data.data,
                avatarLink: toDataURI(multiAvatar(targetProxy.toLowerCase())),
              }
            }
          }
          this.netWorkProxyArray.splice(this.netWorkProxyArray.length - 1, 1)
        } else {
          return
        }
      }
      this.setUserInfoWithProxy(targetProxy, newUserInfo)
      this.observableCount += 1
      return newUserInfo
    }
  }
}
