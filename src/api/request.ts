import axios from 'axios'
import snackbarUtils from '../util/SnackbarUtils'
import cons from '../client/state/cons'
import { initializeStore } from '../stores/StoreProvider'

const request = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  timeout: 60000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(cons.secretKey.ACCESS_TOKEN)
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code !== 200) {
      if (data.code === -1) {
        // 后端服务正在重启
        throw Error(data.msg)
      }
      if (data.code === 10003) {
        snackbarUtils.error('Your access token is expired. Please login again.')
        throw Error('Your access token is expired. Please login again.')
      }
      if (data.code === 10004) {
        snackbarUtils.error('Please log in to get access token')
      }
    }
    return response
  },
  (error) => {
    if (error?.message && typeof error.message === 'string') {
      if (error.message !== 'request aboard') {
        const Store = initializeStore()
        if (Store?.appStore?.userAccount?.proxyAddress) {
          snackbarUtils.error(error.message)
        }
      }
    }
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

export { request }
