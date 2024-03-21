import { IconName, IconSrc } from 'folds'
import { encodeRecoveryKey } from 'matrix-js-sdk/lib/crypto/recoverykey'
import CryptoJS from 'crypto-js'
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { getAddress } from '@ethersproject/address'
import dayjs from 'dayjs'
import { toBuffer } from 'ethereumjs-util'
import { decodeBase64, encodeBase64 } from '../../util/cryptE2ERoomKeys'
import { parseMatrixAccountId, substitutionString } from '../../util/common'
import { hmac256 } from '../../util/encryptUtils'
import { metaMask } from '../connectors/metaMask'
import { request } from '../../api/request'
import DefedApi from '../../api/defed-api'

const USER_INFO_STORAGE_PREFIX = 'msg_any_user_info'
const REGEX = {
  whitespace: /\s+/g,
  urlHexPairs: /%[\dA-F]{2}/g,
  quotes: /"/g,
}
export interface ChatsNameDisplayFormatOptions {
  frontLength: number
  endLength: number
  character: string
}
export const getMapCopy = (myMap: Map<any, any>) => {
  const newMap = new Map()
  myMap.forEach((data, key) => {
    newMap.set(key, data)
  })
  return newMap
}
export const activeMetamask = async () => {
  if (!metaMask?.activate) {
    return false
  }
  await metaMask.activate()
  return metaMask.provider?.isConnected && metaMask.provider.isConnected()
}
export const chatsNameDisplay = (
  proxy: string,
  nickName?: string,
  handleName?: string,
  formatOptions: ChatsNameDisplayFormatOptions = {
    frontLength: 5,
    endLength: 5,
    character: '.',
  },
) => {
  if (nickName && nickName !== proxy) {
    return nickName
  }
  if (handleName && handleName !== proxy) {
    return handleName
  }
  return substitutionString(proxy, formatOptions.frontLength, formatOptions.endLength, formatOptions.character)
}
export function getSignature(privateKey: string, data: any) {
  return signTypedData({
    privateKey: toBuffer(privateKey),
    data,
    version: SignTypedDataVersion.V4,
  })
}

function specialHexEncode(match: string) {
  switch (match) {
    case '%20':
      return ' '
    case '%3D':
      return '='
    case '%3A':
      return ':'
    case '%2F':
      return '/'
    default:
      return match.toLowerCase()
  }
}
export const toDataURI = (string: string) =>
  `data:image/svg+xml,${encodeURIComponent(string).trim().replace(REGEX.whitespace, ' ').replace(REGEX.quotes, "'").replace(REGEX.urlHexPairs, specialHexEncode)}`
export function updateUserInfoToStorage(proxy: string, newValue: any) {
  try {
    const json = localStorage.getItem(`${USER_INFO_STORAGE_PREFIX}_${proxy.toLowerCase()}`)
    let newUser
    if (json) {
      const user = JSON.parse(json)
      newUser = {
        ...user,
        ...newValue,
        createTime: Date.now(),
      }
    } else {
      newUser = {
        ...newValue,
        createTime: Date.now(),
      }
    }
    localStorage.setItem(`${USER_INFO_STORAGE_PREFIX}_${proxy.toLowerCase()}`, JSON.stringify(newUser))
  } catch (e) {
    console.log(e)
  }
}

export function getUserInfoFromStorage(proxy: string) {
  try {
    const json = localStorage.getItem(`${USER_INFO_STORAGE_PREFIX}_${proxy.toLowerCase()}`)
    if (!json) return null
    const user = JSON.parse(json)
    if (user && user.createTime && Date.now() < user.createTime + 60 * 60 * 1000) {
      return user
    }
  } catch (e) {
    console.log(e)
  }
  return null
}

export const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0KB'

  let sizeIndex = Math.floor(Math.log(bytes) / Math.log(1000))

  if (sizeIndex === 0) sizeIndex = 1

  return `${(bytes / 1000 ** sizeIndex).toFixed(1)} ${sizes[sizeIndex]}`
}

export const millisecondsToMinutesAndSeconds = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds % 60)
  return `${mm}:${ss < 10 ? '0' : ''}${ss}`
}

export const secondsToMinutesAndSeconds = (seconds: number): string => {
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds % 60)
  return `${mm}:${ss < 10 ? '0' : ''}${ss}`
}

export const getFileTypeIcon = (icons: Record<IconName, IconSrc>, fileType: string): IconSrc => {
  const type = fileType.toLowerCase()
  if (type.startsWith('audio')) {
    return icons.Play
  }
  if (type.startsWith('video')) {
    return icons.Vlc
  }
  if (type.startsWith('image')) {
    return icons.Photo
  }
  return icons.File
}

export const fulfilledPromiseSettledResult = <T>(prs: PromiseSettledResult<T>[]): T[] =>
  prs.reduce<T[]>((values, pr) => {
    if (pr.status === 'fulfilled') values.push(pr.value)
    return values
  }, [])

export const binarySearch = <T>(items: T[], match: (item: T) => -1 | 0 | 1): T | undefined => {
  const search = (start: number, end: number): T | undefined => {
    if (start > end) return undefined

    const mid = Math.floor((start + end) / 2)

    const result = match(items[mid])
    if (result === 0) return items[mid]

    if (result === 1) return search(start, mid - 1)
    return search(mid + 1, end)
  }

  return search(0, items.length - 1)
}

export const randomNumberBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const scaleYDimension = (x: number, scaledX: number, y: number): number => {
  const scaleFactor = scaledX / x
  return scaleFactor * y
}

export const parseGeoUri = (location: string) => {
  const [, data] = location.split(':')
  const [cords] = data.split(';')
  const [latitude, longitude] = cords.split(',')
  return {
    latitude,
    longitude,
  }
}

const LOCAL_SECURITY_KEY = '___'
export const saveSecurityKeyIntoLocal = (privateKey: Uint8Array) => {
  if (!privateKey) return
  const base64Key = encodeBase64(privateKey)
  const userId = window.localStorage.getItem('cinny_user_id')
  if (!userId) return
  const proxy = parseMatrixAccountId(userId).toLowerCase()
  const pwd = hmac256(proxy, 'security-key')
  const encryptionKey = CryptoJS.AES.encrypt(base64Key, pwd).toString()
  window.localStorage.setItem(LOCAL_SECURITY_KEY, encryptionKey)
}

export const loadSecurityKeyFromLocal = () => {
  const encryptionKey = localStorage.getItem(LOCAL_SECURITY_KEY)
  if (!encryptionKey) {
    return ''
  }
  try {
    const userId = window.localStorage.getItem('cinny_user_id')
    if (!userId) return
    const proxy = parseMatrixAccountId(userId).toLowerCase()
    const pwd = hmac256(proxy, 'security-key')
    const decodeKey = CryptoJS.AES.decrypt(encryptionKey, pwd).toString(CryptoJS.enc.Utf8)
    if (!decodeKey) {
      removeLocalSecurityKey()
      return ''
    }
    const privateKey = decodeBase64(decodeKey)
    const securityKey = encodeRecoveryKey(privateKey)
    return securityKey || ''
  } catch (e) {
    console.log(e)
  }
  return ''
}

export const removeLocalSecurityKey = () => {
  window.localStorage.setItem(LOCAL_SECURITY_KEY, '')
}

export const postUploadPicture = (file: File) =>
  request({
    url: DefedApi.uploadFile,
    data: { file },
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = window.atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 *
 * @param time 毫秒级
 * @returns 格式化的time
 */
export function formatTime(time: number | undefined) {
  const diffHour = dayjs().diff(time, 'h')
  if (diffHour >= 24) {
    return dayjs(time).format('MMM D, YYYY')
  }
  return dayjs(time).fromNow()
}

export function isAddress(address: string): boolean {
  try {
    getAddress(address)
    return true
  } catch (error) {}
  return false
}
