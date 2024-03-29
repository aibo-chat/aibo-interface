import { action, flow, makeObservable, observable } from 'mobx'
import { AxiosResponse } from 'axios'
import { IRecoveryKey } from 'matrix-js-sdk/src/crypto/api'
import { SecretStorageKeyDescription } from 'matrix-js-sdk/src/secret-storage'
import { MatrixClient } from 'matrix-js-sdk/src/client'
import { MatrixEvent } from 'matrix-js-sdk'
import { Store } from './index'
import { request } from '../api/request'
import defedApi, { IResponseType } from '../api/defed-api'
import initMatrix from '../client/initMatrix'
import { clearSecretStorageKeys, storePrivateKey } from '../client/state/secretStorageKeys'
import { authRequest } from '../app/organisms/settings/AuthRequest'
import MatrixApi, { IGetMatrixRoomKeyResponse, IGetMatrixSecurityKeyResponse, IPostSaveMatrixSecurityKeyParams } from '../api/matrix-api'
import { getDefaultSSKey, getSSKeyInfo } from '../util/matrixUtil'
import { loadSecurityKeyFromLocal, removeLocalSecurityKey, saveSecurityKeyIntoLocal } from '../app/utils/common'
import snackbarUtils from '../util/SnackbarUtils'

interface IAccountDataResponse {
  addressType: number
  avatar: string
  conversationPosition: number
  currentLoginAddress: string
  email: string
  msgKeyList: Array<string>
  privateKey: null | string
  proxyAddress: string
  uid: number
  username: string
}
interface GroupConditionConfigToken {
  address: string
  createDate: number
  decimals: string
  id: number
  list: null
  network: string
  networkLogo: string
  symbol: string
  tokenLink: string
  tokenLogo: string
  type: string
  updateDate: number
}
interface GroupConditionTokenResult {
  address: string
  decimals: string
  id: number
  list: null
  network: string
  symbol: string
  type: string
  amount: number
  token_link: string
  token_logo: string
  network_logo: string
  create_date: number
  update_date: number
}

export interface GroupConditionResult {
  address: string
  decimals: string
  id: number
  list: Array<GroupConditionTokenResult>
  network: string
  symbol: string
  type: string
  amount: number
  token_link: string
  token_logo: string
  network_logo: string
  create_date: number
  update_date: number
}
export interface GroupConditionConfigChain {
  address: string
  createDate: number
  decimals: string
  id: number
  list: Array<GroupConditionConfigToken>
  network: string
  networkLogo: string
  symbol: string
  tokenLink: string
  tokenLogo: string
  type: string
  updateDate: number
}
interface IGroupConfigResponse {
  groupConditionConfigList: Array<GroupConditionConfigChain>
  groupAvatarList: Array<string>
}
export default class AppStore {
  rootStore: Store

  userAccount: IAccountDataResponse | null = null

  isAppLoading = true

  connectError = ''

  setPasswordModalOpen = false

  onPasswordModalConfirm: ((privateKey: string) => Promise<void>) | null = null

  developerMode = false

  groupConditionsConfig: Array<GroupConditionResult> = []

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeObservable(this, {
      rootStore: observable,
      resetStore: action,
      hydrate: action,
      initUserData: flow.bound,
      userAccount: observable,
      isAppLoading: observable,
      changeIsAppLoading: action,
      dealWithSecurityKey: flow.bound,
      createSecurityKey: flow.bound,
      injectSecurityKey: flow.bound,
      connectError: observable,
      setConnectError: action,
      setPasswordModalOpen: observable,
      changeSetPasswordModalOpen: action,
      onPasswordModalConfirm: observable,
      changeOnPasswordModalConfirm: action,
      encryptSecurityKeyWithPublicKeyAndSave: flow.bound,
      decryptSecurityKeyAndLoad: flow.bound,
      developerMode: observable,
      changeDeveloperMode: action,
      matrixEventSideCallBack: action,
      groupConditionsConfig: observable,
      initGroupConfig: flow.bound,
    })
  }

  hydrate = (oldData: any) => {
    console.log('hydrate old data:', oldData)
  }

  resetStore = () => {
    this.userAccount = null
    this.isAppLoading = true
    this.connectError = ''
    this.setPasswordModalOpen = false
    this.onPasswordModalConfirm = null
    this.groupConditionsConfig = []
  }

  changeIsAppLoading = (newValue: boolean) => {
    this.isAppLoading = newValue
  }

  setConnectError = (newValue: string) => {
    this.connectError = newValue
  }

  changeOnPasswordModalConfirm = (newValue: ((privateKey: string) => Promise<void>) | null) => {
    this.onPasswordModalConfirm = newValue
  };

  *encryptSecurityKeyWithPublicKeyAndSave(recoveryKey: IRecoveryKey) {
    saveSecurityKeyIntoLocal(recoveryKey.privateKey)
    yield request.post(MatrixApi.saveMatrixSecurityKey, { security_key: recoveryKey.encodedPrivateKey } as IPostSaveMatrixSecurityKeyParams)
    this.changeSetPasswordModalOpen(false)
    this.changeIsAppLoading(false)
  }

  *decryptSecurityKeyAndLoad(decryptedSecurityKey: string, listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>>) {
    if (!initMatrix.matrixClient) {
      return this.setConnectError('initMatrix.matrixClient不存在')
    }
    const mx = initMatrix.matrixClient
    const sSKeyId = getDefaultSSKey()
    const sSKeyInfo = getSSKeyInfo(sSKeyId)
    const privateKey = mx.keyBackupKeyFromRecoveryKey(decryptedSecurityKey)
    if (!sSKeyInfo) {
      return this.setConnectError('sSKeyInfo不存在')
    }
    const isCorrect: boolean = yield mx.checkSecretStorageKey(privateKey, sSKeyInfo as SecretStorageKeyDescription)
    if (!isCorrect) {
      removeLocalSecurityKey()
      return this.setConnectError('Incorrect Security Key')
    }
    saveSecurityKeyIntoLocal(privateKey)
    const keyData = {
      keyId: sSKeyId,
      key: decryptedSecurityKey,
      phrase: undefined,
      privateKey,
    }
    storePrivateKey(keyData.keyId, keyData.privateKey)
    yield initMatrix.setupSessionIdCache(listRoomKeyPromise)
    this.changeIsAppLoading(false)
  }

  *createSecurityKey(mx: MatrixClient) {
    const recoveryKey: IRecoveryKey = yield mx.createRecoveryKeyFromPassphrase()
    clearSecretStorageKeys()

    yield mx.bootstrapSecretStorage({
      createSecretStorageKey: async () => recoveryKey,
      setupNewKeyBackup: true,
      setupNewSecretStorage: true,
    })

    const authUploadDeviceSigningKeys = async (makeRequest: (authData: any) => Promise<{}>) => {
      try {
        const isDone = await authRequest('Setup cross signing', async (auth) => {
          await makeRequest(auth)
        })
        setTimeout(() => {
          if (isDone) {
            console.log('authUploadDeviceSigningKeys Success', recoveryKey)
          } else {
            console.log('authUploadDeviceSigningKeys Failed', recoveryKey)
          }
        })
      } catch (e) {
        console.error('AuthUploadDeviceSigningKeys Error', e)
        this.setConnectError('AuthUploadDeviceSigningKeys Error')
      }
    }

    yield mx.bootstrapCrossSigning({
      authUploadDeviceSigningKeys,
      setupNewCrossSigning: true,
    })

    yield initMatrix.setupSessionIdCache()
    yield this.encryptSecurityKeyWithPublicKeyAndSave(recoveryKey)
  }

  injectSecurityKey(encodeSecurityKey: string, listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>>) {
    this.decryptSecurityKeyAndLoad(encodeSecurityKey, listRoomKeyPromise)
  }

  *dealWithSecurityKey() {
    const mx = initMatrix.matrixClient
    if (!mx) {
      return this.setConnectError('Matrix Client初始化失败')
    }
    const currentUserId = mx.getUserId()
    if (!currentUserId) {
      return this.setConnectError('没有获取到userId')
    }
    try {
      const result: AxiosResponse<IResponseType<IGetMatrixSecurityKeyResponse>> = yield request.get(MatrixApi.getMatrixSecurityKey)
      if (!(result.data.data?.user_id === currentUserId && result.data.data.security_key)) {
        console.log('用户不存在已生成的security_key')
        return this.createSecurityKey(mx as unknown as MatrixClient)
      }
      const listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>> = request.get(MatrixApi.listMatrixRoomKey)
      console.log('用户存在已生成的security_key')
      const localSecurityKey = loadSecurityKeyFromLocal()
      if (localSecurityKey) {
        return this.decryptSecurityKeyAndLoad(localSecurityKey, listRoomKeyPromise)
      }
      return this.injectSecurityKey(result.data.data.security_key, listRoomKeyPromise)
    } catch (e) {
      return this.setConnectError('网络获取securityKey失败')
    }
  }

  *initUserData() {
    // return this.changeIsAppLoading(false)
    try {
      yield this.dealWithSecurityKey()
    } catch (e) {
      console.error('initUserData Error:', e)
    }
  }

  changeSetPasswordModalOpen = (newValue: boolean) => {
    this.setPasswordModalOpen = newValue
  }

  changeDeveloperMode = (newValue: boolean) => {
    this.developerMode = newValue
  }

  matrixEventSideCallBack = (mEvent: MatrixEvent) => {
    console.log('matrixEventSideCallBack', mEvent.getType())
  };

  *initGroupConfig() {
    try {
      const result: AxiosResponse<IResponseType<IGroupConfigResponse>> = yield request.get(defedApi.getGroupConfig)
      // Current no need for groupAvatar
      // if (Array.isArray(result.groupAvatarList)) {
      //   this.groupDefaultAvatarList = result.groupAvatarList
      // }
      if (Array.isArray(result?.data?.data?.groupConditionConfigList)) {
        const newGroupConditionsConfig = result.data.data.groupConditionConfigList.map((data) => {
          let newList: Array<GroupConditionTokenResult> = []
          if (data.list?.length) {
            newList = data.list.map((item) => ({
              ...item,
              amount: 0,
              token_link: item.tokenLink,
              token_logo: item.tokenLogo,
              network_logo: item.networkLogo,
              create_date: item.createDate,
              update_date: item.updateDate,
            }))
          }
          return {
            ...data,
            list: newList,
            amount: 0,
            token_link: data.tokenLink,
            token_logo: data.tokenLogo,
            network_logo: data.networkLogo,
            create_date: data.createDate,
            update_date: data.updateDate,
          }
        })
        this.groupConditionsConfig = newGroupConditionsConfig
        return newGroupConditionsConfig
      }
      if (result?.data?.msg) {
        snackbarUtils.error(result.data.msg)
      }
    } catch (e) {
      console.error(e)
    }
  }
}
