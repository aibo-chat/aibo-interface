import axios from 'axios'
import snackbarUtils from '../util/SnackbarUtils'
import cons from '../client/state/cons'

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
  (response) => response,
  (error) => {
    if (error?.message && typeof error.message === 'string') {
      snackbarUtils.error(error.message)
    }
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

const commonRequest = axios.create({
  baseURL: '',
  timeout: 60000,
})

commonRequest.interceptors.request.use((config) => config)

commonRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.message && typeof error.message === 'string') {
      snackbarUtils.error(error.message)
    }
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

export { request, commonRequest }
