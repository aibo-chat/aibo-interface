import { decrypt, getEncryptionPublicKey } from '@metamask/eth-sig-util'
import crypto from 'crypto-browserify'
import { Buffer } from 'buffer'
import scrypt from './scrypt'

export const arrayBuffer2Hex = (buffer: unknown) => {
  const hexArr = Array.prototype.map.call(buffer, (bit) => `00${bit.toString(16)}`.slice(-2))
  return hexArr.join('')
}
export const hmac256 = (data: any, salt: any) => {
  const hash = crypto.createHmac('sha256', salt)
  hash.update(data)
  const digest = hash.digest('hex')
  return digest
}
/**
 * 邮箱用户通过私钥获取到加密公钥
 */
export function getEncryptPublicKey(privateKey: string) {
  // privateKey去掉 0x 开头
  const _privateKey = privateKey.slice(2)
  return getEncryptionPublicKey(_privateKey)
}
/**
 * 邮箱用户通过私钥将加密公钥加密后的信息进行解密
 */
export function decryptByPrivateKey(privateKey: string, encryptStr: string) {
  // privateKey去掉 0x 开头
  const _privateKey = privateKey.slice(2)
  const data = JSON.parse(encryptStr)
  return decrypt({
    encryptedData: data,
    privateKey: _privateKey,
  })
}

const IV = 'DEFED-DEFE-DEFED'
const SALT = 'DEFED'
const AES_256_CBC = 'aes-256-cbc'
const KeyCache: {
  [key: string]: any
} = {}
/**
 * 不能轻易修改，否则导致所有数据不能解密
 */
const defaultsOptions = {
  N: 128, // 循环次数
  r: 1, // 总共内存
  p: 2, // 按照上面要求并行两次，然后合并结果
  // maxmem: 32 << 20,  // 32 MB, matches SCRYPT_MAX_MEM.
}
const scryptSync = (password: any, salt: any, keyLength: any, options = defaultsOptions) => scrypt(password, salt, options.N / 1, options.r / 1, options.p / 1, keyLength)
export const decryptPrivateKeyWithPassword = async (cipherText: string, password: string | number) => {
  if (!cipherText || !password) {
    throw new Error('Wrong Password!')
  }
  let data
  let key
  if (KeyCache[password as keyof typeof KeyCache]) {
    key = KeyCache[password as keyof typeof KeyCache]
  } else {
    key = await scryptSync(password, SALT, 32)
    KeyCache[password as keyof typeof KeyCache] = key
  }
  const iv = Buffer.from(IV, 'utf8')
  const decipher = crypto.createDecipheriv(AES_256_CBC, key, iv)
  data = decipher.update(cipherText, 'base64', 'utf8')
  data += decipher.final('utf8')
  return data
}
