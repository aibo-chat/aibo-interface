import { action, flow, makeObservable, observable } from 'mobx'
import { AxiosResponse } from 'axios'
import { IRecoveryKey } from 'matrix-js-sdk/src/crypto/api'
import { encrypt } from '@metamask/eth-sig-util'
import { SecretStorageKeyDescription } from 'matrix-js-sdk/src/secret-storage'
import { MatrixClient } from 'matrix-js-sdk/src/client'
import { MatrixEvent } from 'matrix-js-sdk'
import { Store } from './index'
import { request } from '../api/request'
import defedApi, { IResponseType } from '../api/defed-api'
import initMatrix from '../client/initMatrix'
import { clearSecretStorageKeys, storePrivateKey } from '../client/state/secretStorageKeys'
import { authRequest } from '../app/organisms/settings/AuthRequest'
import { metaMask } from '../app/connectors/metaMask'
import MatrixApi, { IGetMatrixRoomKeyResponse, IGetMatrixSecurityKeyResponse, IPostSaveMatrixSecurityKeyParams } from '../api/matrix-api'
import { getDefaultSSKey, getSSKeyInfo } from '../util/matrixUtil'
import { decryptByPrivateKey, getEncryptPublicKey } from '../util/encryptUtils'
import { loadSecurityKeyFromLocal, removeLocalSecurityKey, saveSecurityKeyIntoLocal } from '../app/utils/common'
import snackbarUtils from '../util/SnackbarUtils'
import { isProduction } from '../constant'

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

  count = 0

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
      count: observable,
      setCount: action,
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
    this.count = 0
    this.userAccount = null
    this.isAppLoading = true
    this.connectError = ''
    this.setPasswordModalOpen = false
    this.onPasswordModalConfirm = null
    this.groupConditionsConfig = []
  }

  setCount = (newValue: number) => {
    this.count = newValue
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

  *encryptSecurityKeyWithPublicKeyAndSave(publicKey: string, recoveryKey: IRecoveryKey) {
    if (!(publicKey && recoveryKey?.encodedPrivateKey)) {
      return this.setConnectError('没有获取到public_key')
    }
    console.log('获取到publicKey', publicKey)
    const encryptedSecurityKey = encrypt({
      publicKey,
      data: recoveryKey.encodedPrivateKey,
      version: 'x25519-xsalsa20-poly1305',
    })
    saveSecurityKeyIntoLocal(recoveryKey.privateKey)
    console.log('执行加密得到加密security_key', encryptedSecurityKey)
    if (!encryptedSecurityKey.ciphertext) {
      return this.setConnectError('加密securityKey失败')
    }
    yield request.post(MatrixApi.saveMatrixSecurityKey, { securityKey: JSON.stringify(encryptedSecurityKey), forceSave: true } as IPostSaveMatrixSecurityKeyParams)
    this.changeSetPasswordModalOpen(false)
    this.changeIsAppLoading(false)
  }

  *decryptSecurityKeyAndLoad(decryptedSecurityKey: string, listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>>) {
    if (!initMatrix.matrixClient) {
      return
    }
    const mx = initMatrix.matrixClient
    const sSKeyId = getDefaultSSKey()
    const sSKeyInfo = getSSKeyInfo(sSKeyId)
    const privateKey = mx.keyBackupKeyFromRecoveryKey(decryptedSecurityKey)
    if (!sSKeyInfo) {
      return
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
    if (!this.userAccount?.proxyAddress) return
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
    if (this.userAccount.addressType !== 1) {
      // 邮箱用户
      if (!this.userAccount.privateKey) {
        return this.setConnectError('邮箱用户privateKey不存在')
      }
      this.changeSetPasswordModalOpen(true)
      this.changeOnPasswordModalConfirm(async (decryptedPrivateKey: string) => {
        const publicKey = getEncryptPublicKey(decryptedPrivateKey)
        await this.encryptSecurityKeyWithPublicKeyAndSave(publicKey, recoveryKey)
      })
    } else {
      // metamask用户
      if (!this.userAccount.currentLoginAddress) {
        return this.setConnectError('账号数据中不存在CurrentLoginAddress')
      }
      if (!metaMask?.activate) {
        return this.setConnectError('metamask环境不正确')
      }
      yield metaMask.activate()
      if (!metaMask.provider) {
        return this.setConnectError('metamask链接失败')
      }
      console.log('metamask链接成功,执行metamask加密')
      if (!this.userAccount.currentLoginAddress) {
        return this.setConnectError('metamask没有查询到accounts信息')
      }
      console.log('获取metamask_accounts', this.userAccount.currentLoginAddress)
      try {
        const accounts: Array<string> = yield metaMask.provider.request({
          method: 'eth_requestAccounts',
        })
        if (accounts.indexOf(this.userAccount.currentLoginAddress) === -1) {
          yield metaMask.provider.request({
            method: 'wallet_revokePermissions',
            params: [
              {
                eth_accounts: {},
              },
            ],
          })
          return this.setConnectError(`Please connect to MetaMask with account: ${this.userAccount.currentLoginAddress}`)
        }
        const publicKey: string = yield metaMask.provider.request({
          method: 'eth_getEncryptionPublicKey',
          params: [this.userAccount.currentLoginAddress],
        })
        yield this.encryptSecurityKeyWithPublicKeyAndSave(publicKey, recoveryKey)
      } catch (e) {
        return this.setConnectError('Metamask获取publicKey失败')
      }
    }
  }

  *injectSecurityKey(mx: MatrixClient, encryptedSecurityKey: string, listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>>) {
    if (!this.userAccount?.proxyAddress) return
    if (this.userAccount.addressType === 1) {
      // metamask 用户
      if (!this.userAccount.currentLoginAddress) {
        return this.setConnectError('账号数据中不存在CurrentLoginAddress')
      }
      if (!metaMask?.activate) {
        return this.setConnectError('metamask环境不正确')
      }
      yield metaMask.activate()
      if (!metaMask.provider) {
        return this.setConnectError('metamask链接失败')
      }
      console.log('metamask链接成功,执行metamask解密')
      if (!this.userAccount.currentLoginAddress) {
        return this.setConnectError('metamask没有查询到accounts信息')
      }
      console.log('获取metamask_accounts', this.userAccount.currentLoginAddress)
      try {
        const accounts: Array<string> = yield metaMask.provider.request({
          method: 'eth_requestAccounts',
        })
        if (accounts.indexOf(this.userAccount.currentLoginAddress) === -1) {
          yield metaMask.provider.request({
            method: 'wallet_revokePermissions',
            params: [
              {
                eth_accounts: {},
              },
            ],
          })
          return this.setConnectError(`Please connect to MetaMask with account: ${this.userAccount.currentLoginAddress}`)
        }
        const decryptedSecurityKey: string = yield metaMask.provider.request({
          method: 'eth_decrypt',
          params: [encryptedSecurityKey, this.userAccount.currentLoginAddress],
        })
        this.decryptSecurityKeyAndLoad(decryptedSecurityKey, listRoomKeyPromise)
      } catch (e) {
        const decryptError = e as unknown as {
          code: number
          message: string
        }
        console.log('eth_decrypt error:', e)
        if (decryptError.code && decryptError.message) {
          return this.setConnectError(decryptError.message)
        }
      }
    } else {
      // 邮箱用户
      if (!this.userAccount.privateKey) {
        return this.setConnectError('邮箱用户privateKey不存在')
      }
      try {
        this.changeSetPasswordModalOpen(true)
        this.changeOnPasswordModalConfirm(async (decryptedPrivateKey: string) => {
          const decryptedSecurityKey = decryptByPrivateKey(decryptedPrivateKey, encryptedSecurityKey)
          await this.decryptSecurityKeyAndLoad(decryptedSecurityKey, listRoomKeyPromise)
        })
      } catch (e) {
        console.error('解密securityKey失败', e)
        return this.setConnectError('解密securityKey失败')
      }
    }
  }

  *dealWithSecurityKey() {
    if (!this.userAccount?.proxyAddress) return
    const mx = initMatrix.matrixClient
    console.log('Matrix Client已初始化')
    if (!mx) {
      return this.setConnectError('Matrix Client初始化失败')
    }
    try {
      const result: AxiosResponse<IResponseType<IGetMatrixSecurityKeyResponse>> = yield request.get(MatrixApi.getMatrixSecurityKey)
      if (result?.data?.code !== 200) {
        return this.setConnectError('网络获取securityKey不正确')
      }
      if (!(result.data.data?.proxy === this.userAccount.proxyAddress && result.data.data.securityKey)) {
        console.log('用户不存在已生成的security_key')
        return this.createSecurityKey(mx as unknown as MatrixClient)
      }
      const listRoomKeyPromise: Promise<AxiosResponse<IResponseType<IGetMatrixRoomKeyResponse>>> = request.get(MatrixApi.listMatrixRoomKey)
      console.log('用户存在已生成的security_key')
      const localSecurityKey = loadSecurityKeyFromLocal()
      if (localSecurityKey) {
        return this.decryptSecurityKeyAndLoad(localSecurityKey, listRoomKeyPromise)
      }
      return this.injectSecurityKey(mx as unknown as MatrixClient, result.data.data.securityKey, listRoomKeyPromise)
    } catch (e) {
      return this.setConnectError('网络获取securityKey失败')
    }
  }

  *initUserData(targetProxy?: string) {
    try {
      const result: AxiosResponse<IResponseType<IAccountDataResponse>> = yield request.get(defedApi.getAccountData)
      console.log('initUserData', result, targetProxy)
      if (!result?.data?.data?.proxyAddress) {
        return
      }
      if (targetProxy && result.data.data.proxyAddress !== targetProxy) {
        yield initMatrix.logout()
        return window.location.replace(`${window.location.origin}/?loginWay=defed`)
      }
      this.userAccount = result.data.data
      yield this.dealWithSecurityKey()
    } catch (e) {
      console.error('initUserData Error:', e)
      if ((e as Error)?.message !== 'Your access token is expired. Please login again.') {
        return this.setConnectError('InitUserData Error')
      }
      yield initMatrix.logout()
      return window.location.replace(`${import.meta.env.VITE_DEFED_FINANCE_URL}`)
    }
    if (!isProduction) {
      window.changeDeveloperMode = this.changeDeveloperMode
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
