import EventEmitter from 'events'
import * as sdk from 'matrix-js-sdk'
import Olm from '@matrix-org/olm'
import debounce from 'lodash/debounce'
import CryptoJS from 'crypto-js'
import { secret } from './state/auth'
import RoomList from './state/RoomList'
import AccountData from './state/AccountData'
import RoomsInput from './state/RoomsInput'
import Notifications from './state/Notifications'
import { cryptoCallbacks, getPrivateKey } from './state/secretStorageKeys'
import navigation from './state/navigation'
import { getDefaultSSKey } from '../util/matrixUtil'
import { arrayBuffer2Hex, hmac256 } from '../util/encryptUtils'
import { request } from '../api/request'
import MatrixApi from '../api/matrix-api'
import { initializeStore } from '../stores/StoreProvider'
import { USER_GUIDE_FLAG_KEY } from '../stores/user-relationship-store'

global.Olm = Olm

// logger.disableAll();

const StorageWhiteList = [USER_GUIDE_FLAG_KEY]
class InitMatrix extends EventEmitter {
  constructor() {
    super()

    navigation.initMatrix = this
  }

  async init() {
    try {
      if (this.matrixClient) {
        console.warn('Client is already initialized!')
        return
      }

      await this.startClient()
      this.setupSync()
      this.listenEvents()
    } catch (e) {
      console.log('initMatrixError', e)
    }
  }

  async startClient() {
    const indexedDBStore = new sdk.IndexedDBStore({
      indexedDB: global.indexedDB,
      localStorage: global.localStorage,
      dbName: 'web-sync-store',
    })
    await indexedDBStore.startup()

    this.matrixClient = sdk.createClient({
      baseUrl: secret.baseUrl,
      accessToken: secret.accessToken,
      userId: secret.userId,
      store: indexedDBStore,
      cryptoStore: new sdk.IndexedDBCryptoStore(global.indexedDB, 'crypto-store'),
      deviceId: secret.deviceId,
      timelineSupport: true,
      cryptoCallbacks,
      verificationMethods: ['m.sas.v1'],
    })

    await this.matrixClient.initCrypto()

    await this.matrixClient.startClient({
      lazyLoadMembers: true,
    })
    this.matrixClient.setGlobalErrorOnUnknownDevices(false)
  }

  setupSync() {
    const sync = {
      NULL: () => {
        console.log('NULL state')
      },
      SYNCING: () => {
        console.log('SYNCING state')
      },
      PREPARED: (prevState) => {
        console.log('PREPARED state')
        console.log('Previous state: ', prevState)
        // TODO: remove global.initMatrix at end
        global.initMatrix = this
        if (prevState === null) {
          this.roomList = new RoomList(this.matrixClient)
          this.accountData = new AccountData(this.roomList)
          this.roomsInput = new RoomsInput(this.matrixClient, this.roomList)
          this.notifications = new Notifications(this.roomList)
          this.emit('init_loading_finished')
          this.notifications._initNoti()
        } else {
          this.notifications?._initNoti()
        }
      },
      RECONNECTING: () => {
        console.log('RECONNECTING state')
      },
      CATCHUP: () => {
        console.log('CATCHUP state')
      },
      ERROR: () => {
        console.log('ERROR state')
      },
      STOPPED: () => {
        console.log('STOPPED state')
      },
    }
    this.matrixClient.on('sync', (state, prevState) => sync[state](prevState))
  }

  checkKeyUpdates = debounce(async () => {
    const cryptoApiRef = this.matrixClient.getCrypto()
    if (!cryptoApiRef) return
    const keys = await cryptoApiRef.exportRoomKeys()
    if (keys?.length) {
      try {
        console.log('RoomKeys发生变化', this.currentRoomKeyLength, '=>', keys.length)
        const finalSessions = keys.map((key) => ({
          room_id: key.room_id,
          session_id: key.session_id,
          session_key: JSON.stringify(key),
        }))
        const result = await request.post(MatrixApi.saveMatrixRoomKey, {
          time: Date.now(),
          sessions: finalSessions,
        })
        if (Array.isArray(result?.data?.data)) {
          console.log('获取增量roomKeys', result.data.data)
          await initMatrix.matrixClient.importRoomKeys(result.data.data)
        }
        this.currentRoomKeyLength = keys.length
      } catch (e) {
        console.error('checkKeyUpdates error', e)
      }
    }
  }, 1000)

  listenEvents() {
    this.matrixClient.on('Session.logged_out', async () => {
      this.matrixClient.stopClient()
      await this.matrixClient.clearStores()
      window.localStorage.clear()
      window.location.reload()
    })
    this.matrixClient.on('event', async (event) => {
      const Store = initializeStore()
      if (Store) {
        const {
          appStore: { matrixEventSideCallBack },
        } = Store
        matrixEventSideCallBack(event)
      }
      const sessionId = event?.event?.content?.session_id
      if (!this.matrixClient || !sessionId) return
      if (!this.setupSessionIdCacheDone) return
      if (!this.sessionIdCache) {
        this.sessionIdCache = {}
      }
      if (this.sessionIdCache[sessionId]) return
      this.sessionIdCache[sessionId] = true
      this.checkKeyUpdates(sessionId)
    })
  }

  async decryptRoomKeysAndInject(encryptedRoomKeys) {
    if (!this.matrixClient || !Array.isArray(encryptedRoomKeys)) return
    if (!encryptedRoomKeys.length) return
    const decryptedRoomKeys = []
    const sSKeyId = getDefaultSSKey()
    const privateKey = getPrivateKey(sSKeyId)
    if (!privateKey) return
    const hexString = arrayBuffer2Hex(privateKey)
    console.log('setupSessionIdCache 基础变量 done', Date.now())
    for (const encryptedRoomKey of encryptedRoomKeys) {
      if (!encryptedRoomKey.roomKeyText || !encryptedRoomKey.roomKeyId) return
      const hmacPrivateKey = hmac256(hexString.toLowerCase(), encryptedRoomKey.roomKeyId.toLowerCase())
      const roomKeyDecryptObject = await CryptoJS.AES.decrypt(encryptedRoomKey.roomKeyText, hmacPrivateKey)
      const roomKeyJsonString = roomKeyDecryptObject.toString(CryptoJS.enc.Utf8)
      try {
        const roomKeyJSON = JSON.parse(roomKeyJsonString)
        decryptedRoomKeys.push(roomKeyJSON)
      } catch (e) {
        console.error('解析RoomKeyJson失败', e)
      }
    }
    console.log('setupSessionIdCache decrypt done', Date.now())
    await initMatrix.matrixClient.importRoomKeys(decryptedRoomKeys)
  }

  async setupSessionIdCache(promise) {
    console.log('setupSessionIdCache start', Date.now())
    if (!this.matrixClient) return
    const cryptoApiRef = this.matrixClient.getCrypto()
    if (!cryptoApiRef) return
    // 没有promise的场景是新用户第一次进入，此时逻辑层不传入promise
    if (!promise) {
      console.log('新用户直接初始化')
      this.sessionIdCache = {}
      this.setupSessionIdCacheDone = true
      return
    }
    console.log('老用户使用网络里的RoomKeyList直接初始化')
    try {
      const result = await promise
      if (Array.isArray(result?.data?.data)) {
        const finalRoomKey = result.data.data.map((item) => {
          if (!this.sessionIdCache) {
            this.sessionIdCache = {}
          }
          if (item?.session_id) {
            this.sessionIdCache[item.session_id] = true
          }
          return JSON.parse(item.session_key || '{}')
        })
        await initMatrix.matrixClient.importRoomKeys(finalRoomKey)
        this.currentRoomKeyLength = finalRoomKey?.length
      }
    } catch (e) {
      console.error('setupSessionIdCache error', e)
    }
    this.setupSessionIdCacheDone = true
    console.log('setupSessionIdCache done', Date.now())
  }

  async logout() {
    this.matrixClient.stopClient()
    try {
      await this.matrixClient.logout()
    } catch {
      // ignore if failed to logout
    }
    await this.matrixClient.clearStores()
    this.clearStorageWithWhiteList()
    window.location.reload()
  }

  clearStorageWithWhiteList() {
    const whiteListStorageDataArray = []
    StorageWhiteList.forEach((key) => {
      const targetData = window.localStorage.getItem(key)
      whiteListStorageDataArray.push({ key, value: targetData })
    })
    window.localStorage.clear()
    whiteListStorageDataArray.forEach((item) => {
      if (item.key && item?.value) {
        window.localStorage.setItem(item.key, item.value)
      }
    })
  }

  clearCacheAndReload() {
    this.matrixClient.stopClient()
    this.matrixClient.store.deleteAllData().then(() => {
      window.location.reload()
    })
  }
}

const initMatrix = new InitMatrix()

export default initMatrix
